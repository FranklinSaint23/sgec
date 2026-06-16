<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MentionMarginale extends Model
{
    protected $table = 'mentions_marginales';

    protected $fillable = [
        'acte_type', 'acte_id', 'numero_acte', 'nom_personne',
        'motif', 'texte', 'date_mention', 'officier', 'secretaire',
    ];
}
