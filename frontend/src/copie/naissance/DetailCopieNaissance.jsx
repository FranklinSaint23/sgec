import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../services/api";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";


function DetailCopieNaiss() {
  const { id } = useParams();
  const [acte, setActe] = useState(null);

  useEffect(() => {
    api.get(`/actes_naissance/${id}`)
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

      // On force l'image à occuper une page A4 entière
      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save(`acte_${acte.numero_acte}.pdf`);
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
          
         
         </div>

         <div className="text-center" style={{ lineHeight: "0.2", fontSize: "0.9rem"}}>
            <div className="mb-4">
                <p className="fw-bold">République du Cameroun</p>
                <p><small>Paix – Travail – Patrie</small></p>
                <p className="mx-auto mb-4" style={{ borderBottom: "2px solid #000", width: "50px" }}></p>

            </div>
            <div className="mt-5">
                <p>Republic of Cameroon</p>
                <p><small>Peace – Work – Fatherland</small></p>
                <p className="mx-auto mb-4" style={{ borderBottom: "2px solid #000", width: "50px" }}></p>

            </div>
            <div className="mt-5">
                <p className="fs-2 mb-1"><span className="fw-bolder">COPIE - </span>COPY</p>
            </div>
           
         </div>
        </div>
        
        <div className="text-center mb-3 mt-4">
             <p className="fs-5 fw-bolder mb-1">CENTRE D’ETAT CIVIL</p>
             <p className="mb-2"><small>CIVIL STATUS REGISTRATION CENTRE</small></p>
             <p className=""><strong>De - of : </strong><i>{acte.centre}</i></p>
        </div>

        <div className="d-flex justify-content-between align-items-center">
            <div>
                <h4 className="fw-bold mb-1">COPIE ACTE DE NAISSANCE </h4>
                <p className="text-center fs-5">BIRTH CERTIFICATE</p>
            </div>
            <div>
                <p className="fw-bold">N° <span className="text-danger fs-5">{acte.numero_acte}</span></p>
            </div>
        </div>
        <p className="mx-auto mb-4" style={{ borderBottom: "2px solid #000", width: "200px" }}></p>

           
        
        

        {/* Infos enfant */}
        <div style={{lineHeight: "0.5"}} className="">
            <p className="mb-2"><strong>Nom de l'enfant :</strong> ......... <i>{acte.nom} .............. </i></p>
            <p><small>Name of the child</small></p>
            <p><strong>Le - </strong><small>On the</small> : ........ <i>{acte.date_naiss} ............ </i></p>
            <p className="mb-2"><strong>Est né à :</strong> ............ <i>{acte.lieu} ............ </i></p>
            <p ><small>Was born at</small></p>
            <p className="mb-2"><strong>Nom de l'enfant :</strong> ......... <i>{acte.nom} .............. </i></p>
            <p ><small>Name of the child</small></p>
            <p><strong>De sexe - </strong><small>Sex</small> : .............. <i>{acte.sexe === "M" ? "Masculin" : "Féminin"} ................. </i></p>
        </div>
        
        {/* Père */}
        <div style={{lineHeight: "0.5"}}>
            <p><strong>De - </strong><small>Of</small> : ............ <i>{acte.nom_pere} ........... </i></p>
            <p><strong>Né à - </strong><small>Born at</small> : ............. <i>{acte.lieu_naiss_pere} .......... </i></p>
            <p><strong>Le - </strong><small>On the</small> : ............... <i>{acte.date_naiss_pere} ............ </i></p>
            <p className="mb-2"><strong>Domicilié à :</strong> .............. <i>{acte.domicile_pere} ................ </i></p>
            <p ><small>Resident at</small></p>
            <p><strong>Profession - </strong><small>Occupation</small> : ........ <i>{acte.profession_pere} ............. </i></p>
        </div>

        {/* Mère */}
        <div style={{lineHeight: "0.5"}}>
            <p><strong>Et de - </strong><small>And of</small> : ............ <i>{acte.nom_mere} ........... </i></p>
            <p><strong>Née à - </strong><small>Born at</small> : ............. <i>{acte.lieu_naiss_mere} .......... </i></p>
            <p><strong>Le - </strong><small>On the</small> : ............... <i>{acte.date_naiss_mere} ............ </i></p>
            <p className="mb-2"><strong>Domicilié à :</strong> .............. <i>{acte.domicile_mere} ................ </i></p>
            <p ><small>Resident at</small></p>
            <p><strong>Profession - </strong><small>Occupation</small> : ........ <i>{acte.profession_mere} ............. </i></p>
        </div>

        {/* Déclaration */}
        <div style={{lineHeight: "0.5"}}>
            <p className="mb-2"><strong>Dressé le :</strong> .......... <i>{acte.dresse} ........ </i></p>
            <p className="mb-2"><small>Draw up on the</small></p>
            <p className="mb-0" style={{lineHeight: "1.5"}}><strong>Sur la déclaration de :</strong> ................ <i>{acte.declaration} ................................
            ................................................. </i></p>
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
        <Link to="/dashboard?page=copie_naissance" className="btn btn-secondary m-0">⬅ Retour</Link>
        <button className="btn btn-primary" onClick={generatePDF}>
            <i className="bi bi-printer fs-3"></i>
        </button>
      </div>
    </div>
  );
}

export default DetailCopieNaiss;
