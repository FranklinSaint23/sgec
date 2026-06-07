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



/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/


Route::get('/users/secretaire', function () {
    return User::where('role', 'secretaire')->get(['id', 'username']);
});

Route::get('/users/officier', function () {
    return User::where('role', 'officier')->get(['id', 'username']);
});

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('/users', [AuthController::class, 'index']);
Route::delete('/users/{id}', [AuthController::class, 'destroy']);
Route::get('/users/{id}', [AuthController::class, 'show']);
Route::put('/users/{id}', [AuthController::class, 'update']);


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
