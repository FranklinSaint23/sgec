<?php

namespace App\Http\Controllers;

use App\Models\ActeDeces;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ActeDecesController extends Controller
{
    public function store(Request $request)
    {
        // Validation
        $validated = $request->validate([
            'province' => 'sometimes|string|max:255',
            'departement' => 'sometimes|string|max:255',
            'arrondissement' => 'sometimes|string|max:255',
            'centre' => 'sometimes|string|max:255',
            'dresse_le' => 'nullable|date',
            'nom_decede' => 'required|string|max:255',
            'date_deces' => 'required|date',
            'lieu_deces' => 'required|string|max:255',
            'sexe' => 'required|in:M,F',
            'lieu_naiss_decede' => 'nullable|string|max:255', // ← corrigé
            'date_naiss_decede' => 'nullable|date', // ← corrigé
            'age' => 'nullable|integer|min:0',
            'profession_decede' => 'nullable|string|max:255',
            'domicile_decede' => 'nullable|string|max:255',
            'nom_pere_decede' => 'nullable|string|max:255',
            'domicile_pere_decede' => 'nullable|string|max:255',
            'nom_mere_decede' => 'nullable|string|max:255',
            'domicile_mere_decede' => 'nullable|string|max:255',
            'declaration' => 'required|string|max:255',
            'secretaire' => 'required|string|max:255',
            'officier' => 'required|string|max:255',
            'cni_decede' => 'sometimes|file|mimes:jpg,jpeg,png,pdf|max:2048',
            'acte_naissance_decede' => 'sometimes|file|mimes:jpg,jpeg,png,pdf|max:2048',
        ]);

        // Génération du numéro
        $year = date('Y');
        $last = ActeDeces::whereYear('created_at', $year)->count() + 1;
        $numero = str_pad($last, 3, '0', STR_PAD_LEFT) . '/' . $year;

        // Upload fichiers
        $paths = [];
        foreach (['cni_decede', 'acte_naissance_decede'] as $file) {
            if ($request->hasFile($file)) {
                $paths[$file] = $request->file($file)->store("deces/$year", 'public');
            }
        }

        // Sauvegarde
        $acte = ActeDeces::create(array_merge(
            $validated,
            [
                'numero_acte' => $numero,
                'dresse_le' => now(),
                'province' => $validated['province'] ?? 'Ouest',
                'departement' => $validated['departement'] ?? 'Mifi',
                'arrondissement' => $validated['arrondissement'] ?? 'Bafoussam I',
                'centre' => $validated['centre'] ?? 'Mairie Rurale de Bafoussam 1er',
            ],
            $paths
        ));

        return response()->json([
            'message' => 'Acte de décès enregistré avec succès',
            'numero_acte' => $acte->numero_acte,
            'data' => $acte
        ], 201);
    }

    public function index()
    {
        return ActeDeces::latest()->get();
    }

    public function show($id)
    {
        return ActeDeces::findOrFail($id);
    }

    public function update(Request $request, $id)
    {
        $acte = ActeDeces::findOrFail($id);

        $validated = $request->validate([
            'province' => 'sometimes|string|max:255',
            'departement' => 'sometimes|string|max:255',
            'arrondissement' => 'sometimes|string|max:255',
            'centre' => 'sometimes|string|max:255',
            'dresse_le' => 'sometimes|date',
            'nom_decede' => 'sometimes|string|max:255',
            'date_deces' => 'sometimes|date',
            'lieu_deces' => 'sometimes|string|max:255',
            'sexe' => 'sometimes|in:M,F',
            'lieu_naiss_decede' => 'sometimes|string|max:255',
            'date_naiss_decede' => 'sometimes|date',
            'age' => 'sometimes|integer|min:0',
            'profession_decede' => 'sometimes|string|max:255',
            'domicile_decede' => 'sometimes|string|max:255',
            'nom_pere_decede' => 'sometimes|string|max:255', // ← corrigé
            'domicile_pere_decede' => 'sometimes|string|max:255',
            'nom_mere_decede' => 'sometimes|string|max:255',
            'domicile_mere_decede' => 'sometimes|string|max:255',
            'declaration' => 'sometimes|string|max:255',
            'secretaire' => 'sometimes|string|max:255',
            'officier' => 'sometimes|string|max:255',
            'cni_decede' => 'sometimes|file|mimes:jpg,jpeg,png,pdf|max:2048',
            'acte_naissance_decede' => 'sometimes|file|mimes:jpg,jpeg,png,pdf|max:2048',
        ]);

        $acte->fill($validated);

        foreach (['cni_decede', 'acte_naissance_decede'] as $fileField) {
            if ($request->hasFile($fileField)) {
                if ($acte->$fileField && Storage::disk('public')->exists($acte->$fileField)) {
                    Storage::disk('public')->delete($acte->$fileField);
                }
                $path = $request->file($fileField)->store("deces/".date('Y'), 'public');
                $acte->$fileField = $path;
            }
        }

        $acte->save();

        return response()->json([
            'message' => 'Acte de décès mis à jour avec succès',
            'data' => $acte
        ], 200);
    }

    public function destroy($id)
    {
        $acte = ActeDeces::findOrFail($id);

        foreach (['cni_decede', 'acte_naissance_decede'] as $file) {
            if ($acte->$file && Storage::disk('public')->exists($acte->$file)) {
                Storage::disk('public')->delete($acte->$file);
            }
        }

        $acte->delete();

        return response()->json([
            'message' => 'Acte de décès supprimé avec succès'
        ]);
    }
}
