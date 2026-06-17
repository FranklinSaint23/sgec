<?php
namespace App\Http\Controllers;

use App\Models\ActeMariage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use App\Services\DuplicateDetectionService;
use App\Services\CrossCheckService;

class ActeMariageController extends Controller
{
    public function store(Request $request)
    {
        // Validation complète de tous les champs
        $validated = $request->validate([
            // Localisation
            'province' => 'sometimes|string|max:255',
            'departement' => 'sometimes|string|max:255',
            'arrondissement' => 'sometimes|string|max:255',
            'centre' => 'sometimes|string|max:255',

            // Infos générales
            'contracte_le' => 'nullable|date',
            'celebre_le' => 'nullable|date',

            // Époux
            'nom_homme' => 'nullable|string|max:255',
            'nom_pere_homme' => 'nullable|string|max:255',
            'nom_mere_homme' => 'nullable|string|max:255',
            'date_naiss_homme' => 'nullable|date',
            'race_homme' => 'nullable|string|max:255',
            'groupement_homme' => 'nullable|string|max:255',
            'subdivision_homme' => 'nullable|string|max:255',
            'region_homme' => 'nullable|string|max:255',
            'profession_homme' => 'nullable|string|max:255',
            'residence_homme' => 'nullable|string|max:255',

            // Épouse
            'nom_femme' => 'nullable|string|max:255',
            'nom_pere_femme' => 'nullable|string|max:255',
            'nom_mere_femme' => 'nullable|string|max:255',
            'date_naiss_femme' => 'nullable|date',
            'race_femme' => 'nullable|string|max:255',
            'groupement_femme' => 'nullable|string|max:255',
            'subdivision_femme' => 'nullable|string|max:255',
            'region_femme' => 'nullable|string|max:255',
            'profession_femme' => 'nullable|string|max:255',
            'residence_femme' => 'nullable|string|max:255',

            'regime' => 'required|string|max:255',

            // Consentements
            'consentement_epoux' => 'nullable|string|max:255',
            'consentement_epouse' => 'nullable|string|max:255',
            'consentement_chef_famille' => 'nullable|string|max:255',
            'opposition' => 'nullable|string|max:10',

            // Dot
            'dot_montant_convenu' => 'nullable|numeric',
            'dot_montant_verse' => 'nullable|numeric',
            'date_versement' => 'nullable|date',
            'date_versement_complementaire' => 'nullable|date',

            // Témoins
            'temoin1_homme' => 'nullable|string|max:255',
            'temoin2_homme' => 'nullable|string|max:255',
            'temoin1_femme' => 'nullable|string|max:255',
            'temoin2_femme' => 'nullable|string|max:255',

            // Secrétaire & officier
            'secretaire' => 'required|string|max:255',
            'officier' => 'required|string|max:255',

            // Pièces jointes (fichiers)
            'cni_homme' => 'sometimes|file|mimes:jpg,jpeg,png,pdf|max:2048',
            'cni_femme' => 'sometimes|file|mimes:jpg,jpeg,png,pdf|max:2048',
            'acte_homme' => 'sometimes|file|mimes:jpg,jpeg,png,pdf|max:2048',
            'acte_femme' => 'sometimes|file|mimes:jpg,jpeg,png,pdf|max:2048',
        ]);

        // Détection de doublons IA
        $doublons = app(DuplicateDetectionService::class)->checkMariage([
            "nom_homme"       => $validated["nom_homme"] ?? "",
            "nom_femme"       => $validated["nom_femme"] ?? "",
            "date_naiss_homme" => $validated["date_naiss_homme"] ?? "",
            "date_naiss_femme" => $validated["date_naiss_femme"] ?? "",
        ]);

        if (!empty($doublons) && !$request->boolean("force")) {
            return response()->json([
                "message"             => "Doublons potentiels détectés",
                "doublons_potentiels" => $doublons,
            ], 409);
        }

        // Génération du numéro d’acte : YYYY-MAR-NNNN
        $year   = date("Y");
        $prefix = $year . "-MAR-";
        $lastRec = ActeMariage::where("numero_acte", "like", $prefix . "%")
                    ->orderByRaw("CAST(SUBSTRING(numero_acte FROM " . (strlen($prefix) + 1) . ") AS INTEGER) DESC")
                    ->value("numero_acte");
        $seq    = $lastRec ? ((int) substr($lastRec, strlen($prefix))) + 1 : 1;
        $numero = $prefix . str_pad($seq, 4, "0", STR_PAD_LEFT);

        // Gestion des fichiers
        $paths = [];
        foreach (['cni_homme','cni_femme','acte_homme','acte_femme'] as $file) {
            if ($request->hasFile($file)) {
                $paths[$file] = $request->file($file)->store("mariages/$year", 'public');
            }
        }

        // Création en base
        $acte = ActeMariage::create(array_merge(
            $validated,
            ['numero_acte' => $numero,
             'contracte_le' => now(),
             'province' => $validated['province'] ?? 'Ouest',
             'departement' => $validated['departement'] ?? 'Mifi',
             'arrondissement' => $validated['arrondissement'] ?? 'Bafoussam I',
             'centre' => $validated['centre'] ?? 'Mairie Rurale de Bafoussam 1er',
             'consentement_epoux' => $validated['consentement_epoux'] ?? 'Oui',
             'consentement_epouse' => $validated['consentement_epouse'] ?? 'Oui',
             'consentement_chef_famille' => $validated['consentement_chef_famille'] ?? 'Oui',
             'opposition' => $validated['opposition'] ?? 'Non',            
            ],
            $paths
        ));

        // Vérification croisée époux/épouse avec actes de naissance
        $crossCheck = app(CrossCheckService::class);
        $verifHomme = $crossCheck->checkNaissanceExists(
            $validated['nom_homme'] ?? '',
            $validated['date_naiss_homme'] ?? null
        );
        $verifFemme = $crossCheck->checkNaissanceExists(
            $validated['nom_femme'] ?? '',
            $validated['date_naiss_femme'] ?? null
        );

        if ($request->filled('latitude') && $request->filled('longitude')) {
            $lat = (float) $request->input('latitude');
            $lng = (float) $request->input('longitude');
            DB::statement(
                "UPDATE actes_mariage SET coordonnees = ST_MakePoint(?, ?)::geography WHERE id = ?",
                [$lng, $lat, $acte->id]
            );
        }

        return response()->json([
            'message'      => 'Acte de mariage créé avec succès',
            'numero_acte'  => $acte->numero_acte,
            'verif_croisee'=> ['epoux' => $verifHomme, 'epouse' => $verifFemme],
            'data'         => $acte,
        ], 201);
    }

    public function index()
    {
        return ActeMariage::latest()->get();
    }

    public function show($id)
    {
        return ActeMariage::findOrFail($id);
    }

    public function destroy($id)
    {
        $acte = ActeMariage::find($id);

        if (!$acte) {
            return response()->json([
                'message' => 'Acte de mariage introuvable.'
            ], 404);
        }

        if ($acte->cni_homme && file_exists(public_path('uploads/' . $acte->cni_homme))) {
            unlink(public_path('uploads/' . $acte->cni_homme));
        }
        if ($acte->cni_femme && file_exists(public_path('uploads/' . $acte->cni_mere))) {
            unlink(public_path('uploads/' . $acte->cni_femme));
        }
        if ($acte->acte_homme && file_exists(public_path('uploads/' . $acte->acte_homme))) {
            unlink(public_path('uploads/' . $acte->acte_homme));
        }
        if ($acte->acte_femme && file_exists(public_path('uploads/' . $acte->acte_femme))) {
            unlink(public_path('uploads/' . $acte->acte_femme));
        }

        $acte->delete();

        return response()->json([
            'message' => 'Acte de mariage supprimé avec succès.'
        ], 200);
    }

    public function update(Request $request, $id)
    {
        $acte = ActeMariage::findOrFail($id);

        // Validation des champs
        $validated = $request->validate([
            'province' => 'sometimes|string|max:255',
            'departement' => 'sometimes|string|max:255',
            'arrondissement' => 'sometimes|string|max:255',
            'centre' => 'sometimes|string|max:255',
            'contracte_le' => 'sometimes|date',
            'celebre_le' => 'sometimes|date',
            'nom_homme' => 'sometimes|string|max:255',
            'nom_pere_homme' => 'sometimes|string|max:255',
            'nom_mere_homme' => 'sometimes|string|max:255',
            'date_naiss_homme' => 'sometimes|date',
            'race_homme' => 'sometimes|string|max:255',
            'groupement_homme' => 'sometimes|string|max:255',
            'subdivision_homme' => 'sometimes|string|max:255',
            'region_homme' => 'sometimes|string|max:255',
            'profession_homme' => 'sometimes|string|max:255',
            'residence_homme' => 'sometimes|string|max:255',
            'nom_femme' => 'sometimes|string|max:255',
            'nom_pere_femme' => 'sometimes|string|max:255',
            'nom_mere_femme' => 'sometimes|string|max:255',
            'date_naiss_femme' => 'sometimes|date',
            'race_femme' => 'sometimes|string|max:255',
            'groupement_femme' => 'sometimes|string|max:255',
            'subdivision_femme' => 'sometimes|string|max:255',
            'region_femme' => 'sometimes|string|max:255',
            'profession_femme' => 'sometimes|string|max:255',
            'residence_femme' => 'sometimes|string|max:255',
            'regime' => 'sometimes|string|max:255',
            'consentement_epoux' => 'sometimes|string|max:255',
            'consentement_epouse' => 'sometimes|string|max:255',
            'consentement_chef_famille' => 'sometimes|string|max:255',
            'opposition' => 'sometimes|string|max:10',
            'dot_montant_convenu' => 'sometimes|numeric',
            'dot_montant_verse' => 'sometimes|numeric',
            'date_versement' => 'sometimes|date',
            'date_versement_complementaire' => 'sometimes|date',
            'temoin1_homme' => 'sometimes|string|max:255',
            'temoin2_homme' => 'sometimes|string|max:255',
            'temoin1_femme' => 'sometimes|string|max:255',
            'temoin2_femme' => 'sometimes|string|max:255',
            'secretaire' => 'sometimes|string|max:255',
            'officier' => 'sometimes|string|max:255',
            'cni_homme' => 'sometimes|file|mimes:jpg,jpeg,png,pdf|max:2048',
            'cni_femme' => 'sometimes|file|mimes:jpg,jpeg,png,pdf|max:2048',
            'acte_homme' => 'sometimes|file|mimes:jpg,jpeg,png,pdf|max:2048',
            'acte_femme' => 'sometimes|file|mimes:jpg,jpeg,png,pdf|max:2048',
        ]);

        // Mettre à jour tous les champs texte
        $acte->fill($validated);

        // Upload des fichiers si fournis
        foreach (['cni_homme', 'cni_femme', 'acte_homme', 'acte_femme'] as $fileField) {
            if ($request->hasFile($fileField)) {
                // Supprimer l'ancien fichier si existant
                if ($acte->$fileField && Storage::exists($acte->$fileField)) {
                    Storage::delete($acte->$fileField);
                }

                // Stocker le nouveau fichier
                $path = $request->file($fileField)->store('actes_mariage', 'public');
                $acte->$fileField = $path;
            }
        }

        $acte->save();

        return response()->json([
            'message' => 'Acte de mariage mis à jour avec succès',
            'data' => $acte
        ]);
    }

    public function downloadFile($id, $field)
    {
        $acte = ActeMariage::findOrFail($id);
        $path = $acte->$field;

        if (!$path || !Storage::disk('public')->exists($path)) {
            abort(404, "Fichier introuvable");
        }

        return response()->file(storage_path("app/public/".$path));
    }


}
