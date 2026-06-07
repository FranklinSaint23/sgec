<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    // Inscription
  public function register(Request $request)
{
    $validator = Validator::make($request->all(), [
        'username' => 'required|string|max:255|unique:users',
        'email'    => 'required|email|unique:users,email',
        'password' => 'required|string|min:8',
        'sexe'     => 'nullable|in:M,F',
        'role'     => 'nullable|in:admin,officier,secretaire',
    ]);

    if ($validator->fails()) {
        return response()->json(['errors' => $validator->errors()], 422);
    }

    $user = User::create([
        'username' => $request->username,
        'email'    => $request->email,
        'password' => Hash::make($request->password),
        'sexe'     => $request->sexe,
        'role'     => $request->role,
    ]);

    // Cas d'ajout via interface admin (avec sexe et rôle fournis)
    if ($request->filled(['sexe', 'role'])) {
        return response()->json([
            'status' => 'success',
            'message' => 'Utilisateur ajouté avec succès',
            'user' => $user,
        ], 201);
    }

    // Cas d'inscription classique
    return response()->json([
        'status' => 'success',
        'message' => 'Inscription réussie',
        'user' => $user,
    ]);
}


    // Connexion
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'status' => 'fail',
                'message' => 'Email ou mot de passe incorrect.'
            ], 401);
        }

        // Mise à jour après validation du mot de passe
        $user->update(['last_login_at' => now()]);

        // Connexion "officielle" Laravel (Auditing va récupérer user_id / user_type)
        Auth::login($user);

        return response()->json([
            'status' => 'success',
            'message' => 'Connexion réussie',
            'user' => $user,
        ]);
    }

    public function index()
    {
        $users = User::all(['id', 'username', 'email', 'sexe', 'role']);
        return response()->json($users);
    }

    public function destroy($id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json(['message' => 'Utilisateur non trouvé.'], 404);
        }

        $user->delete();

        return response()->json(['message' => 'Utilisateur supprimé avec succès.']);
    }


    public function update(Request $request, $id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json(['message' => 'Utilisateur non trouvé'], 404);
        }

        // Validation des données
        $validated = $request->validate([
            'username' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $id,
            'sexe' => 'required|in:M,F',
            'role' => 'required|string',
            'password' => 'nullable|string|min:8|confirmed', // champ optionnel + confirmation
        ]);

        // Mise à jour des champs
        $user->username = $validated['username'];
        $user->email = $validated['email'];
        $user->sexe = $validated['sexe'];
        $user->role = $validated['role'];

        // Mise à jour du mot de passe si fourni
        if (!empty($validated['password'])) {
            $user->password = Hash::make($validated['password']);
        }

        $user->save();

        return response()->json(['message' => 'Utilisateur mis à jour avec succès', 'user' => $user]);
    }


    public function show($id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json(['message' => 'Utilisateur non trouvé'], 404);
        }

        return response()->json($user);
    }





}
