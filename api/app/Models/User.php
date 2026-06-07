<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use OwenIt\Auditing\Contracts\Auditable;
use OwenIt\Auditing\Contracts\UserResolver;

class User extends Authenticatable implements Auditable
{
    use HasApiTokens, HasFactory, Notifiable;
    use \OwenIt\Auditing\Auditable; 
    // use \OwenIt\Auditing\UserResolver; 


    protected $table = 'users';
    /**
     * Les colonnes qu’on peut remplir en masse
     */
    protected $fillable = [
        'username',
        'email',
        'password',
        'last_login_at',
        'sexe',
        'role', 
    ];

    /**
     * Colonnes à cacher dans les réponses JSON
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Colonnes typées
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
    ];
}
