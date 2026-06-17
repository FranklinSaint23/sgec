import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'datatables.net-bs5/css/dataTables.bootstrap5.min.css';
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import api from "../../services/api"; 


function DetailMariage() {
  const { id } = useParams();
  const [acte, setActe] = useState(null);

  useEffect(() => {
    api.get(`/actes_mariage/${id}`)
      .then(res => setActe(res.data))
      .catch(err => console.error("Erreur chargement acte :", err));
  }, [id]);

  if (!acte) {
    return <div className="text-center mt-5">Chargement...</div>;
  }

  const generatePDF = () => {
    const input = document.getElementById("acte-container");

    html2canvas(input, {
      scale: 3, // Haute résolution
      useCORS: true, // Autoriser images
      logging: false
    }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a3");
      const imgWidth = 150;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save(`acte_mariage${acte.numero_acte}.pdf`);
    });
  };


  return (
    <div className="container mt-3">

      <div
        id="acte-container"
        className="p-5 bg-light"
        style={{
          background: "#fff",
          border: "1px solid #000",
          fontFamily: "arial",
          width: "150mm", // Largeur exacte d'une page A4
          minHeight: "250mm", // Hauteur exacte d'une page A4
          margin: "auto",
          boxSizing: "border-box",
          lineHeight: "0.75"
        }}
      >

        {/* En-tête */}
        <div className="d-flex justify-content-between align-items-center mb-2">
          <div className="text-center mb-3" style={{fontSize: "0.9rem"}}>
            <div className="mb-4">
                <p className="fw-bold mb-2">PROVINCE</p>
                <i>{acte.province}</i>
            </div>
            <div className="mb-4" style={{ lineHeight: "0.2"}}>
                <p className="fw-bolder">DEPARTEMENT</p>
                <p className="mb-3"><small>DIVISION</small></p>
                <i>{acte.departement}</i>
            </div>
            <div>
                <p className="fw-bolder mb-2">ARRONDISSEMENT</p>
                <p className="mb-2"><small>SUBDIVISION</small></p>
                <i>{acte.arrondissement}</i>
            </div>
            <div className="invisible mt-4">
              <p>wovwtghmpwgpmvgpg</p>
            </div>
          
         
         </div>

         <div className="text-center" style={{ lineHeight: "0.2", fontSize: "0.9rem"}}>
            <div className="mb-4">
                <p className="fw-bold">République du Cameroun</p>
                <p><small>Paix – Travail – Patrie</small></p>
                <p className="mx-auto mb-4" style={{ borderBottom: "2px solid #000", width: "50px" }}></p>

            </div>
            <div className="mt-1">
                <p>Republic of Cameroon</p>
                <p><small>Peace – Work – Fatherland</small></p>
                <p className="mx-auto mb-4" style={{ borderBottom: "2px solid #000", width: "50px" }}></p>

            </div>
            <div className="pt-5" style={{
                background: "#fff",
                border: "1px dashed #000",
                width: "150px", 
                minHeight: "100px", 
                margin: "auto", }}>Photo 4x4
            </div>
           
         </div>
        </div>
        
        <div className="text-center mb-3 mt-2">
             <p className="fs-5 fw-bolder mb-1">CENTRE D’ETAT CIVIL</p>
             <p className="mb-3"><small>CIVIL STATUS REGISTRATION CENTRE</small></p>
             <p className=""><strong>De - of : </strong><i>{acte.centre}</i></p>
        </div>

        <div className="d-flex justify-content-between align-items-center">
            <div>
                <h4 className="fw-bold mb-1 fs-3">ACTE DE MARIAGE </h4>
                <p className="text-center fs-5">MARRIAGE CERTIFICATE</p>
            </div>
            <div>
                <p className="fw-bold">N° <span className="text-danger fs-5">{acte.numero_acte}</span></p>
            </div>
        </div>
        <p className="mx-auto mb-4" style={{ borderBottom: "2px solid #000", width: "200px" }}></p>

           
        
        

        {/* Infos homme */}
        <div style={{lineHeight: "1.25"}} className="">
            <p className="mb-2"><strong>Contracté le :</strong> ..................... <i>{acte.contracte_le} .............. </i></p>
            <p className="mb-2 ms-3"><strong>1er </strong> : .......................... <i>{acte.nom_homme} ........................... </i></p>
            <p className="mb-2"><strong>Fils de :</strong> ................................ <i>{acte.nom_pere_homme} ...................... </i></p>
            <p className="mb-2"><strong>Et de :</strong> ......................... <i>{acte.nom_mere_homme} ........................ </i></p>
            <p className="mb-2"><strong>Né le :</strong> ............................... <i>{acte.date_naiss_homme} ........................... </i></p>
            <p className="mb-2"><strong>Race </strong> : ............................... <i>{acte.race_homme} ............................... </i></p>
            <p className="mb-2"><strong>Groupement :</strong> .............................. <i>{acte.groupement_homme} ............................ </i></p>
            <p className="mb-2"><strong>Subdivision :</strong> ............................ <i>{acte.subdivision_homme} ............................ </i></p>
            <p className="mb-2"><strong>Région </strong> ................................ <i>{acte.region_homme} ................................... </i></p>
            <p className="mb-2"><strong>Profession </strong> : ............................... <i>{acte.profession_homme} ............................ </i></p>
            <p className="mb-2"><strong>Résidence :</strong> ................................. <i>{acte.residence_homme} .......................... </i></p>
          </div>

        {/* Infos femme */}
          <div style={{lineHeight: "1.25"}}>
            <p className="mb-2 ms-3"><strong>2e et </strong> : ............................ <i>{acte.nom_femme} ................................. </i></p>
            <p className="mb-2"><strong>Fils de :</strong> ............................... <i>{acte.nom_pere_femme} ............................ </i></p>
            <p className="mb-2"><strong>Et de :</strong> ............................. <i>{acte.nom_mere_femme} ............................... </i></p>
            <p className="mb-2"><strong>Né le :</strong> .............................. <i>{acte.date_naiss_femme} ............................ </i></p>
            <p className="mb-2"><strong>Race </strong> : ............................... <i>{acte.race_femme} .................................. </i></p>
            <p className="mb-2"><strong>Groupement :</strong> .............................. <i>{acte.groupement_femme} ............................. </i></p>
            <p className="mb-2"><strong>Subdivision :</strong> ............................... <i>{acte.subdivision_femme} ............................ </i></p>
            <p className="mb-2"><strong>Région </strong> ................................... <i>{acte.region_femme} ................................. </i></p>
            <p className="mb-2"><strong>Profession </strong> : ............................. <i>{acte.profession_femme} ............................. </i></p>
            <p className="mb-2"><strong>Résidence :</strong> ............................... <i>{acte.residence_femme} ............................... </i></p>
        </div>

        {/* consentememt */}
          <div style={{lineHeight: "1.25"}} className="mb-3">
            <p className="mb-2"><strong>Consentement des époux :</strong> ................. <i>{acte.consentement_epoux} ....................... </i></p>
            <p className="mb-2"><strong>Consentement du chef de famille :</strong> ................. <i>{acte.consentement_chef_famille} ................ </i></p>
            <p className="mb-2 ms-3"><strong>de l'épouse </strong> : ......................... <i>{acte.consentement_epouse} ........................ </i></p>
            <p className="mb-2 ms-3"><strong>de l'époux </strong> : ........................ <i>{acte.consentement_epoux} ................................. </i></p>
            <p className="mb-2"><strong>Oppositions :</strong> ...................... <i>{acte.opposition === "Non" ? "Pas d'opposition" : "Non"} .............. </i></p>
          </div>

          {/* dot */}
          <div className="text-center fw-bolder mb-3">DOT :</div>
          <div style={{lineHeight: "1.25"}}>
            <p className="mb-2"><strong>Montant convenu </strong> : ................... <i>{acte.dot_montant_convenu} ..................... </i></p>
            <p className="mb-2"><strong>Somme versée :</strong> ....................... <i>{acte.dot_montant_verse} ....................... </i></p>
            <p className="mb-2"><strong>Date du versement :</strong> ................... <i>{acte.date_versement} ....................... </i></p>
            <p className="mb-2"><strong>Dates et montant des versements complémentaires :</strong> ...................... <i>{acte.date_versement_complementaire} ........... </i></p>
          </div>

          {/* Temoins */}
          <div className="text-center fw-bolder mb-3">TEMOINS :</div>
          <div style={{lineHeight: "1.25"}} className="mb-4">
            <p className="mb-2"><strong>Mari, 1er </strong> : ....... <i>{acte.temoin1_homme} ......... </i> <strong>Femme, 1er </strong> : ....... <i>{acte.temoin1_femme} ......... </i></p>
            <p className="mb-2"><strong>Mari, 1er </strong> : ....... <i>{acte.temoin2_homme} ......... </i> <strong>Femme, 1er </strong> : ....... <i>{acte.temoin2_femme} ......... </i></p>
          </div>
        
        

        {/* Déclaration */}
        <div style={{lineHeight: "0.5"}}>
            <p className="mb-2"><strong>Dressé le :</strong> .................... <i>{acte.contracte_le} ................. </i></p>
            <p className="mb-2"><small>Draw up on the</small></p>
            <p style={{lineHeight: "1.2"}} className="mb-0"><strong>Lesquels ont certifié la sincerité de la présente déclaration,</strong></p>
            <p ><small>Who attested to the truth of this declaration, </small></p>
            <p className="mb-0" style={{lineHeight: "1.2"}}><strong>Par nous, </strong> ............ <i>{acte.officier} .......... </i> <strong>Officier de l'état civil du centre de : </strong> ....... <i>{acte.centre}</i> ........</p>
            <p className=""><small>By us, civil status registrar for</small></p>
            <p className="mb-2"><strong>Assisté de :</strong> ............ <i>{acte.secretaire} ................. </i></p>
            <p className="mb-3"><small>In the pressence of</small></p>
        </div>
        

        {/* Signatures */}
        <div className="d-flex justify-content-between mt-4 mb-5">
          <div>
            <p className="mb-1"><strong><small>Sécretaire d'Etat Civil</small></strong></p>
            <p className="mb-5"><small>Civil Status Registrar</small></p>
          </div>
          <div>
            <p className="mb-1"><strong><small>Signature de l’Officier d'Etat Civil</small></strong></p>
            <p className="mb-5"><small>Signature of Registrar</small></p>
          </div>
        </div>
      </div>
      <div className="mb-4 d-flex justify-content-between">
        <Link to="/dashboard?page=list_mariage" className="btn btn-secondary m-0">⬅ Retour</Link>
        <button className="btn btn-primary" onClick={generatePDF}>
            <i className="bi bi-printer fs-3"></i>
        </button>
        
      </div>
    </div>
  );
}

export default DetailMariage;
