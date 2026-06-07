<?php

namespace App\Http\Controllers;

use App\Models\ActeNaissance;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ActeNaissanceController extends Controller
{
    public function store(Request $request)
    {
        // Validation
        $validated = $request->validate([
            'province' => 'sometimes|string',
            'departement' => 'sometimes|string',
            'arrondissement' => 'sometimes|string',
            'centre' => 'sometimes|string',
            'nom' => 'required|string',
            'date_naiss' => 'required|date',
            'lieu' => 'required|string',
            'sexe' => 'required|in:M,F',
            'nom_pere' => 'nullable|string',
            'lieu_naiss_pere' => 'nullable|string',
            'date_naiss_pere' => 'nullable|date',
            'domicile_pere' => 'nullable|string',
            'profession_pere' => 'nullable|string',
            'nom_mere' => 'nullable|string',
            'lieu_naiss_mere' => 'nullable|string',
            'date_naiss_mere' => 'nullable|date',
            'domicile_mere' => 'nullable|string',
            'profession_mere' => 'nullable|string',
            'declaration' => 'required|string',
            'secretaire' => 'required|string',
            'officier' => 'required|string',
            'dresse' => 'nullable|date',

            // Fichiers
            'cni_pere' => 'sometimes|file|mimes:jpg,jpeg,png,pdf|max:2048',
            'cni_mere' => 'sometimes|file|mimes:jpg,jpeg,png,pdf|max:2048',
            'certificat_naissance' => 'sometimes|file|mimes:jpg,jpeg,png,pdf|max:2048',
            'acte_mariage' => 'sometimes|file|mimes:jpg,jpeg,png,pdf|max:2048',
        ]);

        // Génération du numéro d’acte
        $year = now()->year;
        $count = ActeNaissance::whereYear('created_at', $year)->count() + 1;
        $numero_acte = str_pad($count, 3, '0', STR_PAD_LEFT) . '/' . $year;

        // Upload fichiers
        $files = [];
        foreach (['cni_pere', 'cni_mere', 'certificat_naissance', 'acte_mariage'] as $field) {
            if ($request->hasFile($field)) {
                $files[$field] = $request->file($field)->store('actes', 'public');
            }
        }

        // Création en base
        $acte = ActeNaissance::create(array_merge(
            $validated,
            ['numero_acte' => $numero_acte,
             'dresse' => now(),
             'province' => $validated['province'] ?? 'Ouest',
             'departement' => $validated['departement'] ?? 'Mifi',
             'arrondissement' => $validated['arrondissement'] ?? 'Bafoussam I',
             'centre' => $validated['centre'] ?? 'Mairie Rurale de Bafoussam 1er',
            ],
            $files
        ));

        return response()->json([
            'message' => 'Acte de naissance enregistré avec succès !',
            'numero_acte' => $acte->numero_acte
        ], 201);
    }

    public function index()
    {
        $actes = ActeNaissance::select(
            'id',
            'numero_acte',
            'nom',
            'date_naiss',
            'sexe',
            'dresse'
        )
        ->orderBy('numero_acte', 'desc')
        ->get();

        return response()->json($actes);
    }

    public function destroy($id)
    {
        $acte = ActeNaissance::find($id);

        if (!$acte) {
            return response()->json([
                'message' => 'Acte de naissance introuvable.'
            ], 404);
        }

        if ($acte->cni_pere && file_exists(public_path('uploads/' . $acte->cni_pere))) {
            unlink(public_path('uploads/' . $acte->cni_pere));
        }
        if ($acte->cni_mere && file_exists(public_path('uploads/' . $acte->cni_mere))) {
            unlink(public_path('uploads/' . $acte->cni_mere));
        }
        if ($acte->certificat_naissance && file_exists(public_path('uploads/' . $acte->certificat_naissance))) {
            unlink(public_path('uploads/' . $acte->certificat_naissance));
        }
        if ($acte->acte_mariage && file_exists(public_path('uploads/' . $acte->acte_mariage))) {
            unlink(public_path('uploads/' . $acte->acte_mariage));
        }

        $acte->delete();

        return response()->json([
            'message' => 'Acte de naissance supprimé avec succès.'
        ], 200);
    }

    public function show($id)
    {
        $acte = ActeNaissance::findOrFail($id);

        return response()->json($acte);
    }

    public function update(Request $request, $id)
{
    $acte = ActeNaissance::find($id);

    if (!$acte) {
        return response()->json([
            'message' => 'Acte introuvable'
        ], 404);
    }

    // Validation souple avec `sometimes` : 
    // les champs sont validés seulement s’ils existent dans la requête
    $validated = $request->validate([
        'province' => 'sometimes|string|max:255',
        'departement' => 'sometimes|string|max:255',
        'arrondissement' => 'sometimes|string|max:255',
        'centre' => 'sometimes|string|max:255',
        'nom' => 'sometimes|string|max:255',
        'date_naiss' => 'sometimes|date',
        'lieu' => 'sometimes|string|max:255',
        'sexe' => 'sometimes|in:M,F',
        'nom_pere' => 'sometimes|string|max:255',
        'lieu_naiss_pere' => 'sometimes|string|max:255',
        'date_naiss_pere' => 'sometimes|date',
        'domicile_pere' => 'sometimes|string|max:255',
        'profession_pere' => 'sometimes|string|max:255',
        'nom_mere' => 'sometimes|string|max:255',
        'lieu_naiss_mere' => 'sometimes|string|max:255',
        'date_naiss_mere' => 'sometimes|date',
        'domicile_mere' => 'sometimes|string|max:255',
        'profession_mere' => 'sometimes|string|max:255',
        'dresse' => 'sometimes|date',
        'declaration' => 'sometimes|string|max:255',
        'secretaire' => 'sometimes|string|max:255',
        'officier' => 'sometimes|string|max:255',

        // Les fichiers deviennent optionnels
        'cni_pere' => 'sometimes|file|mimes:jpg,jpeg,png,pdf|max:2048',
        'cni_mere' => 'sometimes|file|mimes:jpg,jpeg,png,pdf|max:2048',
        'certificat_naissance' => 'sometimes|file|mimes:jpg,jpeg,png,pdf|max:2048',
        'acte_mariage' => 'sometimes|file|mimes:jpg,jpeg,png,pdf|max:2048',
    ]);

    // Mise à jour des champs simples
    $acte->fill($validated);

    // Gestion des fichiers
    foreach (['cni_pere', 'cni_mere', 'certificat_naissance', 'acte_mariage'] as $fileField) {
        if ($request->hasFile($fileField)) {
            // Supprimer l'ancien fichier si existant
            if ($acte->$fileField && Storage::exists($acte->$fileField)) {
                Storage::delete($acte->$fileField);
            }

            // Stocker le nouveau fichier
            $path = $request->file($fileField)->store('actes_naissance', 'public');
            $acte->$fileField = $path;
        }
    }

    $acte->save();

    return response()->json([
        'message' => 'Acte de naissance mis à jour avec succès',
        'data' => $acte
    ]);
}


}
