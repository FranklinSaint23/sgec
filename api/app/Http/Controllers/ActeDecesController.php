<?php

namespace App\Http\Controllers;

use App\Models\ActeDeces;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use App\Services\DuplicateDetectionService;
use App\Services\CrossCheckService;

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

        // Détection de doublons IA
        $doublons = app(DuplicateDetectionService::class)->checkDeces([
            'nom_decede' => $validated['nom_decede'],
            'date_deces' => $validated['date_deces'],
            'lieu_deces' => $validated['lieu_deces'] ?? '',
        ]);

        if (!empty($doublons) && !$request->boolean('force')) {
            return response()->json([
                'message'             => 'Doublons potentiels détectés',
                'doublons_potentiels' => $doublons,
            ], 409);
        }

        // Génération du numéro d'acte : YYYY-DEC-NNNN
        $year   = date('Y');
        $prefix = $year . '-DEC-';
        $lastRec = ActeDeces::where('numero_acte', 'like', $prefix . '%')
                    ->orderByRaw('CAST(SUBSTRING(numero_acte FROM ' . (strlen($prefix) + 1) . ') AS INTEGER) DESC')
                    ->value('numero_acte');
        $seq    = $lastRec ? ((int) substr($lastRec, strlen($prefix))) + 1 : 1;
        $numero = $prefix . str_pad($seq, 4, '0', STR_PAD_LEFT);

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

        // Vérification croisée avec les actes de naissance
        $verifCroisee = app(CrossCheckService::class)->checkNaissanceExists(
            $validated['nom_decede'],
            $validated['date_naiss_decede'] ?? null
        );

        if ($request->filled('latitude') && $request->filled('longitude')) {
            $lat = (float) $request->input('latitude');
            $lng = (float) $request->input('longitude');
            DB::statement(
                "UPDATE actes_deces SET coordonnees = ST_MakePoint(?, ?)::geography WHERE id = ?",
                [$lng, $lat, $acte->id]
            );
        }

        return response()->json([
            'message'      => 'Acte de décès enregistré avec succès',
            'numero_acte'  => $acte->numero_acte,
            'verif_croisee'=> $verifCroisee,
            'data'         => $acte,
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
