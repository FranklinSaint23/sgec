// SignupSigninAnimated.jsx
import React, { useState, useEffect, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './../styles/SignupPage.css';
import { useNavigate } from 'react-router-dom';

function SignupPage() {
  const [isSignIn, setIsSignIn] = useState(false);

  const navigate = useNavigate();

  // RÃ©fÃ©rences pour autofocus
  const signInEmailRef = useRef(null);
  const signUpUsernameRef = useRef(null);

  const [formData, setFormData] = useState({ email: '', password: '', username: '' });
  const [strength, setStrength] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [loginSuccess, setLoginSuccess] = useState('');
  const [loginRememberMe, setLoginRememberMe] = useState(false);

  // Modal connexion
  const [showModal, setShowModal] = useState(false);
  const [modalPhase, setModalPhase] = useState('loading'); // loading, success, error
  const [phase, setPhase] = useState('loading');


  // Effet pour autofocus dynamique quand on change de mode
  useEffect(() => {
    if (isSignIn) {
      signInEmailRef.current?.focus();
    } else {
      signUpUsernameRef.current?.focus();
    }
  }, [isSignIn]);

  const toggleMode = () => {
    setIsSignIn(!isSignIn);
    setError('');
    setSuccess('');
    setLoginError('');
    setLoginSuccess('');
  };

  // Analyse simple force mot de passe
  const checkPasswordStrength = (value) => {
    if (value.length < 8) return 'Faible';
    if (/[A-Z]/.test(value) && /[0-9]/.test(value) && /[\W_]/.test(value)) return 'Fort';
    if (/[A-Z]/.test(value) && /[0-9]/.test(value)) return 'Moyen';
    return 'Faible';
  };

  const getStrengthColor = () => {
    switch (strength.toLowerCase()) {
      case 'faible':
        return 'danger';
      case 'moyen':
        return 'warning';
      case 'fort':
        return 'success';
      default:
        return '';
    }
  };

  const getStrengthPercent = () => {
    switch (strength.toLowerCase()) {
      case 'faible':
        return 33;
      case 'moyen':
        return 66;
      case 'fort':
        return 100;
      default:
        return 0;
    }
  };

  // Handlers formulaires inscription
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === 'password') {
      setStrength(checkPasswordStrength(value));
    }
  };

  const handleRememberMeChange = (e) => {
    setRememberMe(e.target.checked);
  };

  // Handler inscription submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (!emailRegex.test(formData.email)) {
      setError('Email invalide');
      return;
    }

    if (formData.password.length < 8) {
      setError('Mot de passe trop court (min 8 caractÃ¨res)');
      return;
    }

    if (!formData.username.trim()) {
      setError("Le nom d'utilisateur est requis");
      return;
    }

    try {
      const res = await fetch('http://192.168.43.83:8000/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Ã‰chec de l'inscription. Veuillez rÃ©essayer.");
      }

      await res.json();
      setSuccess('Inscription rÃ©ussie');
      setFormData({ username: '', password: '', email: '' });
      setStrength('');
      setTimeout(() => {
        setIsSignIn(true);
        setSuccess('');
      }, 2000);
    } catch (err) {
      setError(err.message);
    }
  };

  // Handlers login
  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData({ ...loginData, [name]: value });
  };

  const handleLoginRememberMeChange = (e) => {
    setLoginRememberMe(e.target.checked);
  };

  // Handler login submit
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginSuccess('');
    setShowModal(true);
    setModalPhase('loading');

    if (!loginData.email || !loginData.password) {
      setModalPhase('error');
      setLoginError('Veuillez remplir tous les champs');
      setTimeout(() => setShowModal(false), 3000);
      return;
    }

    try {
      const res = await fetch('http://192.168.43.83:8000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(loginData),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Ã‰chec de la connexion');
      }

      const data = await res.json();

      // Sauvegarde email dans localStorage
      localStorage.setItem('userEmail', data.user.email);
      localStorage.setItem('userName', data.user.username);
      localStorage.setItem('userRole', data.user.role);
      localStorage.setItem("userId", data.user.id);
      localStorage.setItem("userCreatedAt", data.user.created_at);
      localStorage.setItem("token", data.token);





      if (loginRememberMe) {
        localStorage.setItem('rememberMe', 'true');
      } else {
        localStorage.removeItem('rememberMe');
      }

      setModalPhase('success');
      setTimeout(() => {
        setShowModal(false);
        navigate('/dashboard');
      }, 3000);
      setLoginData({ email: '', password: '' });
    } catch (err) {
      setModalPhase('error');
      setLoginError(err.message || 'Ã‰chec de la connexion. Email ou mot de passe incorrect.');
      setTimeout(() => setShowModal(false), 3000);
    }


  };

  return (
    <div className='bg-light min-vh-100 d-flex align-items-center justify-content-center'>
      <div className={`auth-wrapper ${isSignIn ? 'sign-in-mode' : ''} shadow-xs`}>
        <div className="image-panel text-overlay">
          <img src="/assets/e-act.png" alt="background" />
          
        </div>

        <div className="form-panel">
          <div className="form-box">

            {isSignIn ? (
              <div className="form-inner">
              <h2 className="fw-bold mb-3 text-info">Bienvenue</h2>
                <p className="text-danger mb-4">Se connecter pour continuer.</p>

                <form onSubmit={handleLoginSubmit}>
                  <div className='input-group mb-3'>
                    <div className='input-group-text'><i className='bi bi-envelope'></i></div>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="Email"
                      name="email"
                      value={loginData.email}
                      onChange={handleLoginChange}
                      required
                      ref={signInEmailRef}
                      autoComplete="email"
                    />
                  </div>

                  <div className='input-group mb-3'>
                    <div className='input-group-text'><i className='bi bi-key'></i></div>
                    <input
                      type="password"
                      className="form-control"
                      placeholder="Mot de passe"
                      name="password"
                      value={loginData.password}
                      onChange={handleLoginChange}
                      required
                      autoComplete="password"
                    />
                  </div>

                  <div className="form-check mb-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="loginRemember"
                      checked={loginRememberMe}
                      onChange={handleLoginRememberMeChange}
                    />
                    <label className="form-check-label" htmlFor="loginRemember">
                      Se souvenir de moi
                    </label>
                  </div>

                  <button className="btn btn-outline-success w-100 fw-bold" type="submit">
                    <i className="bi bi-box-arrow-right me-2"></i> Se Connecter
                  </button>
                </form>

                <p className="mt-3 text-muted">
                  Pas de compte?{' '}
                  <span
                    className="link-warning toggle-btn fw-bold"
                    onClick={toggleMode}
                    style={{ cursor: 'pointer' }}
                  >
                    S'inscrire
                  </span>
                </p>
              </div>
            ) : (
              <div className="form-inner">
                <h1 className="fw-bold mb-2 text-primary">
                  <i className='text-success'>E-</i>
                  <span className="text-warning">
                    <span className='text-danger'>A</span>CT
                  </span>
                </h1>
                <p className="text-success mb-4">Inscrire un utilisateur pour E-ACT.</p>

                <form onSubmit={handleSubmit}>
                  <div className='input-group mb-3'>
                    <div className='input-group-text'><i className='bi bi-person'></i></div>
                    <input
                      type="text"
                      className="form-control"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      placeholder="Nom d'utilisateur"
                      required
                      ref={signUpUsernameRef}
                      autoComplete="username"
                    />
                  </div>

                  <div className='input-group mb-3'>
                    <div className='input-group-text'><i className='bi bi-envelope'></i></div>
                    <input
                      type="email"
                      className="form-control"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Email"
                      required
                      autoComplete="email"
                    />
                  </div>

                  <div className='input-group'>
                    <div className='input-group-text'><i className='bi bi-key'></i></div>
                    <input
                      type={`password`}
                      className={`form-control border-${getStrengthColor()}`}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Mot de passe"
                      required
                      autoComplete="new-password"
                    />
                  </div>

                  <div className="progress my-2" style={{ height: '6px' }}>
                    <div
                      className={`progress-bar bg-${getStrengthColor()}`}
                      role="progressbar"
                      style={{ width: `${getStrengthPercent()}%` }}
                      aria-valuenow={getStrengthPercent()}
                      aria-valuemin="0"
                      aria-valuemax="100"
                    />
                  </div>

                  <div className="form-check mb-3 mt-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="remember"
                      checked={rememberMe}
                      onChange={handleRememberMeChange}
                    />
                    <label className="form-check-label" htmlFor="remember">
                      Se souvenir de moi
                    </label>
                  </div>

                  <button className="btn btn-outline-warning w-100 fw-bold" type="submit">
                    <i className="bi bi-box-arrow-in-right me-2"></i> S'inscrire
                  </button>
                </form>

                <p className="mt-3 text-muted">
                  DÃ©jÃ  un utilisateur?{' '}
                  <span
                    className="link-success toggle-btn fw-bold"
                    onClick={toggleMode}
                    style={{ cursor: 'pointer' }}
                  >
                    Se Connecter
                  </span>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL CONNEXION */}
      {showModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content text-center">
              <div className="modal-body">
                {modalPhase === 'loading' && (
                  <div className="d-flex flex-column align-items-center justify-content-center">
                    <div className="spinner-border text-primary" role="status" style={{ width: '4rem', height: '4rem' }}></div>
                    <p className="mt-3">Connexion en cours...</p>
                  </div>
                )}
                {modalPhase === 'success' && (
                  <div className="d-flex flex-column align-items-center justify-content-center">
                    <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '3rem' }}></i>
                    <p className="mt-3 fw-bold">Connexion rÃ©ussie !</p>
                  </div>
                )}
                {modalPhase === 'error' && (
                  <div className="d-flex flex-column align-items-center justify-content-center">
                    <i className="bi bi-x-circle-fill text-danger" style={{ fontSize: '3rem' }}></i>
                    <p className="mt-3 fw-bold">{loginError}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default SignupPage;

