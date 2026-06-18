<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class ChatbotController extends Controller
{
    public function chat(Request $request)
    {
        $request->validate(['message' => 'required|string|max:1000']);

        $apiKey = config('services.groq.api_key');
        $model  = config('services.groq.model');

        if (empty($apiKey)) {
            return response()->json(['error' => 'Clé API Groq non configurée.'], 500);
        }

        $systemPrompt = "Tu es un assistant expert en état civil au Cameroun, intégré dans le logiciel E-ACT de gestion des actes d'état civil. "
            . "Tu aides les officiers d'état civil et secrétaires avec : "
            . "les procédures de déclaration de naissance, mariage et décès, "
            . "les délais légaux et pièces justificatives requises, "
            . "les règles du Code Civil camerounais relatives à l'état civil, "
            . "et l'utilisation du logiciel E-ACT. "
            . "Réponds de façon concise, pratique et professionnelle en français. Si tu ne sais pas, dis-le clairement.";

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $apiKey,
                'Content-Type'  => 'application/json',
            ])->timeout(30)->post('https://api.groq.com/openai/v1/chat/completions', [
                'model'      => $model,
                'max_tokens' => 512,
                'messages'   => [
                    ['role' => 'system', 'content' => $systemPrompt],
                    ['role' => 'user',   'content' => $request->message],
                ],
            ]);

            if ($response->failed()) {
                $errMsg = $response->json('error.message', 'Erreur API Groq.');
                return response()->json(['error' => $errMsg], 502);
            }

            $content = $response->json('choices.0.message.content', '');
            return response()->json(['reply' => $content]);

        } catch (\Exception $e) {
            return response()->json(['error' => 'Erreur réseau : ' . $e->getMessage()], 500);
        }
    }
}
