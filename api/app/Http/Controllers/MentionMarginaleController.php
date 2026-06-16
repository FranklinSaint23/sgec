<?php

namespace App\Http\Controllers;

use App\Models\MentionMarginale;
use App\Models\ActeNaissance;
use App\Models\ActeMariage;
use App\Models\ActeDeces;
use Illuminate\Http\Request;

class MentionMarginaleController extends Controller
{
    public function index(Request $request)
    {
        $query = MentionMarginale::latest();

        if ($request->filled('acte_type')) {
            $query->where('acte_type', $request->acte_type);
        }
        if ($request->filled('q')) {
            $q = $request->q;
            $query->where(function ($sub) use ($q) {
                $sub->where('numero_acte', 'like', "%$q%")
                    ->orWhere('nom_personne', 'like', "%$q%")
                    ->orWhere('motif', 'like', "%$q%");
            });
        }

        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'acte_type'    => 'required|in:naissance,mariage,deces',
            'acte_id'      => 'required|integer',
            'numero_acte'  => 'required|string',
            'nom_personne' => 'nullable|string|max:255',
            'motif'        => 'required|string|max:255',
            'texte'        => 'required|string',
            'date_mention' => 'required|date',
            'officier'     => 'nullable|string|max:255',
            'secretaire'   => 'nullable|string|max:255',
        ]);

        $mention = MentionMarginale::create($validated);

        return response()->json(['message' => 'Mention marginale ajoutée.', 'data' => $mention], 201);
    }

    public function destroy($id)
    {
        MentionMarginale::findOrFail($id)->delete();
        return response()->json(['message' => 'Mention supprimée.']);
    }

    public function searchActe(Request $request)
    {
        $request->validate(['type' => 'required|in:naissance,mariage,deces', 'q' => 'required|string']);
        $q = $request->q;

        $results = match($request->type) {
            'naissance' => ActeNaissance::where('numero_acte', 'like', "%$q%")->orWhere('nom', 'like', "%$q%")->limit(10)->get(['id','numero_acte','nom','date_naiss']),
            'mariage'   => ActeMariage::where('numero_acte', 'like', "%$q%")->orWhere('nom_homme', 'like', "%$q%")->orWhere('nom_femme', 'like', "%$q%")->limit(10)->get(['id','numero_acte','nom_homme','nom_femme','contracte_le']),
            'deces'     => ActeDeces::where('numero_acte', 'like', "%$q%")->orWhere('nom_decede', 'like', "%$q%")->limit(10)->get(['id','numero_acte','nom_decede','date_deces']),
        };

        return response()->json($results);
    }
}
