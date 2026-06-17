import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { Link } from "react-router-dom";
import 'bootstrap-icons/font/bootstrap-icons.css';
import api from "../services/api";
function Profil() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Récupération des infos de l'utilisateur depuis le localStorage
    // (si tu les stockes après login)
    const userData = {
      id: localStorage.getItem("userId"),
      username: localStorage.getItem("userName"),
      email: localStorage.getItem("userEmail"),
      role: localStorage.getItem("userRole"),
      created_at: localStorage.getItem("userCreatedAt"),
    };
    setUser(userData);
  }, []);

  if (!user) {
    return <div className="text-center mt-5">Chargement...</div>;
  }

  return (
    <div className="container mt-4">
      <div className="card shadow-lg border-0">
        <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
          <h3 className="mb-0">👤 Profil utilisateur</h3>
          <span className="badge bg-success fs-6">Connecté</span>
        </div>
        <div className="card-body">
          <div className="row">
            {/* Avatar */}
            <div className="col-md-3 text-center">
              <div
                className="rounded-circle bg-light border d-flex align-items-center justify-content-center mx-auto"
                style={{ width: "120px", height: "120px", fontSize: "50px" }}
              >
                {user.username ? user.username.charAt(0).toUpperCase() : "U"}
              </div>
              <h5 className="mt-3">{user.username}</h5>
              <span className="badge bg-info text-dark">{user.role || "Utilisateur"}</span>
            </div>

            {/* Infos principales */}
            <div className="col-md-9">
              <table className="table table-borderless">
                <tbody>
                  <tr>
                    <th className="w-25">📧 Email :</th>
                    <td>{user.email || "Non renseigné"}</td>
                  </tr>
                  <tr>
                    <th>👔 Rôle :</th>
                    <td>{user.role || "Non défini"}</td>
                  </tr>
                  <tr>
                    <th>🆔 ID Utilisateur :</th>
                    <td>{user.id}</td>
                  </tr>
                  <tr>
                    <th>📅 Date d’inscription :</th>
                    <td>
                      {user.created_at
                        ? new Date(user.created_at).toLocaleDateString()
                        : "Inconnue"}
                    </td>
                  </tr>
                  <tr>
                    <th>⚡ Statut :</th>
                    <td>
                      <span className="badge bg-success">En ligne</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Pied de page */}
        <div className="card-footer text-end">
          <Link to="/logout" className="btn btn-outline-danger">
            <i className="bi bi-box-arrow-right me-2"></i>Déconnexion
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Profil;
