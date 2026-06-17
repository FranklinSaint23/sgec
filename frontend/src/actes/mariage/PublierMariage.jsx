import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'datatables.net-bs5/css/dataTables.bootstrap5.min.css';
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import api from "../../services/api"; 


function PublierMariage() {
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

      // On force l'image à occuper une page A4 entière
      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save(`publication_mariage_acte_${acte.numero_acte}.pdf`);
    });
  };


  return (
    <div className="container mt-3">

      <div
        id="acte-container"
        className="pb-5 pt-5 px-5 bg-light"
        style={{
          background: "#fff",
          border: "1px solid #000",
          fontFamily: "arial",
          width: "180mm", // Largeur exacte d'une page A4
          minHeight: "260mm", // Hauteur exacte d'une page A4
          margin: "auto",
          boxSizing: "border-box",
          lineHeight: "0.75"
        }}
      >

        {/* En-tête */}
        <div className="d-flex justify-content-between align-items-center mb-2">
          <div className="text-center mb-3" style={{fontSize: "0.9rem", lineHeight: "0.1"}}>
            <div className="mb-4">
                <p className="fw-bold">REPUBLIQUE DU CAMEROUN</p>
                <p><small>Paix – Travail – Patrie</small></p>
            </div>
            <div className="mb-4 mt-1">
                <p className=""><span className="fw-bolder">REGION DU </span><span>{acte.province}</span></p>
            </div>
            <div className="mb-4" style={{ lineHeight: "0.2"}}>
                <p><span className="fw-bolder">DEPARTEMENT DU </span><span>{acte.departement}</span></p>
            </div>
            <div>
                <p className="mb-4"><span className="fw-bolder ">ARRONDISSEMENT DE </span>
                <span>{acte.arrondissement}</span>
                </p>
            </div>
            <div className="mb-5">
                <p className="fw-bold">CENTRE D’ETAT CIVIL</p>
                <p><span className="fw-bolder">DE</span> {acte.centre}</p>
            </div>
            <div className="border-1 pt-5" style={{
                background: "#fff",
                border: "1px dashed #000",
                width: "150px", 
                minHeight: "100px", 
                margin: "auto", }}>Photo 4x4
            </div>
          
         
         </div>

         <div className="text-center mb-3" style={{fontSize: "0.9rem", lineHeight: "0.1"}}>
            <div className="mb-4">
                <p className="fw-bold">REPUBLIC OF CAMEROON</p>
                <p><small>Peace – Work – Fatherland</small></p>
            </div>
            <div className="mb-4 mt-1">
                <p className=""><span >{acte.province} </span><span className="fw-bolder">REGION</span></p>
            </div>
            <div className="mb-4" style={{ lineHeight: "0.2"}}>
                <p><span>{acte.departement} </span><span className="fw-bolder">DIVISION</span></p>
            </div>
            <div>
                <p className="mb-4"><span>{acte.arrondissement} </span><span className="fw-bolder ">SUBDIVISION</span></p>
            </div>
            <div className="mb-5">
                <p >{acte.centre} <span className="fw-bold">CIVIL STATUS</span></p>
                <span className="fw-bold"> REGISTRATION CENTRE</span>
            </div>
            <div className="pt-4">
                <p className="">N° <span className="text-danger fs-3">{acte.numero_acte}</span></p>
            </div>
            <div className="pt-4 invisible">
                <p className="fw-bold">N° <span className="text-danger fs-3">{acte.numero_acte}</span></p>
            </div>
          
         
         </div>
        </div>
        
        <div className="text-center mb-4 mt-2">
             <p className="fs-5 fw-bolder mb-2">PUBLICATION DE MARIAGE</p>
             <i className="mb-3 fs-5">PUBLICATION DE MARIAGE</i>
        </div>

        {/* Infos enfant */}
        <div style={{lineHeight: "0.5"}} className="">
            <p className="mb-2"><strong>Il y a promesse de mariage entre M. :</strong> ................ <i>{acte.nom_homme} ................... </i></p>
            <p><small>Mr</small></p>
            <p className="mb-2"><strong>Né(e) le :</strong> ............ <i>{acte.date_naiss_homme}</i> ............... <strong>A</strong> ............. <i>{acte.residence_homme}</i> ................. </p>
            <p ><small>Born on</small></p>
            <p className="mb-2"><strong>Profession :</strong> .......................... <i>{acte.profession_homme} ........................... </i></p>
            <p ><small>Occupation</small></p>
            <p className="mb-2"><strong>Domicilié à :</strong> .............. <i>{acte.residence_homme} ................ </i></p>
            <p ><small>Resident at</small></p>
            <p className="mb-2"><strong>Fils de :</strong> .......................... <i>{acte.nom_pere_homme} .................................. </i></p>
            <p ><small>Son of</small></p>
            <p className="mb-2"><strong>Et de :</strong> ................................ <i>{acte.nom_mere_homme} ................................... </i></p>
            <p ><small>And of</small></p>

            <p ><strong>Et / And</strong></p>

            <p className="mb-2"><strong>Mlle :</strong> ................................ <i>{acte.nom_femme} ................................... </i></p>
            <p ><small>Miss</small></p>
            <p className="mb-2"><strong>Né(e) le :</strong> ............ <i>{acte.date_naiss_femme}</i> ............... <strong>A</strong> ............. <i>{acte.residence_femme}</i> ................. </p>
            <p ><small>Born on</small></p>
            <p className="mb-2"><strong>Profession :</strong> .......................... <i>{acte.profession_femme} ........................... </i></p>
            <p ><small>Occupation</small></p>
            <p className="mb-2"><strong>Domicilié à :</strong> .............. <i>{acte.residence_femme} ................ </i></p>
            <p ><small>Resident at</small></p>
            <p className="mb-2"><strong>Fils de :</strong> .......................... <i>{acte.nom_pere_femme} .................................. </i></p>
            <p ><small>Son of</small></p>
            <p className="mb-2"><strong>Et de :</strong> ................................ <i>{acte.nom_mere_femme} ................................... </i></p>
            <p ><small>And of</small></p>
            <p className="mb-2"><strong>Par la ils annoncent leur intention de s'unir dans le mariage.</strong></p>
            <p className="mb-3"><small>Hereby announce thier intention to unite in wedlock</small></p>
            <p className="mb-2" style={{lineHeight: "1"}}><strong>Toute opposition a ce mariage devra etre formulee dans un delai d'au moins un mois a dater de ce jour.</strong></p>
            <p className="mb-2"><small>Any objection to this mariage must be made known within one month from this day</small></p>
            <div className="text-end me-3 my-5">
                <p className="mb-4"><strong>Le / </strong><span>on the</span> ..................................... </p>
                <p><strong>Officier d'Etat Civil / </strong>Civil Status Registrar</p>
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

export default PublierMariage;
