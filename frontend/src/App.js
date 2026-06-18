import { HashRouter as BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import SignupPage from './connexion/SignupPage';
import Dashboard from './components/Dashboard';
import './App.css';
import '@fontsource/inter/400-italic.css';
import Logout from './connexion/logout';
import ProtectedRoute from './utils/ProtectedRoute'; 
import 'bootstrap/dist/css/bootstrap.min.css'; // important
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import $ from 'jquery';
import 'datatables.net-bs5/css/dataTables.bootstrap5.min.css';
import 'datatables.net-bs5';
import DetailNaiss from './actes/naissance/DetailNaiss';
import DetailMariage from './actes/mariage/DetailMariage';
import PublierMariage from './actes/mariage/PublierMariage';
import ReconnaitreEnfant from './actes/naissance/ReconnaitreEnfant';
import DetailDeces from './actes/deces/DetailDeces';
import DetailCopieDeces from './copie/deces/DetailCopieDeces';
import DetailCopieMariage from './copie/mariage/DetailCopieMariage';
import DetailCopieNaissance from './copie/naissance/DetailCopieNaissance';


// Rendre jQuery global
window.$ = $;
window.jQuery = $;

// 🔹 Masquer l'erreur "insertBefore"
window.addEventListener("error", function (event) {
  if (event.message && event.message.includes("insertBefore")) {
    event.preventDefault(); // Empêche l’affichage dans la console
  }
});

function LoginGuard() {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  return token ? <Navigate to="/dashboard" replace /> : <SignupPage />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginGuard />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/detail_naiss/:id" element={<DetailNaiss />} />
        <Route path="/detail_mariage/:id" element={<DetailMariage />} />
        <Route path="/publier_mariage/:id" element={<PublierMariage />} />
        <Route path="/reconnaitre_enfant/:id" element={<ReconnaitreEnfant />} />
        <Route path="/detail_deces/:id" element={<DetailDeces />} />
        <Route path="/detail_copie_deces/:id" element={<DetailCopieDeces />} />
        <Route path="/detail_copie_mariage/:id" element={<DetailCopieMariage />} />
        <Route path="/detail_copie_naiss/:id" element={<DetailCopieNaissance />} />
        <Route path="/logout" element={<Logout />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
