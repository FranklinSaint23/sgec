import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import api from "../../services/api"; 

function ReconnaissanceEnfant() {
  const { id } = useParams();
  const [acte, setActe] = useState(null);

  useEffect(() => {
    api
      .get(`/actes_naissance/${id}`)
      .then((res) => setActe(res.data))
      .catch((err) => console.error("Erreur chargement :", err));
  }, [id]);

  if (!acte) {
    return <div className="text-center mt-5">Chargement...</div>;
  }

  const generatePDF = () => {
    const input = document.getElementById("reconnaissance-container");
    html2canvas(input, { scale: 3 }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save(`reconnaissance_enfant_${acte.numero_acte}.pdf`);
    });
  };

  return (
    <div className="container mt-3">
      <div
        id="reconnaissance-container"
        className="p-5 bg-light"
        style={{
          border: "1px solid black",
          fontFamily: "Times New Roman, serif",
          width: "210mm",
          minHeight: "297mm",
          margin: "auto",
        }}
      >
        {/* En-tête */}
        <div className="d-flex justify-content-between">
          <div style={{ fontSize: "0.9rem" }}>
            <p><strong>RÉGION DE :</strong> ... <i>{acte.province}</i> ...</p>
            <p><strong>Département de :</strong> ... <i>{acte.departement}</i> ...</p>
            <p><strong>Arrondissement de :</strong> ... <i>{acte.arrondissement}</i> ...</p>
            <p><strong>Centre secondaire d’état civil de :</strong> ... <i>{acte.centre}</i> ...</p>
            <p><strong>Suivant l’acte de naissance N°</strong> ...<strong className="text-danger fs-5"> {acte.numero_acte} </strong>...</p>
          </div>
          <div className="text-end" style={{ fontSize: "0.9rem", lineHeight: "0.75" }}>
            <p className="me-2"><strong>RÉPUBLIQUE DU CAMEROUN</strong></p>
            <p className="me-5">Paix – Travail – Patrie</p>
          </div>
        </div>

        {/* Titre */}
        <div className="text-center my-4">
          <h4 className="fw-bold text-uppercase text-decoration-underline" style={{ lineHeight: "0.5"}}>
            DECLARATION DE RECONNAISSANCE D’ENFANT
          </h4>
          <p>
            Ordonnance N°81-02 du 29 juin 1981 et la loi N°2011/011 du 06/05/2011
          </p>
        </div>

        {/* Corps du texte */}
        <div style={{ fontSize: "0.95rem", lineHeight: "1" }}>
          

          <p>
            Nous soussigné, .......................................................................................................................................
          </p>
          <p>
            Après avoir entendu Mr ............................................. <i>{acte.nom_pere}</i> .............................................................
          </p>
          <p>
            Père naturel dans ses prétentions :la mère de l'enfant dans son consentement, et en présence des témoins dans
          </p>
          <p>
            leurs affirmations conformement à la loi n°2011/011 du 06 mai 2011, modifiant et complétant certaines 
          </p>
          <p>
            dispositions de l'ordonnance n°81/02 du 29/06/1981 en son article N° 44
          </p>
          <p>
            Déclarons que l'enfant ..................................... <i>{acte.nom}</i> ................................................
          </p>
          <p>
            Né(e) ........................ <i>{acte.date_naiss}</i> ...................... à ..................... <i>{acte.lieu}</i> .............................
          </p>
          <p>
            De mère ................................... <i>{acte.nom_mere}</i> ...................................................
          </p>
          <p>
            Née le ................... <i>{acte.date_naiss_mere}</i> .................... à ................... <i>{acte.lieu_naiss_mere}</i> .........................
          </p>
          <p>
            Profession ................................... <i>{acte.profession_mere}</i> ................ Domicilié à ..................... <i>{acte.domicile_mere}</i> ..........................<br />
          </p>
          <p>
            A pour pere (M) ........................ <i>{acte.nom_pere}</i> ................................
          </p>
          <p>
            Né le ................... <i>{acte.date_naiss_pere}</i> .................... à ................... <i>{acte.lieu_naiss_pere}</i> .........................
          </p>
          <p>
            Profession ................................... <i>{acte.profession_pere}</i> .............. Domicilié à ..................... <i>{acte.domicile_pere}</i> .....................
          </p>
          <p>
            1er témoin ......................................................................... agé de ....................... profession ...................
          </p>
          <p>
            2ème témoin ......................................................................... agé de ...................... profession ....................
          </p>

          <p style={{ lineHeight: "0.5" }}>
            Disons que cette déclaration sera annexée au registre des actes de naissance à la souche de l’acte correspondant.
          </p>

          <p className="mt-4" style={{ lineHeight: "0.5" }}>
            Lecture faite et invité à lire la déclaration, les déclarants ont signé avec nous : .... <i>{acte.officier}</i> ...
          </p>
          <p className="">
            Officier d'état civil de la    ..................................... <i>{acte.centre}</i> ...................................
          </p>
        </div>

        {/* Signatures */}
        <div className="row mt-5">
          <div className="col-6">
            <p><strong>Signatures des témoins :</strong></p>
            <p>Le père : ..............................</p>
            <p>La mère : ..............................</p>
            <p>Le 1er témoin : .........................</p>
            <p>Le 2ème témoin : ......................</p>
          </div>
          <div className="col-6 text-end">
            <p>Fait à .........................., le .......................</p>
            <p className="fw-bold mt-4">L’OFFICIER D’ETAT-CIVIL</p>
          </div>
        </div>
      </div>

      {/* Boutons */}
      <div className="mt-3 d-flex justify-content-between mb-3">
        <Link to="/dashboard?page=list_naiss" className="btn btn-secondary">
          ⬅ Retour
        </Link>
        <button className="btn btn-primary" onClick={generatePDF}>
          <i className="bi bi-printer me-2"></i> Imprimer
        </button>
      </div>
    </div>
  );
}

export default ReconnaissanceEnfant;
