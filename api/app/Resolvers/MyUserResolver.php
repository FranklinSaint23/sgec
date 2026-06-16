<?php

namespace App\Resolvers;

use Illuminate\Support\Facades\Auth;
use OwenIt\Auditing\Contracts\UserResolver as UserResolverContract;

class MyUserResolver implements UserResolverContract
{
    public static function resolve()
    {
        return Auth::guard('sanctum')->user();
    }
}
