<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use OwenIt\Auditing\Models\Audit;
use Carbon\Carbon;

class SecuriteController extends Controller
{
    public function analyserComportements(Request $request)
    {
        $depuis = Carbon::now()->subDays($request->integer('jours', 7));

        $audits = Audit::where('created_at', '>=', $depuis)
            ->whereNotNull('user_id')
            ->get();

        $parUtilisateur = $audits->groupBy('user_id');
        $payload = [];

        foreach ($parUtilisateur as $userId => $actions) {
            $user = User::find($userId);
            if (!$user) continue;

            $horsHoraires = $actions->filter(function ($a) {
                $heure = Carbon::parse($a->created_at)->hour;
                return $heure < 6 || $heure >= 22;
            })->count();

            $payload[] = [
                'user_id' => $user->id,
                'username' => $user->username,
                'total_actions' => $actions->count(),
                'creations' => $actions->where('event', 'created')->count(),
                'modifications' => $actions->where('event', 'updated')->count(),
                'suppressions' => $actions->where('event', 'deleted')->count(),
                'ip_distinctes' => $actions->pluck('ip_address')->filter()->unique()->count(),
                'actions_hors_horaires' => $horsHoraires,
                'types_actes_distincts' => $actions->pluck('auditable_type')->unique()->count(),
            ];
        }

        if (empty($payload)) {
            return response()->json(['alertes' => [], 'total_utilisateurs_analyses' => 0]);
        }

        $response = Http::timeout(5)->post(
            config('services.ai_microservice.url') . '/detect-suspicious-behavior',
            ['utilisateurs' => $payload]
        );

        if ($response->failed()) {
            return response()->json(['message' => 'Microservice IA indisponible'], 503);
        }

        return response()->json($response->json());
    }
}