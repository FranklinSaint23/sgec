<?php

    
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('actes_naissance', function (Blueprint $table) {
            $table->id();
            $table->string('numero_acte')->unique();
            $table->string('province')->default('Ouest');
            $table->string('departement')->default('Mifi');
            $table->string('arrondissement')->default('Bafoussam I');
            $table->string('centre')->default('Mairie Rurale de Bafoussam 1er');
            $table->string('nom');
            $table->date('date_naiss')->required();
            $table->string('lieu');
            $table->enum('sexe', ['M', 'F']);

            // Père
            $table->string('nom_pere')->nullable();
            $table->string('lieu_naiss_pere')->nullable();
            $table->date('date_naiss_pere')->nullable();
            $table->string('domicile_pere')->nullable();
            $table->string('profession_pere')->nullable();

            // Mère
            $table->string('nom_mere')->nullable();
            $table->string('lieu_naiss_mere')->nullable();
            $table->date('date_naiss_mere')->nullable();
            $table->string('domicile_mere')->nullable();
            $table->string('profession_mere')->nullable();

            // Infos admin
            $table->dateTime('dresse')->useCurrent();
            $table->string('declaration');
            $table->string('secretaire');
            $table->string('officier');

            // Fichiers
            $table->string('cni_pere')->nullable();
            $table->string('cni_mere')->nullable();
            $table->string('certificat_naissance')->nullable();
            $table->string('acte_mariage')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('actes_naissance');
    }
};


  
