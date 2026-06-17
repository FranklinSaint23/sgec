const today = () => new Date();

const parseDate = (str) => {
  if (!str) return null;
  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
};

const diffAns = (dateOlder, dateNewer) => {
  if (!dateOlder || !dateNewer) return null;
  return (dateNewer - dateOlder) / (1000 * 60 * 60 * 24 * 365.25);
};

export function validerNaissance(formData) {
  const alertes = [];
  const dateNaiss = parseDate(formData.date_naiss);
  const dateNaissPere = parseDate(formData.date_naiss_pere);
  const dateNaissMere = parseDate(formData.date_naiss_mere);

  if (dateNaiss && dateNaiss > today()) {
    alertes.push("La date de naissance de l'enfant est dans le futur.");
  }

  if (dateNaiss && dateNaissPere) {
    const diff = diffAns(dateNaissPere, dateNaiss);
    if (diff !== null && diff < 15) {
      alertes.push(`Incohérence : le père aurait moins de 15 ans à la naissance de l'enfant (écart : ${Math.round(diff)} ans).`);
    }
    if (dateNaissPere > dateNaiss) {
      alertes.push("Incohérence : le père est né après l'enfant.");
    }
  }

  if (dateNaiss && dateNaissMere) {
    const diff = diffAns(dateNaissMere, dateNaiss);
    if (diff !== null && diff < 15) {
      alertes.push(`Incohérence : la mère aurait moins de 15 ans à la naissance de l'enfant (écart : ${Math.round(diff)} ans).`);
    }
    if (dateNaissMere > dateNaiss) {
      alertes.push("Incohérence : la mère est née après l'enfant.");
    }
  }

  if (dateNaiss && dateNaissPere && dateNaissMere) {
    const agePere = diffAns(dateNaissPere, dateNaiss);
    const ageMere = diffAns(dateNaissMere, dateNaiss);
    if (agePere !== null && ageMere !== null && Math.abs(agePere - ageMere) > 40) {
      alertes.push(`Attention : écart d'âge inhabituel entre le père et la mère (${Math.round(Math.abs(agePere - ageMere))} ans).`);
    }
  }

  return alertes;
}

export function validerDeces(formData) {
  const alertes = [];
  const dateDeces = parseDate(formData.date_deces);
  const dateNaissDecede = parseDate(formData.date_naiss_decede);
  const age = formData.age ? parseInt(formData.age, 10) : null;

  if (dateDeces && dateDeces > today()) {
    alertes.push("La date de décès est dans le futur.");
  }

  if (dateDeces && dateNaissDecede) {
    if (dateNaissDecede > dateDeces) {
      alertes.push("Incohérence : la date de naissance est postérieure à la date de décès.");
    }
    const ageCalcule = diffAns(dateNaissDecede, dateDeces);
    if (ageCalcule !== null && age !== null && Math.abs(ageCalcule - age) > 2) {
      alertes.push(`Incohérence : l'âge saisi (${age} ans) ne correspond pas aux dates (${Math.round(ageCalcule)} ans calculés).`);
    }
    if (ageCalcule !== null && ageCalcule > 130) {
      alertes.push(`Âge calculé inhabituel : ${Math.round(ageCalcule)} ans.`);
    }
  }

  return alertes;
}

export function validerMariage(formData) {
  const alertes = [];
  const today_ = today();

  const dateNaissHomme = parseDate(formData.date_naiss_homme);
  const dateNaissFemme = parseDate(formData.date_naiss_femme);
  const dateContrat = parseDate(formData.contracte_le || formData.date_mariage);

  if (dateContrat && dateContrat > today_) {
    alertes.push("La date du mariage est dans le futur.");
  }

  if (dateNaissHomme) {
    const ageHomme = diffAns(dateNaissHomme, dateContrat || today_);
    if (ageHomme !== null && ageHomme < 18) {
      alertes.push(`L'époux est mineur (${Math.round(ageHomme)} ans).`);
    }
  }

  if (dateNaissFemme) {
    const ageFemme = diffAns(dateNaissFemme, dateContrat || today_);
    if (ageFemme !== null && ageFemme < 18) {
      alertes.push(`L'épouse est mineure (${Math.round(ageFemme)} ans).`);
    }
  }

  if (dateNaissHomme && dateNaissFemme) {
    const ecart = Math.abs(diffAns(dateNaissHomme, dateNaissFemme));
    if (ecart !== null && ecart > 40) {
      alertes.push(`Attention : écart d'âge inhabituel entre les époux (${Math.round(ecart)} ans).`);
    }
  }

  return alertes;
}
