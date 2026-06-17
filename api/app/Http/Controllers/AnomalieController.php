<?php

namespace App\Http\Controllers;

use App\Models\ActeNaissance;
use App\Models\ActeMariage;
use App\Models\ActeDeces;
use Carbon\Carbon;

class AnomalieController extends Controller
{
    public function index()
    {
        $anomalies = [];
        $seuil     = 10;
        $maintenant = Carbon::now();
        $ilYaUneHeure = $maintenant->copy()->subHour();

        // Volume anormal par secrétaire dans la dernière heure
        $checks = [
            ['model' => ActeNaissance::class, 'label' => 'naissance'],
            ['model' => ActeDeces::class,     'label' => 'décès'],
            ['model' => ActeMariage::class,   'label' => 'mariage'],
        ];

        foreach ($checks as $check) {
            $volumes = $check['model']::whereBetween('created_at', [$ilYaUneHeure, $maintenant])
                ->selectRaw('secretaire, count(*) as total')
                ->groupBy('secretaire')
                ->havingRaw('count(*) >= ?', [$seuil])
                ->get();

            foreach ($volumes as $v) {
                $anomalies[] = [
                    'type'     => 'volume_anormal',
                    'severite' => 'haute',
                    'message'  => "Secrétaire «{$v->secretaire}» a enregistré {$v->total} actes de {$check['label']} en moins d'une heure.",
                ];
            }
        }

        // Actes de décès récents sans acte de naissance correspondant
        $decesSansNaiss = ActeDeces::latest()->take(30)->get()->filter(function ($d) {
            $prefix = substr($d->nom_decede ?? '', 0, 4);
            return $prefix && ActeNaissance::where('nom', 'like', $prefix . '%')->doesntExist();
        })->take(5);

        foreach ($decesSansNaiss as $d) {
            $anomalies[] = [
                'type'     => 'croisement_manquant',
                'severite' => 'moyenne',
                'message'  => "Acte de décès «{$d->nom_decede}» (#{$d->numero_acte}) : aucun acte de naissance correspondant trouvé.",
            ];
        }

        return response()->json([
            'anomalies'   => $anomalies,
            'total'       => count($anomalies),
            'generee_le'  => $maintenant->format('d/m/Y H:i'),
        ]);
    }
}
