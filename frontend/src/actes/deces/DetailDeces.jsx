import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'datatables.net-bs5/css/dataTables.bootstrap5.min.css';
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import api from "../../services/api"; 


function DetailDeces() {
  const { id } = useParams();
  const [acte, setActe] = useState(null);

  useEffect(() => {
    api.get(`/actes_deces/${id}`)
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
      pdf.save(`acte_deces${acte.numero_acte}.pdf`);
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
          width: "150mm", // Largeur exacte d'une page 
          minHeight: "250mm", // Hauteur exacte d'une page 
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
            <div className="invisible">
                <p>oeivnpnvoienvpwvwuwnp</p>
            </div>
           
         </div>
        </div>
        
        <div className="text-center mb-3">
             <p className="fs-5 fw-bolder mb-1">CENTRE D’ETAT CIVIL</p>
             <p className="mb-2"><small>CIVIL STATUS REGISTRATION CENTRE</small></p>
             <p className=""><strong>De - of : </strong><i>{acte.centre}</i></p>
        </div>

        <div className="d-flex justify-content-between align-items-center">
            <div>
                <h4 className="fw-bold mb-1">ACTE DE DECES </h4>
                <p className="text-center fs-5">DEATH CERTIFICATE</p>
            </div>
            <div>
                <p className="fw-bold">N° <span className="text-danger fs-5">{acte.numero_acte}</span></p>
            </div>
        </div>
        <p className="mx-auto mb-4" style={{ borderBottom: "2px solid #000", width: "200px" }}></p>

           
        
        

        
        <div style={{lineHeight: "0.5"}} className="">
            <p className="mb-2"><strong>Nom du décédé(e) :</strong> ......... <i>{acte.nom_decede} .............. </i></p>
            <p><small>Name of deceased</small></p>
            <p><strong>Le - </strong><small>On the</small> : ........ <i>{acte.date_deces} ............ </i></p>
            <p className="mb-2"><strong>Est décédé(e) à :</strong> ............ <i>{acte.lieu_deces} ............ </i></p>
            <p ><small>Deceased at</small></p>
            <p className="mb-3"><strong>M. </strong><small>Mr</small> ......... <i>{acte.nom_decede} .............. </i></p>
            <p><strong>De sexe - </strong><small>Sex</small> : .............. <i>{acte.sexe === "M" ? "Masculin" : "Féminin"} ................. </i></p>
        </div>
        
        
        <div style={{lineHeight: "0.5"}}>
            <p><strong>Agé(e) de - </strong><small>Aged</small> : ............ <i>{acte.age} ........... </i></p>
            <p><strong>Né le - </strong><small>Born on the</small> : ............. <i>{acte.date_naiss_decede} .......... </i></p>
            <p><strong>A - </strong><small>At</small> : ............... <i>{acte.lieu_naiss_decede} ............ </i></p>
            <p><strong>Profession - </strong><small>Occupation</small> : ........ <i>{acte.profession_decede} ............. </i></p>
            <p className="mb-2"><strong>Domicilié à :</strong> .............. <i>{acte.domicile_decede} ................ </i></p>
            <p ><small>Resident at</small></p>
        </div>

        
        <div style={{lineHeight: "0.5"}}>
            <p className="mb-2"><strong>Fils / fille de :</strong> .............. <i>{acte.nom_pere_decede} ................ </i></p>
            <p ><small>Son - Daughter of</small></p>
            <p className="mb-2"><strong>Domicilié à :</strong> .............. <i>{acte.domicile_pere_decede} ................ </i></p>
            <p ><small>Resident at</small></p>
            <p><strong>Et de - </strong><small>And of</small> : ............ <i>{acte.nom_mere_decede} ........... </i></p>
            <p className="mb-2"><strong>Domicilié à :</strong> .............. <i>{acte.domicile_mere_decede} ................ </i></p>
            <p ><small>Resident at</small></p> 
        </div>

        {/* Déclaration */}
        <div style={{lineHeight: "0.5"}}>
            <p className="mb-2"><strong>Dressé le :</strong> .......... <i>{acte.dresse_le} ........ </i></p>
            <p className="mb-2"><small>Draw up on the</small></p>
            <p className="" style={{lineHeight: "1"}}><strong>Sur la déclaration de :</strong> ........................................................
            <p ><small>In accordance with the declaration of </small></p>
             ......................................... <i>{acte.declaration} ...................................
            .................................................................................................... </i></p>
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
        <Link to="/dashboard?page=list_deces" className="btn btn-secondary m-0">⬅ Retour</Link>
        <button className="btn btn-primary" onClick={generatePDF}>
            <i className="bi bi-printer fs-3"></i>
        </button>
      </div>
    </div>
  );
}

export default DetailDeces;
