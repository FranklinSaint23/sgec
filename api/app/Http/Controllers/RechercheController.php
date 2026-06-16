<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use App\Models\ActeNaissance;
use App\Models\ActeMariage;
use App\Models\ActeDeces;

class RechercheController extends Controller
{
    public function search(Request $request)
    {
        $request->validate([
            'q'    => 'required|string|min:2|max:200',
            'type' => 'required|in:naissance,mariage,deces',
        ]);

        $query = $request->q;
        $type  = $request->type;
        $aiUrl = config('services.ai_microservice.url');

        switch ($type) {
            case 'naissance':
                $records = ActeNaissance::select('id', 'nom', 'date_naiss', 'nom_pere', 'nom_mere', 'numero_acte')->get();
                $items = $records->map(fn($r) => [
                    'id'    => $r->id,
                    'texte' => "{$r->nom} {$r->date_naiss} {$r->nom_pere} {$r->nom_mere}",
                ]);
                break;

            case 'mariage':
                $records = ActeMariage::select('id', 'nom_homme', 'nom_femme', 'numero_acte')->get();
                $items = $records->map(fn($r) => [
                    'id'    => $r->id,
                    'texte' => "{$r->nom_homme} {$r->nom_femme}",
                ]);
                break;

            case 'deces':
                $records = ActeDeces::select('id', 'nom_decede', 'date_deces', 'numero_acte')->get();
                $items = $records->map(fn($r) => [
                    'id'    => $r->id,
                    'texte' => "{$r->nom_decede} {$r->date_deces}",
                ]);
                break;
        }

        try {
            $aiResponse = Http::timeout(10)->post("{$aiUrl}/search/approximate", [
                'query'   => $query,
                'records' => $items->values()->toArray(),
                'top_k'   => 10,
            ]);

            if ($aiResponse->failed()) {
                return response()->json(['error' => 'Service IA indisponible.'], 502);
            }

            $resultats = $aiResponse->json('resultats', []);

            $idToRecord = $records->keyBy('id');
            $enriched = array_map(fn($r) => array_merge(
                $idToRecord[$r['id']]->toArray(),
                ['score' => $r['score']]
            ), $resultats);

            return response()->json($enriched);

        } catch (\Exception $e) {
            return response()->json(['error' => 'Erreur de connexion au service IA.'], 500);
        }
    }
}
