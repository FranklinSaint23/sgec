<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use OwenIt\Auditing\Contracts\Auditable;


class ActeNaissance extends Model implements Auditable
{
    
    use \OwenIt\Auditing\Auditable;
    protected $table = 'actes_naissance';

    protected $fillable = [
        'numero_acte', 'province', 'departement', 'arrondissement', 'centre',
        'nom', 'date_naiss', 'lieu', 'sexe',
        'nom_pere', 'lieu_naiss_pere', 'date_naiss_pere', 'domicile_pere', 'profession_pere',
        'nom_mere', 'lieu_naiss_mere', 'date_naiss_mere', 'domicile_mere', 'profession_mere',
        'dresse', 'declaration', 'secretaire', 'officier',
        'cni_pere', 'cni_mere', 'certificat_naissance', 'acte_mariage'
    ];
}

