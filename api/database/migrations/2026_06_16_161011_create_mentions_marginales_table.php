<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('mentions_marginales', function (Blueprint $table) {
            $table->id();
            $table->string('acte_type');
            $table->unsignedBigInteger('acte_id');
            $table->string('numero_acte');
            $table->string('nom_personne')->nullable();
            $table->string('motif');
            $table->text('texte');
            $table->date('date_mention');
            $table->string('officier')->nullable();
            $table->string('secretaire')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mentions_marginales');
    }
};
