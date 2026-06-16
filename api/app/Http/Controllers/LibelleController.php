<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class LibelleController extends Controller
{
    public function generer(Request $request)
    {
        $request->validate([
            'type' => 'required|string|in:naissance,mariage,deces',
            'data' => 'required|array',
        ]);

        $apiKey = config('services.anthropic.api_key');
        $model  = config('services.anthropic.model', 'claude-sonnet-4-6');
        $type   = $request->type;
        $data   = $request->data;
        $dataJson = json_encode($data, JSON_UNESCAPED_UNICODE);

        $prompts = [
            'naissance' => "Tu es un officier d'état civil camerounais expert. Rédige le libellé officiel d'un ACTE DE NAISSANCE en français juridique formel, selon la loi camerounaise N°2011/011. Commence par «L'an deux mille...» et inclus toutes les mentions légales. Données de l'acte : {$dataJson}. 150 à 200 mots, style officiel.",
            'mariage'   => "Tu es un officier d'état civil camerounais expert. Rédige le libellé officiel d'un ACTE DE MARIAGE en français juridique formel, selon la loi camerounaise. Commence par «L'an deux mille...». Données : {$dataJson}. 150 à 200 mots.",
            'deces'     => "Tu es un officier d'état civil camerounais expert. Rédige le libellé officiel d'un ACTE DE DÉCÈS en français juridique formel, selon la loi camerounaise. Commence par «L'an deux mille...». Données : {$dataJson}. 150 à 200 mots.",
        ];

        $response = Http::withOptions([
            'curl' => [CURLOPT_RESOLVE => ['api.anthropic.com:443:160.79.104.10']],
        ])->withHeaders([
            'x-api-key'         => $apiKey,
            'anthropic-version' => '2023-06-01',
            'content-type'      => 'application/json',
        ])->timeout(30)->post('https://api.anthropic.com/v1/messages', [
            'model'      => $model,
            'max_tokens' => 600,
            'messages'   => [['role' => 'user', 'content' => $prompts[$type]]],
        ]);

        if ($response->failed()) {
            return response()->json(['error' => 'Erreur génération libellé.'], 502);
        }

        return response()->json([
            'libelle' => $response->json('content.0.text', ''),
        ]);
    }
}
