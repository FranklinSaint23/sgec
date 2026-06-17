<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CarteController extends Controller
{
    public function tous()
    {
        $naissances = DB::select("
            SELECT id, numero_acte, nom, CAST(date_naiss AS VARCHAR) as date_label,
                   'naissance' as type,
                   ST_X(coordonnees::geometry) as longitude,
                   ST_Y(coordonnees::geometry) as latitude
            FROM actes_naissance WHERE coordonnees IS NOT NULL
        ");

        $deces = DB::select("
            SELECT id, numero_acte, nom_decede as nom, CAST(date_deces AS VARCHAR) as date_label,
                   'deces' as type,
                   ST_X(coordonnees::geometry) as longitude,
                   ST_Y(coordonnees::geometry) as latitude
            FROM actes_deces WHERE coordonnees IS NOT NULL
        ");

        $mariages = DB::select("
            SELECT id, numero_acte,
                   CONCAT(COALESCE(nom_homme,'?'), ' & ', COALESCE(nom_femme,'?')) as nom,
                   CAST(contracte_le AS VARCHAR) as date_label,
                   'mariage' as type,
                   ST_X(coordonnees::geometry) as longitude,
                   ST_Y(coordonnees::geometry) as latitude
            FROM actes_mariage WHERE coordonnees IS NOT NULL
        ");

        $all = array_merge($naissances, $deces, $mariages);

        return response()->json($this->toGeoJSON($all));
    }

    public function naissances()
    {
        $actes = DB::select("
            SELECT id, numero_acte, nom, CAST(date_naiss AS VARCHAR) as date_label,
                   sexe, 'naissance' as type,
                   ST_X(coordonnees::geometry) as longitude,
                   ST_Y(coordonnees::geometry) as latitude
            FROM actes_naissance WHERE coordonnees IS NOT NULL
            ORDER BY date_naiss DESC
        ");
        return response()->json($this->toGeoJSON($actes));
    }

    public function deces()
    {
        $actes = DB::select("
            SELECT id, numero_acte, nom_decede as nom, CAST(date_deces AS VARCHAR) as date_label,
                   sexe, 'deces' as type,
                   ST_X(coordonnees::geometry) as longitude,
                   ST_Y(coordonnees::geometry) as latitude
            FROM actes_deces WHERE coordonnees IS NOT NULL
            ORDER BY date_deces DESC
        ");
        return response()->json($this->toGeoJSON($actes));
    }

    public function mariages()
    {
        $actes = DB::select("
            SELECT id, numero_acte,
                   CONCAT(COALESCE(nom_homme,'?'), ' & ', COALESCE(nom_femme,'?')) as nom,
                   CAST(contracte_le AS VARCHAR) as date_label,
                   'mariage' as type,
                   ST_X(coordonnees::geometry) as longitude,
                   ST_Y(coordonnees::geometry) as latitude
            FROM actes_mariage WHERE coordonnees IS NOT NULL
            ORDER BY contracte_le DESC
        ");
        return response()->json($this->toGeoJSON($actes));
    }

    public function proximite(Request $request)
    {
        $request->validate([
            'lat'   => 'required|numeric',
            'lng'   => 'required|numeric',
            'rayon' => 'sometimes|numeric|min:100|max:50000',
            'type'  => 'sometimes|in:naissance,deces,mariage',
        ]);

        $lat   = (float) $request->lat;
        $lng   = (float) $request->lng;
        $rayon = (float) ($request->rayon ?? 5000);
        $type  = $request->type;

        $results = [];

        if (!$type || $type === 'naissance') {
            $results = array_merge($results, DB::select("
                SELECT id, numero_acte, nom, CAST(date_naiss AS VARCHAR) as date_label,
                       'naissance' as type,
                       ST_X(coordonnees::geometry) as longitude,
                       ST_Y(coordonnees::geometry) as latitude,
                       ROUND(ST_Distance(coordonnees, ST_MakePoint(?, ?)::geography)::numeric, 0) as distance_m
                FROM actes_naissance
                WHERE coordonnees IS NOT NULL
                  AND ST_DWithin(coordonnees, ST_MakePoint(?, ?)::geography, ?)
            ", [$lng, $lat, $lng, $lat, $rayon]));
        }

        if (!$type || $type === 'deces') {
            $results = array_merge($results, DB::select("
                SELECT id, numero_acte, nom_decede as nom, CAST(date_deces AS VARCHAR) as date_label,
                       'deces' as type,
                       ST_X(coordonnees::geometry) as longitude,
                       ST_Y(coordonnees::geometry) as latitude,
                       ROUND(ST_Distance(coordonnees, ST_MakePoint(?, ?)::geography)::numeric, 0) as distance_m
                FROM actes_deces
                WHERE coordonnees IS NOT NULL
                  AND ST_DWithin(coordonnees, ST_MakePoint(?, ?)::geography, ?)
            ", [$lng, $lat, $lng, $lat, $rayon]));
        }

        if (!$type || $type === 'mariage') {
            $results = array_merge($results, DB::select("
                SELECT id, numero_acte,
                       CONCAT(COALESCE(nom_homme,'?'), ' & ', COALESCE(nom_femme,'?')) as nom,
                       CAST(contracte_le AS VARCHAR) as date_label,
                       'mariage' as type,
                       ST_X(coordonnees::geometry) as longitude,
                       ST_Y(coordonnees::geometry) as latitude,
                       ROUND(ST_Distance(coordonnees, ST_MakePoint(?, ?)::geography)::numeric, 0) as distance_m
                FROM actes_mariage
                WHERE coordonnees IS NOT NULL
                  AND ST_DWithin(coordonnees, ST_MakePoint(?, ?)::geography, ?)
            ", [$lng, $lat, $lng, $lat, $rayon]));
        }

        usort($results, fn($a, $b) => $a->distance_m <=> $b->distance_m);

        return response()->json([
            'centre'  => ['lat' => $lat, 'lng' => $lng],
            'rayon_m' => $rayon,
            'total'   => count($results),
            'data'    => $this->toGeoJSON($results),
        ]);
    }

    public function statsParZone(Request $request)
    {
        $request->validate([
            'niveau' => 'required|in:regions,departements,arrondissements',
            'type'   => 'sometimes|in:naissance,deces,mariage',
        ]);

        $niveau = $request->niveau;
        $type   = $request->type;

        $table  = 'zones_' . $niveau;
        $nomCol = match($niveau) {
            'regions'          => 'nom_reg',
            'departements'     => 'nom_dep',
            'arrondissements'  => 'nom_arr',
        };
        $parentCol = match($niveau) {
            'regions'          => 'null as parent',
            'departements'     => 'z.nom_reg as parent',
            'arrondissements'  => 'z.nom_dep as parent',
        };

        $counts = [];

        if (!$type || $type === 'naissance') {
            $rows = DB::select("
                SELECT z.{$nomCol} as nom, {$parentCol},
                       COUNT(a.id) as total
                FROM {$table} z
                LEFT JOIN actes_naissance a
                       ON a.coordonnees IS NOT NULL
                      AND ST_Within(a.coordonnees::geometry, z.geom)
                GROUP BY z.{$nomCol}" . ($niveau !== 'regions' ? ", z.nom_reg" : "") . ($niveau === 'arrondissements' ? ", z.nom_dep" : "")
            );
            foreach ($rows as $r) {
                $counts[$r->nom]['nom']       = $r->nom;
                $counts[$r->nom]['parent']    = $r->parent ?? null;
                $counts[$r->nom]['naissance'] = (int) $r->total;
            }
        }

        if (!$type || $type === 'deces') {
            $rows = DB::select("
                SELECT z.{$nomCol} as nom, {$parentCol},
                       COUNT(a.id) as total
                FROM {$table} z
                LEFT JOIN actes_deces a
                       ON a.coordonnees IS NOT NULL
                      AND ST_Within(a.coordonnees::geometry, z.geom)
                GROUP BY z.{$nomCol}" . ($niveau !== 'regions' ? ", z.nom_reg" : "") . ($niveau === 'arrondissements' ? ", z.nom_dep" : "")
            );
            foreach ($rows as $r) {
                $counts[$r->nom]['nom']    = $r->nom;
                $counts[$r->nom]['parent'] = $r->parent ?? null;
                $counts[$r->nom]['deces']  = (int) $r->total;
            }
        }

        if (!$type || $type === 'mariage') {
            $rows = DB::select("
                SELECT z.{$nomCol} as nom, {$parentCol},
                       COUNT(a.id) as total
                FROM {$table} z
                LEFT JOIN actes_mariage a
                       ON a.coordonnees IS NOT NULL
                      AND ST_Within(a.coordonnees::geometry, z.geom)
                GROUP BY z.{$nomCol}" . ($niveau !== 'regions' ? ", z.nom_reg" : "") . ($niveau === 'arrondissements' ? ", z.nom_dep" : "")
            );
            foreach ($rows as $r) {
                $counts[$r->nom]['nom']     = $r->nom;
                $counts[$r->nom]['parent']  = $r->parent ?? null;
                $counts[$r->nom]['mariage'] = (int) $r->total;
            }
        }

        // Calculer le total et trier
        $result = array_values(array_map(function ($z) {
            $z['naissance'] = $z['naissance'] ?? 0;
            $z['deces']     = $z['deces']     ?? 0;
            $z['mariage']   = $z['mariage']   ?? 0;
            $z['total']     = $z['naissance'] + $z['deces'] + $z['mariage'];
            return $z;
        }, $counts));

        usort($result, fn($a, $b) => $b['total'] <=> $a['total']);

        return response()->json([
            'niveau'  => $niveau,
            'zones'   => $result,
            'max'     => $result[0]['total'] ?? 0,
        ]);
    }

    public function stats()
    {
        $naissance = DB::scalar("SELECT COUNT(*) FROM actes_naissance WHERE coordonnees IS NOT NULL");
        $deces     = DB::scalar("SELECT COUNT(*) FROM actes_deces     WHERE coordonnees IS NOT NULL");
        $mariage   = DB::scalar("SELECT COUNT(*) FROM actes_mariage   WHERE coordonnees IS NOT NULL");

        // Densité par zone géographique (~11 km²) — arrondi à 1 décimale
        $zones = DB::select("
            SELECT
                ROUND(ST_Y(coordonnees::geometry)::numeric, 1) AS lat_zone,
                ROUND(ST_X(coordonnees::geometry)::numeric, 1) AS lng_zone,
                type,
                COUNT(*) AS total
            FROM (
                SELECT coordonnees, 'naissance' AS type FROM actes_naissance WHERE coordonnees IS NOT NULL
                UNION ALL
                SELECT coordonnees, 'deces'     AS type FROM actes_deces     WHERE coordonnees IS NOT NULL
                UNION ALL
                SELECT coordonnees, 'mariage'   AS type FROM actes_mariage   WHERE coordonnees IS NOT NULL
            ) combined
            GROUP BY lat_zone, lng_zone, type
            ORDER BY total DESC
            LIMIT 50
        ");

        return response()->json([
            'totaux' => [
                'naissance' => (int) $naissance,
                'deces'     => (int) $deces,
                'mariage'   => (int) $mariage,
                'total'     => (int) $naissance + (int) $deces + (int) $mariage,
            ],
            'zones' => $zones,
        ]);
    }

    private function toGeoJSON(array $actes): array
    {
        $features = array_map(function ($acte) {
            $props = (array) $acte;
            $lng = (float) $props['longitude'];
            $lat = (float) $props['latitude'];
            unset($props['longitude'], $props['latitude']);

            return [
                'type'     => 'Feature',
                'geometry' => ['type' => 'Point', 'coordinates' => [$lng, $lat]],
                'properties' => $props,
            ];
        }, $actes);

        return ['type' => 'FeatureCollection', 'features' => $features];
    }
}
