<?php

namespace App\Http\Controllers;
use Illuminate\Http\Request;
use App\Models\User;
use OwenIt\Auditing\Models\Audit;

class HistoriqueController extends Controller
{
    public function global()
    {
        $audits = Audit::with('user') // charge les infos utilisateur liées à l’action
            ->latest()
            ->get();
        return response()->json($audits);
    }
}
