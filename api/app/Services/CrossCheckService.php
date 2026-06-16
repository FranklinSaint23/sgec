<?php

namespace App\Services;

use App\Models\ActeNaissance;

class CrossCheckService
{
    public function checkNaissanceExists(string $nom, ?string $dateNaiss = null): array
    {
        $prefix = substr($nom, 0, 4);

        $query = ActeNaissance::where('nom', 'like', $prefix . '%');

        if ($dateNaiss) {
            $query->orWhere(function ($q) use ($prefix, $dateNaiss) {
                $q->where('nom', 'like', '%' . $prefix . '%')
                  ->whereDate('date_naiss', $dateNaiss);
            });
        }

        $found = $query->limit(5)->get(['id', 'nom', 'date_naiss', 'lieu', 'numero_acte']);

        return [
            'found' => $found->isNotEmpty(),
            'actes' => $found->toArray(),
        ];
    }
}
