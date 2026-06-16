<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class OCRController extends Controller
{
    public function extract(Request $request)
    {
        $request->validate([
            'image_base64' => 'required|string',
            'media_type'   => 'required|string|in:image/jpeg,image/png,image/jpg,image/webp',
            'type'         => 'required|string|in:cni,acte',
        ]);

        $apiKey = config('services.anthropic.api_key');
        $model  = config('services.anthropic.model', 'claude-sonnet-4-6');

        $prompt = $request->type === 'cni'
            ? "Tu es un système OCR expert pour les CNI camerounaises. Extrais les informations de cette image et retourne UNIQUEMENT un objet JSON valide avec les clés: nom (nom complet en majuscules), date_naiss (format YYYY-MM-DD ou null), lieu_naiss (lieu de naissance ou null), sexe (M ou F ou null). Si une information est illisible, mets null. Réponds uniquement avec le JSON, aucun texte autour."
            : "Tu es un système OCR expert pour les actes d'état civil camerounais. Extrais les informations et retourne UNIQUEMENT un objet JSON avec: nom, date_naiss (YYYY-MM-DD), lieu_naiss. Réponds uniquement avec le JSON.";

        $response = Http::withOptions([
            'curl' => [CURLOPT_RESOLVE => ['api.anthropic.com:443:160.79.104.10']],
        ])->withHeaders([
            'x-api-key'         => $apiKey,
            'anthropic-version' => '2023-06-01',
            'content-type'      => 'application/json',
        ])->timeout(30)->post('https://api.anthropic.com/v1/messages', [
            'model'      => $model,
            'max_tokens' => 256,
            'messages'   => [[
                'role'    => 'user',
                'content' => [
                    [
                        'type'   => 'image',
                        'source' => [
                            'type'       => 'base64',
                            'media_type' => $request->media_type,
                            'data'       => $request->image_base64,
                        ],
                    ],
                    ['type' => 'text', 'text' => $prompt],
                ],
            ]],
        ]);

        if ($response->failed()) {
            return response()->json(['error' => 'Service OCR indisponible.'], 502);
        }

        $text = $response->json('content.0.text', '{}');
        preg_match('/\{.*\}/s', $text, $matches);
        $data = json_decode($matches[0] ?? '{}', true) ?? [];

        return response()->json($data);
    }
}
