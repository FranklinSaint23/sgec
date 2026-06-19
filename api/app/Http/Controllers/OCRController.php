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
            'type'         => 'required|string|in:cni,acte,naissance_complete',
        ]);

        $apiKey = config('services.groq.api_key');
        $model  = config('services.groq.model_vision');

        if ($request->type === 'naissance_complete') {
            $prompt = "Tu es un système OCR expert pour les documents d'état civil camerounais. Ce document contient les informations d'une déclaration de naissance. Extrais TOUTES les informations et retourne UNIQUEMENT un objet JSON valide avec exactement ces clés (null si absent): nom (nom complet enfant en majuscules), date_naiss (YYYY-MM-DDTHH:MM ou YYYY-MM-DD), lieu (lieu de naissance enfant), sexe (M ou F), nom_pere, date_naiss_pere (YYYY-MM-DD), lieu_naiss_pere, domicile_pere, profession_pere, nom_mere, date_naiss_mere (YYYY-MM-DD), lieu_naiss_mere, domicile_mere, profession_mere. Réponds uniquement avec le JSON, aucun texte autour.";
        } elseif ($request->type === 'cni') {
            $prompt = "Tu es un système OCR expert pour les CNI camerounaises. Extrais les informations de cette image et retourne UNIQUEMENT un objet JSON valide avec les clés: nom (nom complet en majuscules), date_naiss (format YYYY-MM-DD ou null), lieu_naiss (lieu de naissance ou null), sexe (M ou F ou null), profession (profession ou null), domicile (adresse de résidence ou null). Si une information est illisible, mets null. Réponds uniquement avec le JSON, aucun texte autour.";
        } else {
            $prompt = "Tu es un système OCR expert pour les actes d'état civil camerounais. Extrais les informations et retourne UNIQUEMENT un objet JSON avec: nom, date_naiss (YYYY-MM-DD), lieu_naiss, profession, domicile. Réponds uniquement avec le JSON.";
        }

        $maxTokens = $request->type === 'naissance_complete' ? 512 : 256;

        try {
            $imageUrl = 'data:' . $request->media_type . ';base64,' . $request->image_base64;

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $apiKey,
                'Content-Type'  => 'application/json',
            ])->timeout(30)->post('https://api.groq.com/openai/v1/chat/completions', [
                'model'      => $model,
                'max_tokens' => $maxTokens,
                'messages'   => [[
                    'role'    => 'user',
                    'content' => [
                        [
                            'type'      => 'image_url',
                            'image_url' => ['url' => $imageUrl],
                        ],
                        ['type' => 'text', 'text' => $prompt],
                    ],
                ]],
            ]);

            if ($response->failed()) {
                return response()->json(['error' => 'Service OCR indisponible.'], 502);
            }

            $text = $response->json('choices.0.message.content', '{}');
            preg_match('/\{.*\}/s', $text, $matches);
            $data = json_decode($matches[0] ?? '{}', true) ?? [];

            return response()->json($data);

        } catch (\Exception $e) {
            return response()->json(['error' => 'Erreur OCR : ' . $e->getMessage()], 500);
        }
    }
}
