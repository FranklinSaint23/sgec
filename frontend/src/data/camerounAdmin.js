/**
 * Données administratives officielles du Cameroun
 * Structure : Région → Département → [Arrondissements]
 * Source : BUCREP / Décret n°2008/376 du 12 novembre 2008
 */
const CAMEROUN = {
  'Adamaoua': {
    'Djérem':       ['Tibati', 'Ngambe-Tikar', 'Mbakaou'],
    'Faro-et-Déo':  ['Tignère', 'Galim-Tignère', 'Mayo-Baléo'],
    'Mayo-Banyo':   ['Banyo', 'Mayo-Darlé', 'Ngan-Ha'],
    'Mbéré':        ['Meiganga', 'Djohong', 'Ngaoui', 'Borgop'],
    'Vina':         ['Ngaoundéré I', 'Ngaoundéré II', 'Ngaoundéré III', 'Martap', 'Belel', 'Mbe', 'Nyambaka'],
  },
  'Centre': {
    'Haute-Sanaga':      ['Nanga-Eboko', 'Minta', 'Lembe-Yezoum', 'Bibey', 'Nkoteng'],
    'Lékié':             ['Monatélé', 'Evodoula', 'Lobo', 'Obala', 'Sa\'a', 'Batchenga', 'Ebebda'],
    'Mbam-et-Inoubou':   ['Bafia', 'Bokito', 'Kiiki', 'Kon-Yambetta', 'Makenene', 'Ngambé-Tikar', 'Nitoukou', 'Ombessa'],
    'Mbam-et-Kim':       ['Ntui', 'Mbangassina', 'Ngoro', 'Yoko'],
    'Méfou-et-Afamba':   ['Esse', 'Awaé', 'Mbankomo', 'Mfou', 'Nkolafamba', 'Soa'],
    'Méfou-et-Akono':    ['Mbalmayo', 'Akono', 'Bikok', 'Dzeng', 'Ngoumou'],
    'Mfoundi':           ['Yaoundé I', 'Yaoundé II', 'Yaoundé III', 'Yaoundé IV', 'Yaoundé V', 'Yaoundé VI', 'Yaoundé VII'],
    'Nyong-et-Kellé':    ['Eséka', 'Bot-Makak', 'Makak', 'Matomb', 'Messondo', 'Ngog-Mapubi', 'Nyanon'],
    'Nyong-et-Mfoumou':  ['Akonolinga', 'Ayos', 'Endom', 'Kobdombo', 'Mengang'],
    'Nyong-et-So\'o':    ['Mbankomo', 'Bikok', 'Ngoumou', 'Ngoulemakong', 'Zouameyong'],
  },
  'Est': {
    'Boumba-et-Ngoko': ['Moloundou', 'Salapoumbé', 'Yokadouma'],
    'Haut-Nyong':      ['Abong-Mbang', 'Angossas', 'Doumaintang', 'Doumé', 'Lomié', 'Messamena', 'Messok', 'Mindourou', 'Ngoyla', 'Nguelemendouka', 'Somalomo'],
    'Kadéï':           ['Batouri', 'Bertoua I', 'Bertoua II', 'Diang', 'Kentzou', 'Kette', 'Mbang', 'Ndelele', 'Nguelebok', 'Ngoura', 'Ouli'],
    'Lom-et-Djérem':   ['Bétaré-Oya', 'Belabo', 'Diang', 'Doumé', 'Mandjou'],
  },
  'Extrême-Nord': {
    'Diamaré':          ['Maroua I', 'Maroua II', 'Maroua III', 'Bogo', 'Gazawa', 'Méri', 'Mindif', 'Moutourwa', 'Ndoukoula', 'Pette'],
    'Logone-et-Chari':  ['Kousseri', 'Blangoua', 'Darak', 'Fotokol', 'Goulfey', 'Hilé-Alifa', 'Logone-Birni', 'Makary', 'Ngodeni', 'Waza', 'Zina'],
    'Mayo-Danay':       ['Yagoua', 'Datcheka', 'Guémé', 'Kai-Kai', 'Kalfou', 'Maga', 'Naiberi', 'Tchatibali', 'Velé', 'Wina'],
    'Mayo-Kani':        ['Kaélé', 'Guidiguis', 'Moulvoudaye', 'Moutourwa', 'Taïbong'],
    'Mayo-Sava':        ['Mora', 'Kolofata', 'Tokombere'],
    'Mayo-Tsanaga':     ['Mokolo', 'Bourha', 'Hina', 'Koza', 'Mogodé', 'Mozogo', 'Soulédé-Roua', 'Touloum'],
  },
  'Littoral': {
    'Moungo':           ['Nkongsamba I', 'Nkongsamba II', 'Nkongsamba III', 'Bare-Bakem', 'Bonalea', 'Dibombari', 'Ébéka', 'Loum', 'Manjo', 'Mbanga', 'Melong', 'Mombo', 'Njombé-Penja'],
    'Nkam':             ['Yabassi', 'Fondonera', 'Ndom', 'Ngambé', 'Nkondjok', 'Yingui'],
    'Sanaga-Maritime':  ['Édéa I', 'Édéa II', 'Dibamba', 'Dizangué', 'Mouanko', 'Nyanon', 'Pouma'],
    'Wouri':            ['Douala I', 'Douala II', 'Douala III', 'Douala IV', 'Douala V', 'Dibombari', 'Manoka'],
  },
  'Nord': {
    'Bénoué':   ['Garoua I', 'Garoua II', 'Garoua III', 'Bibémi', 'Dembo', 'Lagdo', 'Mayo-Hourna', 'Pitoa', 'Tchéboa', 'Touroua'],
    'Faro':     ['Poli', 'Beka', 'Bouli', 'Mayo-Baleng'],
    'Mayo-Louti': ['Guider', 'Figuil', 'Mayo-Oulo', 'Mousgoy'],
    'Mayo-Rey': ['Tcholliré', 'Madingring', 'Mayo-Galké', 'Rei-Bouba', 'Touboro'],
  },
  'Nord-Ouest': {
    'Boyo':           ['Fundong', 'Belo', 'Bum'],
    'Bui':            ['Kumbo', 'Jakiri', 'Nkum', 'Oku', 'Noni', 'Mbven', 'Nkor'],
    'Donga-Mantung':  ['Nkambe', 'Ako', 'Dumbo', 'Furu-Awa', 'Misaje', 'Ndu', 'Nwa', 'Nguti'],
    'Menchum':        ['Wum', 'Befang', 'Furu-Awa', 'Fungom', 'Zhoa'],
    'Mezam':          ['Bamenda I', 'Bamenda II', 'Bamenda III', 'Bafut', 'Bali', 'Santa', 'Tubah'],
    'Momo':           ['Mbengwi', 'Batibo', 'Njikwa', 'Widikum'],
    'Ngo-Ketunjia':   ['Ndop', 'Babessi', 'Balikumbat'],
  },
  'Ouest': {
    'Bamboutos':          ['Mbouda', 'Babadjou', 'Batcham', 'Galim', 'Matazem'],
    'Haut-Nkam':          ['Bafang', 'Bakou', 'Bana', 'Banka', 'Kekem'],
    'Hauts-Plateaux':     ['Baham', 'Bamendjou', 'Bangou', 'Batie'],
    'Koupé-Manengouba':   ['Bangem', 'Nguti', 'Tombel'],
    'Menoua':             ['Dschang', 'Fongo-Tongo', 'Foréké-Dschang', 'Nkong-Ni', 'Penka-Michel', 'Santchou'],
    'Mifi':               ['Bafoussam I', 'Bafoussam II', 'Bafoussam III'],
    'Ndé':                ['Bangangté', 'Bassamba', 'Bazou', 'Tonga'],
    'Noun':               ['Foumban', 'Foumbot', 'Koutaba', 'Kouoptamo', 'Magba', 'Malentouen', 'Massangam', 'Njimom'],
  },
  'Sud': {
    'Dja-et-Lobo':   ['Sangmélima', 'Bengbis', 'Djoum', 'Meyomessi', 'Mintom', 'Mvangan', 'Ndelele', 'Oveng'],
    'Mvila':         ['Ebolowa I', 'Ebolowa II', 'Biwong-Bané', 'Biwong-Bulu', 'Efoulan', 'Mengong', 'Mvangan', 'Ngoulemakong'],
    'Océan':         ['Kribi I', 'Kribi II', 'Akom II', 'Campo', 'Lokoundjé', 'Lolodorf', 'Mvengue', 'Niété'],
    'Vallée-du-Ntem':['Ambam', 'Kyé-Ossi', 'Ma\'an', 'Olamze'],
  },
  'Sud-Ouest': {
    'Fako':     ['Buea', 'Limbe I', 'Limbe II', 'Limbe III', 'Muyuka', 'Tiko', 'West Coast'],
    'Lebialem': ['Wabane', 'Alou', 'Fontem'],
    'Manyu':    ['Mamfe', 'Akwaya', 'Bachuo-Akagbe', 'Besali', 'Eyumojock', 'Nguti', 'Tinto'],
    'Meme':     ['Kumba I', 'Kumba II', 'Kumba III', 'Konye', 'Mbonge'],
    'Ndian':    ['Mundemba', 'Ekondo-Titi', 'Idabato', 'Isangele', 'Kombo-Abedimo', 'Kombo-Itindi'],
    'Koupé-Manengouba': ['Bangem', 'Nguti', 'Tombel'],
  },
};

export const REGIONS      = Object.keys(CAMEROUN);
export const DEPARTEMENTS = (region) => region ? Object.keys(CAMEROUN[region] || {}) : [];
export const ARRONDISSEMENTS = (region, dept) =>
  (region && dept) ? (CAMEROUN[region]?.[dept] || []) : [];

export const centreDEtat = (arrondissement) =>
  arrondissement ? `Mairie de ${arrondissement}` : '';

export default CAMEROUN;
