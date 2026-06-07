<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('actes_mariage', function (Blueprint $table) {
            $table->id();
            $table->string('numero_acte')->unique();
            
            // Localisation
            $table->string('province')->default('Ouest');
            $table->string('departement')->default('Mifi');
            $table->string('arrondissement')->default('Bafoussam I');
            $table->string('centre')->default('Mairie Rurale de Bafoussam 1er');

            // Infos générales
            $table->dateTime('contracte_le')->useCurrent();
            $table->dateTime('celebre_le')->nullable();

            
            // Epoux
            $table->string('nom_homme')->nullable();
            $table->string('nom_pere_homme')->nullable();
            $table->string('nom_mere_homme')->nullable();
            $table->date('date_naiss_homme')->nullable();
            $table->string('race_homme')->nullable();
            $table->string('groupement_homme')->nullable();
            $table->string('subdivision_homme')->nullable();
            $table->string('region_homme')->nullable();
            $table->string('profession_homme')->nullable();
            $table->string('residence_homme')->nullable();

            // Epouse
            $table->string('nom_femme')->nullable();
            $table->string('nom_pere_femme')->nullable();
            $table->string('nom_mere_femme')->nullable();
            $table->date('date_naiss_femme')->nullable();
            $table->string('race_femme')->nullable();
            $table->string('groupement_femme')->nullable();
            $table->string('subdivision_femme')->nullable();
            $table->string('region_femme')->nullable();
            $table->string('profession_femme')->nullable();
            $table->string('residence_femme')->nullable();

            $table->string('regime')->required();

            // Consentements
            $table->string('consentement_epoux')->default('Oui');
            $table->string('consentement_epouse')->default('Oui');
            $table->string('consentement_chef_famille')->default('Oui');
            $table->string('opposition')->default('Non');


            // Dot
            $table->decimal('dot_montant_convenu', 12, 2)->nullable();
            $table->decimal('dot_montant_verse', 12, 2)->nullable();
            $table->date('date_versement')->nullable();
            $table->date('date_versement_complementaire')->nullable();

            // Témoins
            $table->string('temoin1_homme')->nullable();
            $table->string('temoin2_homme')->nullable();
            $table->string('temoin1_femme')->nullable();
            $table->string('temoin2_femme')->nullable();

            // Secrétaire & Officier
            $table->string('secretaire')->nullable();
            $table->string('officier')->nullable();

            // Pièces jointes
            $table->string('cni_homme')->nullable();
            $table->string('cni_femme')->nullable();
            $table->string('acte_homme')->nullable();
            $table->string('acte_femme')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('actes_mariage');
    }
};
