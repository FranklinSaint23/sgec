<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ActesSeeder extends Seeder
{
    // Coordonnées GPS par ville/quartier
    // Naissances : Bafoussam quartiers + Foumban, Mbouda, Yaoundé (Nlongkak), Douala (Akwa)
    private array $coordsNaissance = [
        [10.1678, 5.4812], // MBARGA   → Bafoussam - Djeleng
        [10.1823, 5.4923], // TAGNE    → Bafoussam - Nylon
        [10.9000, 5.7167], // NKOA     → Foumban centre
        [10.1534, 5.4701], // FEUDJIO  → Bafoussam - Famla
        [10.1612, 5.4634], // KAMGA    → Bafoussam - Kamkop
        [10.2833, 5.6333], // TCHOUAMO → Mbouda centre
        [10.1456, 5.5023], // WAMBA    → Bafoussam - Banengo
        [11.5087, 3.8623], // NJOCK    → Yaoundé - Nlongkak
        [10.1789, 5.4567], // BIYONG   → Bafoussam - Tougang
        [9.7212,  4.0523], // SIMO     → Douala - Akwa
        [10.1512, 5.4489], // DONGMO   → Bafoussam - Tamdja
        [10.1723, 5.4890], // KENFACK  → Bafoussam - Ngwa
        [10.1594, 5.4764], // NGOUFO   → Bafoussam - Centre
        [10.1850, 5.4600], // TAPTUE   → Bafoussam - Koptchou
        [10.1400, 5.4720], // NKENGNE  → Bafoussam - Sabga
    ];

    // Décès : Yaoundé (Bastos, Mfoundi), Douala (Bonanjo), reste Bafoussam quartiers
    private array $coordsDeces = [
        [10.1678, 5.4812], // FOTSO    → Bafoussam - Djeleng
        [11.5178, 3.8712], // YOMBI    → Yaoundé - Bastos
        [10.1534, 5.4701], // TCHOUMI  → Bafoussam - Famla
        [9.7023,  4.0611], // MEZUI    → Douala - Bonanjo
        [10.1456, 5.5023], // KEMAJOU  → Bafoussam - Banengo
        [10.1789, 5.4567], // DONFACK  → Bafoussam - Tougang
        [10.1512, 5.4489], // TSAFACK  → Bafoussam - Tamdja
        [11.5123, 3.8516], // BELLA    → Yaoundé - Mfoundi
        [10.1723, 5.4890], // NGOH     → Bafoussam - Ngwa
        [10.1594, 5.4764], // KANA     → Bafoussam - Centre
    ];

    // Mariages : tous à Bafoussam, différents quartiers
    private array $coordsMariage = [
        [10.1678, 5.4812], // KAMGA/NKOA     → Djeleng
        [10.1823, 5.4923], // TAGNE/FOUDA    → Nylon
        [10.1534, 5.4701], // BIYA/BELLA     → Famla
        [10.1612, 5.4634], // DONGMO/SIMO    → Kamkop
        [10.1456, 5.5023], // WAMBA/ATANGANA → Banengo
        [10.1789, 5.4567], // NJOCK/KEMAJOU  → Tougang
        [10.1512, 5.4489], // FEUDJIO/TSAFACK→ Tamdja
        [10.1723, 5.4890], // KENGNE/MVOGO   → Ngwa
        [10.1594, 5.4764], // MBARGA/NKENGNE → Centre
        [10.1850, 5.4600], // FOTSO/DONFACK  → Koptchou
    ];

    public function run(): void
    {
        // ── ACTES DE NAISSANCE ──────────────────────────────────────────
        $naissances = [
            ['nom'=>'MBARGA Élodie',     'date_naiss'=>'2024-01-15','lieu'=>'Bafoussam','sexe'=>'F','nom_pere'=>'MBARGA Pierre',   'nom_mere'=>'TSAFACK Cécile',    'declaration'=>'MBARGA Pierre',   'secretaire'=>'tchamba_paul',  'officier'=>'amougou_jean'],
            ['nom'=>'TAGNE Kevin',        'date_naiss'=>'2024-02-03','lieu'=>'Bafoussam','sexe'=>'M','nom_pere'=>'TAGNE Richard',   'nom_mere'=>'FOUDA Marguerite',  'declaration'=>'TAGNE Richard',   'secretaire'=>'feudjio_rose',  'officier'=>'amougou_jean'],
            ['nom'=>'NKOA Bernadette',    'date_naiss'=>'2024-02-20','lieu'=>'Foumban',  'sexe'=>'F','nom_pere'=>'NKOA Samuel',     'nom_mere'=>'BIYA Suzanne',      'declaration'=>'NKOA Samuel',     'secretaire'=>'kenfack_boris', 'officier'=>'ngo_marie'],
            ['nom'=>'FEUDJIO Théodore',   'date_naiss'=>'2024-03-11','lieu'=>'Bafoussam','sexe'=>'M','nom_pere'=>'FEUDJIO Albert',  'nom_mere'=>'NJIKE Hortense',    'declaration'=>'FEUDJIO Albert',  'secretaire'=>'tchamba_paul',  'officier'=>'ngo_marie'],
            ['nom'=>'KAMGA Marlène',      'date_naiss'=>'2024-04-07','lieu'=>'Bafoussam','sexe'=>'F','nom_pere'=>'KAMGA Gérard',    'nom_mere'=>'SIMO Yvonne',       'declaration'=>'KAMGA Gérard',    'secretaire'=>'feudjio_rose',  'officier'=>'amougou_jean'],
            ['nom'=>'TCHOUAMO Justin',    'date_naiss'=>'2024-04-22','lieu'=>'Mbouda',   'sexe'=>'M','nom_pere'=>'TCHOUAMO Gaston', 'nom_mere'=>'KENGNE Pauline',    'declaration'=>'TCHOUAMO Gaston', 'secretaire'=>'kenfack_boris', 'officier'=>'amougou_jean'],
            ['nom'=>'WAMBA Christelle',   'date_naiss'=>'2024-05-30','lieu'=>'Bafoussam','sexe'=>'F','nom_pere'=>'WAMBA Jules',     'nom_mere'=>'DONFACK Gisèle',    'declaration'=>'WAMBA Jules',     'secretaire'=>'tchamba_paul',  'officier'=>'ngo_marie'],
            ['nom'=>'NJOCK Emmanuel',     'date_naiss'=>'2024-06-14','lieu'=>'Yaoundé',  'sexe'=>'M','nom_pere'=>'NJOCK Michel',    'nom_mere'=>'BELLA Thérèse',     'declaration'=>'NJOCK Michel',    'secretaire'=>'feudjio_rose',  'officier'=>'amougou_jean'],
            ['nom'=>'BIYONG Sandrine',    'date_naiss'=>'2024-07-09','lieu'=>'Bafoussam','sexe'=>'F','nom_pere'=>'BIYONG Serge',    'nom_mere'=>'ATANGANA Alice',    'declaration'=>'BIYONG Serge',    'secretaire'=>'kenfack_boris', 'officier'=>'ngo_marie'],
            ['nom'=>'SIMO Patrick',       'date_naiss'=>'2024-08-01','lieu'=>'Douala',   'sexe'=>'M','nom_pere'=>'SIMO Emmanuel',   'nom_mere'=>'MOUAFO Victoire',   'declaration'=>'SIMO Emmanuel',   'secretaire'=>'tchamba_paul',  'officier'=>'amougou_jean'],
            ['nom'=>'DONGMO Flore',       'date_naiss'=>'2024-09-17','lieu'=>'Bafoussam','sexe'=>'F','nom_pere'=>'DONGMO Victor',   'nom_mere'=>'KEMAJOU Clémentine','declaration'=>'DONGMO Victor',   'secretaire'=>'feudjio_rose',  'officier'=>'ngo_marie'],
            ['nom'=>'KENFACK Rodrigue',   'date_naiss'=>'2024-10-05','lieu'=>'Bafoussam','sexe'=>'M','nom_pere'=>'KENFACK Henri',   'nom_mere'=>'TSAFACK Brigitte',  'declaration'=>'KENFACK Henri',   'secretaire'=>'kenfack_boris', 'officier'=>'amougou_jean'],
            ['nom'=>'NGOUFO Estelle',     'date_naiss'=>'2024-11-23','lieu'=>'Bafoussam','sexe'=>'F','nom_pere'=>'NGOUFO Blaise',   'nom_mere'=>'TCHOKOTE Angèle',   'declaration'=>'NGOUFO Blaise',   'secretaire'=>'tchamba_paul',  'officier'=>'ngo_marie'],
            ['nom'=>'TAPTUE Hervé',       'date_naiss'=>'2024-12-12','lieu'=>'Bafoussam','sexe'=>'M','nom_pere'=>'TAPTUE François', 'nom_mere'=>'FOTSO Célestine',   'declaration'=>'TAPTUE François', 'secretaire'=>'feudjio_rose',  'officier'=>'amougou_jean'],
            ['nom'=>'NKENGNE Aurélie',    'date_naiss'=>'2025-01-08','lieu'=>'Bafoussam','sexe'=>'F','nom_pere'=>'NKENGNE Sylvain', 'nom_mere'=>'KANA Marie-Louise', 'declaration'=>'NKENGNE Sylvain', 'secretaire'=>'kenfack_boris', 'officier'=>'ngo_marie'],
        ];

        foreach ($naissances as $i => $n) {
            $num = sprintf('2024-NAI-%04d', $i + 1);
            if (DB::table('actes_naissance')->where('numero_acte', $num)->exists()) continue;

            DB::table('actes_naissance')->insert(array_merge([
                'numero_acte'          => $num,
                'province'             => 'Ouest',
                'departement'          => 'Mifi',
                'arrondissement'       => 'Bafoussam I',
                'centre'               => 'Mairie Rurale de Bafoussam 1er',
                'lieu_naiss_pere'      => 'Bafoussam',
                'lieu_naiss_mere'      => 'Bafoussam',
                'domicile_pere'        => 'Bafoussam',
                'domicile_mere'        => 'Bafoussam',
                'profession_pere'      => 'Commerçant',
                'profession_mere'      => 'Ménagère',
                'dresse'               => Carbon::parse($n['date_naiss'])->addDays(rand(1, 10)),
                'cni_pere'             => '',
                'cni_mere'             => '',
                'certificat_naissance' => '',
                'acte_mariage'         => '',
                'created_at'           => now(),
                'updated_at'           => now(),
            ], $n));

            // Coordonnées GPS
            [$lng, $lat] = $this->coordsNaissance[$i];
            DB::statement(
                "UPDATE actes_naissance SET coordonnees = ST_MakePoint(?, ?)::geography WHERE numero_acte = ?",
                [$lng, $lat, $num]
            );
        }

        // ── ACTES DE DÉCÈS ──────────────────────────────────────────────
        $deces = [
            ['nom_decede'=>'FOTSO Bernard',     'date_deces'=>'2024-01-20','lieu_deces'=>'Bafoussam','sexe'=>'M','date_naiss_decede'=>'1958-03-12','lieu_naiss_decede'=>'Bafoussam','age'=>65,'profession_decede'=>'Agriculteur',  'declaration'=>'FOTSO Roger',    'secretaire'=>'tchamba_paul',  'officier'=>'amougou_jean'],
            ['nom_decede'=>'YOMBI Cécile',      'date_deces'=>'2024-02-14','lieu_deces'=>'Yaoundé',  'sexe'=>'F','date_naiss_decede'=>'1962-07-04','lieu_naiss_decede'=>'Bafoussam','age'=>61,'profession_decede'=>'Enseignante',   'declaration'=>'YOMBI Paul',     'secretaire'=>'feudjio_rose',  'officier'=>'ngo_marie'],
            ['nom_decede'=>'TCHOUMI Robert',    'date_deces'=>'2024-03-05','lieu_deces'=>'Bafoussam','sexe'=>'M','date_naiss_decede'=>'1945-11-30','lieu_naiss_decede'=>'Mbouda',   'age'=>78,'profession_decede'=>'Retraité',      'declaration'=>'TCHOUMI Jules',  'secretaire'=>'kenfack_boris', 'officier'=>'amougou_jean'],
            ['nom_decede'=>'MEZUI Alphonsine',  'date_deces'=>'2024-04-18','lieu_deces'=>'Douala',   'sexe'=>'F','date_naiss_decede'=>'1970-05-22','lieu_naiss_decede'=>'Yaoundé',  'age'=>53,'profession_decede'=>'Commerçante',   'declaration'=>'MEZUI Jean',     'secretaire'=>'tchamba_paul',  'officier'=>'ngo_marie'],
            ['nom_decede'=>'KEMAJOU David',     'date_deces'=>'2024-05-09','lieu_deces'=>'Bafoussam','sexe'=>'M','date_naiss_decede'=>'1938-08-15','lieu_naiss_decede'=>'Bafoussam','age'=>85,'profession_decede'=>'Chef coutumier','declaration'=>'KEMAJOU Simon',  'secretaire'=>'feudjio_rose',  'officier'=>'amougou_jean'],
            ['nom_decede'=>'DONFACK Madeleine', 'date_deces'=>'2024-06-27','lieu_deces'=>'Bafoussam','sexe'=>'F','date_naiss_decede'=>'1955-12-10','lieu_naiss_decede'=>'Foumban',  'age'=>68,'profession_decede'=>'Infirmière',    'declaration'=>'DONFACK Pierre', 'secretaire'=>'kenfack_boris', 'officier'=>'ngo_marie'],
            ['nom_decede'=>'TSAFACK Georges',   'date_deces'=>'2024-07-31','lieu_deces'=>'Bafoussam','sexe'=>'M','date_naiss_decede'=>'1950-04-17','lieu_naiss_decede'=>'Bafoussam','age'=>74,'profession_decede'=>'Cultivateur',   'declaration'=>'TSAFACK Marie',  'secretaire'=>'tchamba_paul',  'officier'=>'amougou_jean'],
            ['nom_decede'=>'BELLA Suzanne',     'date_deces'=>'2024-09-02','lieu_deces'=>'Yaoundé',  'sexe'=>'F','date_naiss_decede'=>'1965-02-28','lieu_naiss_decede'=>'Bafoussam','age'=>59,'profession_decede'=>'Couturière',    'declaration'=>'BELLA Thomas',   'secretaire'=>'feudjio_rose',  'officier'=>'ngo_marie'],
            ['nom_decede'=>'NGOH Marcel',       'date_deces'=>'2024-10-19','lieu_deces'=>'Bafoussam','sexe'=>'M','date_naiss_decede'=>'1942-09-05','lieu_naiss_decede'=>'Mbouda',   'age'=>82,'profession_decede'=>'Retraité',      'declaration'=>'NGOH Arsène',    'secretaire'=>'kenfack_boris', 'officier'=>'amougou_jean'],
            ['nom_decede'=>'KANA Victorine',    'date_deces'=>'2024-12-01','lieu_deces'=>'Bafoussam','sexe'=>'F','date_naiss_decede'=>'1948-06-14','lieu_naiss_decede'=>'Bafoussam','age'=>76,'profession_decede'=>'Ménagère',      'declaration'=>'KANA Étienne',   'secretaire'=>'tchamba_paul',  'officier'=>'ngo_marie'],
        ];

        foreach ($deces as $i => $d) {
            $num = sprintf('2024-DEC-%04d', $i + 1);
            if (DB::table('actes_deces')->where('numero_acte', $num)->exists()) continue;

            DB::table('actes_deces')->insert(array_merge([
                'numero_acte'          => $num,
                'province'             => 'Ouest',
                'departement'          => 'Mifi',
                'arrondissement'       => 'Bafoussam I',
                'centre'               => 'Mairie Rurale de Bafoussam 1er',
                'domicile_decede'      => 'Bafoussam',
                'nom_pere_decede'      => 'Père inconnu',
                'nom_mere_decede'      => 'Mère inconnue',
                'domicile_pere_decede' => 'Bafoussam',
                'domicile_mere_decede' => 'Bafoussam',
                'dresse_le'            => Carbon::parse($d['date_deces'])->addDays(rand(1, 5)),
                'created_at'           => now(),
                'updated_at'           => now(),
            ], $d));

            [$lng, $lat] = $this->coordsDeces[$i];
            DB::statement(
                "UPDATE actes_deces SET coordonnees = ST_MakePoint(?, ?)::geography WHERE numero_acte = ?",
                [$lng, $lat, $num]
            );
        }

        // ── ACTES DE MARIAGE ────────────────────────────────────────────
        $mariages = [
            ['nom_homme'=>'KAMGA Serge',    'nom_femme'=>'NKOA Yvette',     'date_naiss_homme'=>'1985-04-12','date_naiss_femme'=>'1989-08-23','profession_homme'=>'Ingénieur',   'profession_femme'=>'Enseignante', 'regime'=>'Communauté de biens', 'secretaire'=>'tchamba_paul',  'officier'=>'amougou_jean','contracte_le'=>'2024-02-10'],
            ['nom_homme'=>'TAGNE Eric',     'nom_femme'=>'FOUDA Isabelle',   'date_naiss_homme'=>'1982-09-30','date_naiss_femme'=>'1986-03-14','profession_homme'=>'Médecin',     'profession_femme'=>'Infirmière',  'regime'=>'Séparation de biens', 'secretaire'=>'feudjio_rose',  'officier'=>'ngo_marie',   'contracte_le'=>'2024-03-22'],
            ['nom_homme'=>'BIYA François',  'nom_femme'=>'BELLA Christine',  'date_naiss_homme'=>'1978-12-05','date_naiss_femme'=>'1983-06-17','profession_homme'=>'Agriculteur', 'profession_femme'=>'Ménagère',    'regime'=>'Communauté de biens', 'secretaire'=>'kenfack_boris', 'officier'=>'amougou_jean','contracte_le'=>'2024-04-06'],
            ['nom_homme'=>'DONGMO Henri',   'nom_femme'=>'SIMO Claudine',    'date_naiss_homme'=>'1980-07-18','date_naiss_femme'=>'1984-11-29','profession_homme'=>'Comptable',   'profession_femme'=>'Secrétaire',  'regime'=>'Communauté de biens', 'secretaire'=>'tchamba_paul',  'officier'=>'ngo_marie',   'contracte_le'=>'2024-05-18'],
            ['nom_homme'=>'WAMBA Théodore', 'nom_femme'=>'ATANGANA Rose',    'date_naiss_homme'=>'1976-02-22','date_naiss_femme'=>'1981-09-04','profession_homme'=>'Commerçant',  'profession_femme'=>'Couturière',  'regime'=>'Séparation de biens', 'secretaire'=>'feudjio_rose',  'officier'=>'amougou_jean','contracte_le'=>'2024-06-29'],
            ['nom_homme'=>'NJOCK Gaston',   'nom_femme'=>'KEMAJOU Berthe',   'date_naiss_homme'=>'1983-05-10','date_naiss_femme'=>'1987-01-16','profession_homme'=>'Professeur',  'profession_femme'=>'Commerçante', 'regime'=>'Communauté de biens', 'secretaire'=>'kenfack_boris', 'officier'=>'ngo_marie',   'contracte_le'=>'2024-07-13'],
            ['nom_homme'=>'FEUDJIO Marc',   'nom_femme'=>'TSAFACK Diane',    'date_naiss_homme'=>'1979-10-28','date_naiss_femme'=>'1985-04-01','profession_homme'=>'Avocat',      'profession_femme'=>'Juriste',     'regime'=>'Séparation de biens', 'secretaire'=>'tchamba_paul',  'officier'=>'amougou_jean','contracte_le'=>'2024-08-24'],
            ['nom_homme'=>'KENGNE Pascal',  'nom_femme'=>'MVOGO Annette',    'date_naiss_homme'=>'1981-03-15','date_naiss_femme'=>'1986-07-20','profession_homme'=>'Électricien', 'profession_femme'=>'Infirmière',  'regime'=>'Communauté de biens', 'secretaire'=>'feudjio_rose',  'officier'=>'ngo_marie',   'contracte_le'=>'2024-09-07'],
            ['nom_homme'=>'MBARGA André',   'nom_femme'=>'NKENGNE Sophie',   'date_naiss_homme'=>'1977-08-06','date_naiss_femme'=>'1982-12-11','profession_homme'=>'Militaire',   'profession_femme'=>'Ménagère',    'regime'=>'Communauté de biens', 'secretaire'=>'kenfack_boris', 'officier'=>'amougou_jean','contracte_le'=>'2024-10-15'],
            ['nom_homme'=>'FOTSO Roland',   'nom_femme'=>'DONFACK Paulette', 'date_naiss_homme'=>'1975-11-19','date_naiss_femme'=>'1980-05-27','profession_homme'=>'Pasteur',     'profession_femme'=>'Enseignante', 'regime'=>'Communauté de biens', 'secretaire'=>'tchamba_paul',  'officier'=>'ngo_marie',   'contracte_le'=>'2024-11-30'],
        ];

        foreach ($mariages as $i => $m) {
            $num = sprintf('2024-MAR-%04d', $i + 1);
            if (DB::table('actes_mariage')->where('numero_acte', $num)->exists()) continue;

            DB::table('actes_mariage')->insert(array_merge([
                'numero_acte'               => $num,
                'province'                  => 'Ouest',
                'departement'               => 'Mifi',
                'arrondissement'            => 'Bafoussam I',
                'centre'                    => 'Mairie Rurale de Bafoussam 1er',
                'race_homme'                => 'Bamiléké',
                'race_femme'                => 'Bamiléké',
                'groupement_homme'          => 'Bafoussam',
                'groupement_femme'          => 'Bafoussam',
                'residence_homme'           => 'Bafoussam',
                'residence_femme'           => 'Bafoussam',
                'consentement_epoux'        => 'Oui',
                'consentement_epouse'       => 'Oui',
                'consentement_chef_famille' => 'Oui',
                'opposition'                => 'Non',
                'dot_montant_convenu'       => rand(200, 800) * 1000,
                'dot_montant_verse'         => rand(100, 200) * 1000,
                'celebre_le'                => Carbon::parse($m['contracte_le'])->addDays(1),
                'created_at'                => now(),
                'updated_at'                => now(),
            ], $m));

            [$lng, $lat] = $this->coordsMariage[$i];
            DB::statement(
                "UPDATE actes_mariage SET coordonnees = ST_MakePoint(?, ?)::geography WHERE numero_acte = ?",
                [$lng, $lat, $num]
            );
        }
    }
}
