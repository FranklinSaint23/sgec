<?php

namespace App\Services;

use App\Models\ActeNaissance;
use App\Models\ActeMariage;
use App\Models\ActeDeces;
use Illuminate\Support\Facades\Http;

class DuplicateDetectionService
{
    public function checkNaissance(array $nouvelActe): array
    {
        $candidats = ActeNaissance::whereYear('date_naiss', date('Y', strtotime($nouvelActe['date_naiss'])))
            ->orWhere('nom', 'like', substr($nouvelActe['nom'], 0, 3) . '%')
            ->limit(50)
            ->get(['id', 'nom', 'date_naiss', 'nom_pere', 'nom_mere']);

        if ($candidats->isEmpty()) {
            return [];
        }

        $response = Http::timeout(5)->post(config('services.ai_microservice.url') . '/detect-duplicate/naissance', [
            'nouvel_acte' => $nouvelActe,
            'candidats' => $candidats->toArray(),
            'seuil' => 0.80,
        ]);

        if ($response->failed()) {
            return []; // on n'empêche jamais la saisie si l'IA est indisponible
        }

        return $response->json('doublons_potentiels', []);
    }

    public function checkMariage(array $nouvelActe): array
    {
        $candidats = ActeMariage::where('nom_homme', 'like', substr($nouvelActe['nom_homme'] ?? '', 0, 3) . '%')
            ->orWhere('nom_femme', 'like', substr($nouvelActe['nom_femme'] ?? '', 0, 3) . '%')
            ->limit(50)
            ->get(['id', 'nom_homme', 'nom_femme', 'date_naiss_homme', 'date_naiss_femme']);

        if ($candidats->isEmpty()) return [];

        $response = Http::timeout(5)->post(config('services.ai_microservice.url') . '/detect-duplicate/mariage', [
            'nouvel_acte' => $nouvelActe,
            'candidats'   => $candidats->toArray(),
            'seuil'       => 0.80,
        ]);

        if ($response->failed()) return [];

        return $response->json('doublons_potentiels', []);
    }

    public function checkDeces(array $nouvelActe): array
    {
        $candidats = ActeDeces::where('nom_decede', 'like', substr($nouvelActe['nom_decede'] ?? '', 0, 3) . '%')
            ->orWhere('date_deces', $nouvelActe['date_deces'] ?? null)
            ->limit(50)
            ->get(['id', 'nom_decede', 'date_deces', 'lieu_deces']);

        if ($candidats->isEmpty()) return [];

        $response = Http::timeout(5)->post(config('services.ai_microservice.url') . '/detect-duplicate/deces', [
            'nouvel_acte' => $nouvelActe,
            'candidats'   => $candidats->toArray(),
            'seuil'       => 0.80,
        ]);

        if ($response->failed()) return [];

        return $response->json('doublons_potentiels', []);
    }
}