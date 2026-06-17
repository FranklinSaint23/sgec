import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircleFill } from 'react-bootstrap-icons';
import api from './../services/api'; // ⚠️ ajuste ce chemin selon où tu as placé api.js
import './../styles/Logout.css';

function Logout() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState('loading');

  useEffect(() => {
    const deconnecter = async () => {
      try {
        await api.post('/logout');
      } catch (err) {
        // Le token était peut-être déjà expiré/invalide côté serveur,
        // on continue quand même le nettoyage local
        console.error(err);
      }

      const keys = ['token', 'userEmail', 'userName', 'userRole', 'userId', 'userCreatedAt', 'rememberMe'];
      keys.forEach(k => { localStorage.removeItem(k); sessionStorage.removeItem(k); });
    };

    deconnecter();

    const loadingTimer = setTimeout(() => {
      setPhase('done');
    }, 3000);

    const redirectTimer = setTimeout(() => {
      navigate('/');
    }, 5000);

    return () => {
      clearTimeout(loadingTimer);
      clearTimeout(redirectTimer);
    };
  }, [navigate]);

  return (
    <div
      className="modal fade show"
      tabIndex="-1"
      role="dialog"
      style={{
        display: 'block',
        backgroundColor: 'rgba(0, 0, 0, 0.0)', 
        zIndex: 9999
      }}
    >
      <div className="modal-dialog modal-dialog-centered" role="document">
        <div className="modal-content text-center bg-dark text-white py-5">
          <div className="modal-body d-flex flex-column align-items-center justify-content-center">
            {phase === 'loading' ? (
              <>
                <div className="spinner-border text-light" role="status"></div>
                <p className="mt-3">Déconnexion en cours...</p>
              </>
            ) : (
              <>
                <CheckCircleFill color="limegreen" size={50} />
                <p className="mt-3 fw-bold">Déconnecté avec succès !</p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Logout;