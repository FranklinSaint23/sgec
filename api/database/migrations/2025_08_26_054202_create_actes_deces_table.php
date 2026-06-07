<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('actes_deces', function (Blueprint $table) {
            $table->id();
            $table->string('numero_acte')->unique();

           $table->string('province')->default('Ouest');
            $table->string('departement')->default('Mifi');
            $table->string('arrondissement')->default('Bafoussam I');
            $table->string('centre')->default('Mairie Rurale de Bafoussam 1er');
            $table->dateTime('dresse_le')->useCurrent();
            

            $table->string('nom_decede');
            $table->date('date_deces');
            $table->string('lieu_deces');
            $table->enum('sexe', ['M','F']);
            $table->string('lieu_naiss_decede');
            $table->date('date_naiss_decede');
            $table->integer('age')->nullable();
            $table->string('profession_decede')->nullable();
            $table->string('domicile_decede')->nullable();

            $table->string('nom_pere_decede')->nullable();
            $table->string('domicile_pere_decede')->nullable();
            $table->string('nom_mere_decede')->nullable();
            $table->string('domicile_mere_decede')->nullable();

            $table->string('declaration');
            $table->string('secretaire');
            $table->string('officier');

            $table->string('cni_decede')->nullable();
            $table->string('acte_naissance_decede')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('actes_deces');
    }
};
