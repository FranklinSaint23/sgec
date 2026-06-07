<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use OwenIt\Auditing\Contracts\Auditable;

class ActeDeces extends Model implements Auditable
{
    use \OwenIt\Auditing\Auditable;

    protected $table = 'actes_deces';

    protected $fillable = [
        'numero_acte',
        'province',
        'departement',
        'arrondissement',
        'centre',
        'dresse_le',
        'nom_decede',
        'date_deces',
        'lieu_deces',
        'sexe',
        'lieu_naiss_decede',
        'date_naiss_decede',
        'age',
        'profession_decede',
        'domicile_decede',
        'nom_pere_decede',
        'domicile_pere_decede',
        'nom_mere_decede',
        'domicile_mere_decede',
        'declaration',
        'secretaire',
        'officier',
        'cni_decede',
        'acte_naissance_decede',
    ];
}
