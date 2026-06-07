<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Cache;
use App\Models\User;
use App\Models\ActeNaissance;
use App\Models\ActeMariage;
use App\Models\ActeDeces;

class DashboardController extends Controller
{
    /**
     * GET /api/dashboard-stats
     * Retourne les compteurs du tableau de bord.
     */
    public function stats()
    {
        $stats = Cache::remember('dashboard.stats', 60, function () {
            return [
                'actes_naissance' => ActeNaissance::count(),
                'actes_mariage'   => ActeMariage::count(),
                'actes_deces'     => ActeDeces::count(),
                'users'    => User::count(),
            ];
        });

        return response()->json($stats);
    }

    /**
     * GET /api/actes/latest
     * Retourne les 5 derniers actes tout type confondu.
     */
    public function latestActes()
    {
        $items = Cache::remember('dashboard.latest_actes', 60, function () {
            $collect = collect();

            // Naissances
            $naissances = ActeNaissance::latest()->take(5)->get()->map(function ($a) {
                return [
                    'id'     => "N-{$a->id}",
                    'numero' => $a->numero_acte ?? '—',
                    'type'   => 'Naissance',
                    'nom'    => $a->nom ?? '—',
                    'date'   => optional($a->created_at)->toDateTimeString(),
                ];
            });

            // Mariages
            $mariages = ActeMariage::latest()->take(5)->get()->map(function ($a) {
                $nom = ($a->nom_homme ?? '—') . ' & ' . ($a->nom_femme ?? '—');
                return [
                    'id'     => "M-{$a->id}",
                    'numero' => $a->numero_acte ?? '—',
                    'type'   => 'Mariage',
                    'nom'    => $nom,
                    'date'   => optional($a->created_at)->toDateTimeString(),
                ];
            });

            // Décès
            $deces = ActeDeces::latest()->take(5)->get()->map(function ($a) {
                return [
                    'id'     => "D-{$a->id}",
                    'numero' => $a->numero_acte ?? '—',
                    'type'   => 'Décès',
                    'nom'    => $a->nom_decede ?? '—',
                    'date'   => optional($a->created_at)->toDateTimeString(),
                ];
            });

            return $collect->merge($naissances)
                           ->merge($mariages)
                           ->merge($deces)
                           ->sortByDesc('date')
                           ->values()
                           ->take(5)
                           ->all();
        });

        return response()->json($items);
    }
}
