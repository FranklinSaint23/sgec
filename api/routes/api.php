<?php

use App\Models\User;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\ActeNaissanceController;
use App\Http\Controllers\ActeMariageController;
use App\Http\Controllers\ActeDecesController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\HistoriqueController;
use App\Http\Controllers\StatistiquesController;
use App\Http\Controllers\SecuriteController;
use App\Http\Controllers\ChatbotController;
use App\Http\Controllers\RechercheController;
use App\Http\Controllers\OCRController;
use App\Http\Controllers\AnomalieController;
use App\Http\Controllers\LibelleController;
use App\Http\Controllers\MentionMarginaleController;
use App\Http\Controllers\CarteController;

Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']); 


Route::middleware('auth:sanctum')->group(function () {

    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/users/secretaire', function () {
        return User::where('role', 'secretaire')->get(['id', 'username']);
    });
    Route::get('/users/officier', function () {
        return User::where('role', 'officier')->get(['id', 'username']);
    });
    Route::get('/users', [AuthController::class, 'index']);
    Route::get('/users/{id}', [AuthController::class, 'show']);

    Route::post('/actes_naissance', [ActeNaissanceController::class, 'store']);
    Route::get('/actes_naissance', [ActeNaissanceController::class, 'index']);
    Route::get('/actes_naissance/{id}', [ActeNaissanceController::class, 'show']);
    Route::put('/actes_naissance/{id}', [ActeNaissanceController::class, 'update']);
    Route::delete('/actes_naissance/{id}', [ActeNaissanceController::class, 'destroy']); 

    Route::get('/actes_mariage', [ActeMariageController::class, 'index']);
    Route::post('/actes_mariage', [ActeMariageController::class, 'store']);
    Route::get('/actes_mariage/{id}', [ActeMariageController::class, 'show']);
    Route::put('/actes_mariage/{id}', [ActeMariageController::class, 'update']);
    Route::delete('/actes_mariage/{id}', [ActeMariageController::class, 'destroy']);
    Route::get('/actes_mariage/{id}/file/{field}', [ActeMariageController::class, 'downloadFile']);

    Route::get('/actes_deces', [ActeDecesController::class, 'index']);
    Route::post('/actes_deces', [ActeDecesController::class, 'store']);
    Route::get('/actes_deces/{id}', [ActeDecesController::class, 'show']);
    Route::put('/actes_deces/{id}', [ActeDecesController::class, 'update']);
    Route::delete('/actes_deces/{id}', [ActeDecesController::class, 'destroy']); 

    Route::get('/dashboard-stats', [DashboardController::class, 'stats']);
    Route::get('/actes/latest', [DashboardController::class, 'latestActes']);
    Route::get('/historique/global', [HistoriqueController::class, 'global']);
    Route::get('/statistiques', [StatistiquesController::class, 'index']);

    Route::post('/chatbot', [ChatbotController::class, 'chat']);
    Route::get('/search', [RechercheController::class, 'search']);
    Route::post('/ocr', [OCRController::class, 'extract']);
    Route::post('/generer-libelle', [LibelleController::class, 'generer']);
    Route::get('/analytique', [StatistiquesController::class, 'analytique']);
    Route::get('/anomalies', [AnomalieController::class, 'index']);
    Route::get('/mentions/search-acte', [MentionMarginaleController::class, 'searchActe']);
    Route::get('/mentions', [MentionMarginaleController::class, 'index']);
    Route::post('/mentions', [MentionMarginaleController::class, 'store']);
    Route::delete('/mentions/{id}', [MentionMarginaleController::class, 'destroy']);

    // Carte PostGIS
    Route::get('/carte/tous', [CarteController::class, 'tous']);
    Route::get('/carte/naissances', [CarteController::class, 'naissances']);
    Route::get('/carte/deces', [CarteController::class, 'deces']);
    Route::get('/carte/mariages', [CarteController::class, 'mariages']);
    Route::get('/carte/proximite', [CarteController::class, 'proximite']);
    Route::get('/carte/stats', [CarteController::class, 'stats']);

    // Réservé au rôle admin
    Route::middleware('role:admin')->group(function () {
        Route::delete('/users/{id}', [AuthController::class, 'destroy']);
        Route::put('/users/{id}', [AuthController::class, 'update']);
        Route::get('/securite/analyser', [SecuriteController::class, 'analyserComportements']);
    });
});