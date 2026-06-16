<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class UsersSeeder extends Seeder
{
    public function run(): void
    {
        $users = [
            ['username' => 'franklin',      'email' => 'franklin@sgec.cm',      'role' => 'admin',      'sexe' => 'M'],
            ['username' => 'amougou_jean',  'email' => 'amougou@sgec.cm',       'role' => 'officier',   'sexe' => 'M'],
            ['username' => 'ngo_marie',     'email' => 'ngo.marie@sgec.cm',     'role' => 'officier',   'sexe' => 'F'],
            ['username' => 'tchamba_paul',  'email' => 'tchamba@sgec.cm',       'role' => 'secretaire', 'sexe' => 'M'],
            ['username' => 'feudjio_rose',  'email' => 'feudjio@sgec.cm',       'role' => 'secretaire', 'sexe' => 'F'],
            ['username' => 'kenfack_boris', 'email' => 'kenfack@sgec.cm',       'role' => 'secretaire', 'sexe' => 'M'],
        ];

        foreach ($users as $u) {
            User::firstOrCreate(
                ['username' => $u['username']],
                array_merge($u, ['password' => Hash::make('password123')])
            );
        }
    }
}
