<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use OwenIt\Auditing\Contracts\Auditable;

class ActeMariage extends Model implements Auditable
{
    use \OwenIt\Auditing\Auditable;

    protected $table = 'actes_mariage';

        protected $fillable = [
        'numero_acte',
        'province','departement','arrondissement','centre',
        'contracte_le','celebre_le','regime',
        'nom_homme','nom_pere_homme','nom_mere_homme','date_naiss_homme',
        'race_homme','groupement_homme','subdivision_homme','region_homme',
        'profession_homme','residence_homme',
        'nom_femme','nom_pere_femme','nom_mere_femme','date_naiss_femme',
        'race_femme','groupement_femme','subdivision_femme','region_femme',
        'profession_femme','residence_femme',
        'consentement_epoux','consentement_epouse','consentement_chef_famille','opposition',
        'dot_montant_convenu','dot_montant_verse','date_versement','date_versement_complementaire',
        'temoin1_homme','temoin2_homme','temoin1_femme','temoin2_femme',
        'secretaire','officier',
        'cni_homme','cni_femme','acte_homme','acte_femme'
    ];

}
