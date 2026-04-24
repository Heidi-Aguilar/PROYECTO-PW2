import { useState } from 'react';
import { Link } from "react-router-dom";
import './Auth.css';
import logoHeyVaquero from '../assets/images/LOGO1.png';

function Auth() {
  const [isActive, setIsActive] = useState(false);

  return (
    <div className="auth-body">
      <div className={`container ${isActive ? 'active' : ''}`}>
        
        {/* Lado del Formulario de Login */}
        <div className="form-box login">
          <form>
            <h1 className="rye-font">Login</h1>
            <div className="input-box">
              <input type="text" placeholder="Username" required />
              <i className='bx bxs-user'></i>
            </div>
            <div className="input-box">
              <input type="password" placeholder="Password" required />
              <i className='bx bxs-lock-alt'></i>
            </div>
            <Link to="/">
            <button type="submit" className="btn">Entrar</button>
            </Link>
          </form>
        </div>

        {/* Lado del Formulario de Registro */}
        <div className="form-box register">
          <form>
            <h1 className="rye-font">Registro</h1>
            <div className="input-box">
              <input type="text" placeholder="Username" required />
              <i className='bx bxs-user'></i>
            </div>
            <div className="input-box">
              <input type="email" placeholder="Email" required />
              <i className='bx bxs-envelope'></i>
            </div>
            <div className="input-box">
              <input type="password" placeholder="Password" required />
              <i className='bx bxs-lock-alt'></i>
            </div>
            <button type="submit" className="btn">Registrar</button>
          </form>
        </div>

        {/* Panel de Movimiento */}
        <div className="toggle-box">
          <div className="toggle-panel toggle-left">
            <img src={logoHeyVaquero} className="logo-panel" alt="Logo" />
            <h1 className="rye-font" style={{color: 'white'}}>¡Hola!</h1>
            <p>¿Aún no tienes cuenta?</p>
            <button className="btn" style={{background:'transparent', border:'2px solid white', width:'150px'}} onClick={() => setIsActive(true)}>Regístrate</button>
          </div>
          
          <div className="toggle-panel toggle-right">
            <img src={logoHeyVaquero} className="logo-panel" alt="Logo" />
            <h1 className="rye-font" style={{color: 'white'}}>¡Bienvenido!</h1>
            <p>¿Listo para la ruta?</p>
            <button className="btn" style={{background:'transparent', border:'2px solid white', width:'150px'}} onClick={() => setIsActive(false)}>Login</button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Auth;