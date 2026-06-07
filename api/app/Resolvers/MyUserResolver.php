<?php

namespace App\Resolvers;

use Illuminate\Support\Facades\Session;
use OwenIt\Auditing\Contracts\UserResolver as UserResolverContract;
use App\Models\User;

class MyUserResolver implements UserResolverContract
{
    public static function resolve()
    {
        // Si tu stockes l'ID utilisateur dans la session après login custom
        if (Session::has('user_id')) {
            return User::find(Session::get('user_id'));
        }

        // Si tu stockes l'utilisateur directement
        if (Session::has('user')) {
            return Session::get('user');
        }

        return null;
    }
}
