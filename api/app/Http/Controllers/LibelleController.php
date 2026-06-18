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

        $apiKey   = config('services.groq.api_key');
        $model    = config('services.groq.model');
        $type     = $request->type;
        $dataJson = json_encode($request->data, JSON_UNESCAPED_UNICODE);

        $system = "Tu es un officier d'état civil camerounais expert en rédaction d'actes officiels selon la loi camerounaise N°2011/011.";

        $prompts = [
            'naissance' => "Rédige le libellé officiel d'un ACTE DE NAISSANCE en français juridique formel. Commence par «L'an deux mille...» et inclus toutes les mentions légales. Données : {$dataJson}. Entre 150 et 200 mots, style officiel.",
            'mariage'   => "Rédige le libellé officiel d'un ACTE DE MARIAGE en français juridique formel. Commence par «L'an deux mille...». Données : {$dataJson}. Entre 150 et 200 mots.",
            'deces'     => "Rédige le libellé officiel d'un ACTE DE DÉCÈS en français juridique formel. Commence par «L'an deux mille...». Données : {$dataJson}. Entre 150 et 200 mots.",
        ];

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $apiKey,
                'Content-Type'  => 'application/json',
            ])->timeout(30)->post('https://api.groq.com/openai/v1/chat/completions', [
                'model'      => $model,
                'max_tokens' => 600,
                'messages'   => [
                    ['role' => 'system', 'content' => $system],
                    ['role' => 'user',   'content' => $prompts[$type]],
                ],
            ]);

            if ($response->failed()) {
                return response()->json(['error' => 'Erreur génération libellé.'], 502);
            }

            return response()->json([
                'libelle' => $response->json('choices.0.message.content', ''),
            ]);

        } catch (\Exception $e) {
            return response()->json(['error' => 'Erreur réseau : ' . $e->getMessage()], 500);
        }
    }
}
