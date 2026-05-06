import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Header from './components/Header.jsx'
import Auth from './pages/Auth.jsx'
import Principal from './pages/Principal.jsx'
import Renta from './pages/Renta.jsx'
import Manual from './pages/Manual.jsx'
import Perfil from './pages/Perfil.jsx'
import "./App.css"

function AppContent() {
  const location = useLocation();

  // Rutas donde NO quieres mostrar header
  const hideHeaderRoutes = ["/login"];

  return (
    <>
      {!hideHeaderRoutes.includes(location.pathname) && <Header />}

      <Routes>
        <Route path="/" element={<Principal />} />
        <Route path="/renta" element={<Renta />} />
        <Route path="/manual" element={<Manual />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/login" element={<Auth />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}


export default App
