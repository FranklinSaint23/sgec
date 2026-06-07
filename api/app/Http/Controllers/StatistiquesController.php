<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ActeNaissance;
use App\Models\ActeDeces;
use App\Models\ActeMariage;
use App\Models\User;
use OwenIt\Auditing\Models\Audit;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class StatistiquesController extends Controller
{
    public function index()
    {
        $year = Carbon::now()->year;

        return response()->json([
            "totalNaissances" => ActeNaissance::count(),
            "totalDeces" => ActeDeces::count(),
            "totalMariages" => ActeMariage::count(),
            "totalUsers" => User::count(),

            "repartitionSexe" => [
                "M" => ActeNaissance::where('sexe', 'M')->count(),
                "F" => ActeNaissance::where('sexe', 'F')->count(),
            ],
            "decesSexe" => [
                "M" => ActeDeces::where('sexe', 'M')->count(),
                "F" => ActeDeces::where('sexe', 'F')->count(),
            ],

            // ✅ Corrigé Carbon
            "actesMensuels" => collect(range(1,12))->map(fn($m)=>[
                "mois" => Carbon::createFromDate(null, $m, 1)->locale('fr_FR')->monthName,
                "naiss" => ActeNaissance::whereYear('created_at',$year)->whereMonth('created_at',$m)->count(),
                "deces" => ActeDeces::whereYear('created_at',$year)->whereMonth('created_at',$m)->count(),
            ]),
            "decesMensuels" => collect(range(1,12))->map(fn($m)=>[
                "mois" => Carbon::createFromDate(null, $m, 1)->locale('fr_FR')->monthName,
                "total" => ActeDeces::whereYear('created_at',$year)->whereMonth('created_at',$m)->count(),
            ]),

            "ratioDecesNaissances" => ActeNaissance::count() > 0
                ? round((ActeDeces::count() / ActeNaissance::count()) * 100, 2)
                : 0,

            "roles" => User::select('role', DB::raw('count(*) as total'))
                ->groupBy('role')
                ->pluck('total','role'),

            "dernieresConnexions" => User::select('username','last_login_at')
                ->orderByDesc('last_login_at')
                ->take(5)
                ->get(),

            "journalActions" => Audit::count(),

            // ✅ Corrigé topUsers
            "topUsers" => Audit::select('user_id', DB::raw('count(*) as actions'))
                ->groupBy('user_id')
                ->orderByDesc('actions')
                ->take(5)
                ->get()
                ->map(fn($a)=>[
                    "username" => User::find($a->user_id)?->username ?? "Inconnu",
                    "actions" => $a->actions
                ]),
        ]);
    }
}
