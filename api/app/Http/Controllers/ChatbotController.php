<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class ChatbotController extends Controller
{
    public function chat(Request $request)
    {
        $request->validate(['message' => 'required|string|max:1000']);

        $apiKey = config('services.anthropic.api_key');
        $model  = config('services.anthropic.model');

        if (empty($apiKey)) {
            return response()->json(['error' => 'Clé API Anthropic non configurée.'], 500);
        }

        $systemPrompt = <<<PROMPT
Tu es un assistant expert en état civil au Cameroun, intégré dans le logiciel E-ACT de gestion des actes d'état civil.
Tu aides les officiers d'état civil et secrétaires avec :
- Les procédures de déclaration de naissance, mariage et décès
- Les délais légaux et pièces justificatives requises
- Les règles du Code Civil camerounais relatives à l'état civil
- L'utilisation du logiciel E-ACT

Réponds de façon concise, pratique et professionnelle en français. Si tu ne sais pas, dis-le clairement.
PROMPT;

        try {
            $response = Http::withOptions([
                'curl' => [
                    CURLOPT_RESOLVE => ['api.anthropic.com:443:160.79.104.10'],
                ],
            ])->withHeaders([
                'x-api-key'         => $apiKey,
                'anthropic-version' => '2023-06-01',
                'content-type'      => 'application/json',
            ])->post('https://api.anthropic.com/v1/messages', [
                'model'      => $model,
                'max_tokens' => 512,
                'system'     => $systemPrompt,
                'messages'   => [
                    ['role' => 'user', 'content' => $request->message],
                ],
            ]);

            if ($response->failed()) {
                $errMsg = $response->json('error.message', 'Erreur API Anthropic.');
                return response()->json(['error' => $errMsg], 502);
            }

            $content = $response->json('content.0.text', '');
            return response()->json(['reply' => $content]);

        } catch (\Exception $e) {
            return response()->json(['error' => 'Erreur réseau : ' . $e->getMessage()], 500);
        }
    }
}
