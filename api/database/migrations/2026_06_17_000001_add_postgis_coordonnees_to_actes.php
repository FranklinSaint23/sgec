<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        DB::statement('CREATE EXTENSION IF NOT EXISTS postgis');

        foreach (['actes_naissance', 'actes_deces', 'actes_mariage'] as $table) {
            DB::statement("ALTER TABLE {$table} ADD COLUMN IF NOT EXISTS coordonnees geography(Point, 4326)");
            DB::statement("CREATE INDEX IF NOT EXISTS idx_{$table}_geo ON {$table} USING GIST(coordonnees)");
        }
    }

    public function down(): void
    {
        foreach (['actes_naissance', 'actes_deces', 'actes_mariage'] as $table) {
            DB::statement("DROP INDEX IF EXISTS idx_{$table}_geo");
            DB::statement("ALTER TABLE {$table} DROP COLUMN IF EXISTS coordonnees");
        }
    }
};
