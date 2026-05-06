import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import './Auth.css';
import logoHeyVaquero from '../assets/images/LOGO1.png';

function Auth() {

  const navigate = useNavigate();

  const [registerData, setRegisterData] = useState({
    nombre: "",
    apellido: "",
    pais: "",
    fechaNacimiento: "",
    correo: "",
    password: ""
  });

  const [loginData, setLoginData] = useState({
    correo: "",
    password: ""
  });

  const handleChange = (e) => {
    setRegisterData({
      ...registerData,
      [e.target.name]: e.target.value
    });
  };

  const handleLoginChange = (e) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(registerData)
      });

      const data = await response.json();

      if (response.ok) {
        alert("¡Cuenta creada con éxito! Ahora inicia sesión.");
        setRegisterData({
          nombre: "",
          apellido: "",
          pais: "",
          fechaNacimiento: "",
          correo: "",
          password: ""
        });
        setIsActive(false); // Regresar al panel de Login
      } else {
        alert(data.message || "Error al registrar");
      }

    } catch (error) {
      console.error(error);
      alert("Error de conexión con el servidor");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(loginData)
      });

      const data = await response.json();

      if (response.ok) {
        console.log(data);
        localStorage.setItem('token', data.token);
        localStorage.setItem('usuario', JSON.stringify(data.user));

        setLoginData({
          correo: "",
          password: ""
        });

        navigate("/");

      } else {
        alert(data.message || "Error al iniciar sesión");
      }

    } catch (error) {
      console.error(error);
      alert("Error de conexión");
    }
  };

  const [isActive, setIsActive] = useState(false);

  return (
    <div className="auth-body">
      <div className={`container ${isActive ? 'active' : ''}`}>
        
        {/* Lado del Formulario de Login */}
        <div className="form-box login">
          <form onSubmit={handleLogin}>
            <h1 className="rye-font">Login</h1>

            <div className="input-box">
              <input
                type="email"
                name="correo"
                placeholder="Email"
                required
                value={loginData.correo}
                onChange={handleLoginChange}
              />
              <i className='bx bxs-envelope'></i>
            </div>

            <div className="input-box">
              <input
                type="password"
                name="password"
                placeholder="Password"
                required
                value={loginData.password}
                onChange={handleLoginChange}
              />
              <i className='bx bxs-lock-alt'></i>
            </div>

            <button type="submit" className="btn">
              Iniciar sesión
            </button>
          </form>
        </div>

        {/* Lado del Formulario de Registro */}
        <div className="form-box register">
          <form onSubmit={handleRegister}>
            <h1 className="rye-font">Registro</h1>

            <div className="input-box">
              <input
                type="text"
                name="nombre"
                placeholder="Nombre"
                required
                value={registerData.nombre}
                onChange={handleChange}
              />
              <i className='bx bxs-user'></i>
            </div>

            <div className="input-box">
              <input
                type="text"
                name="apellido"
                placeholder="Apellido"
                required
                value={registerData.apellido}
                onChange={handleChange}
              />
              <i className='bx bxs-user'></i>
            </div>

            <div className="input-box">
              <input
                type="date"
                name="fechaNacimiento"
                required
                value={registerData.fechaNacimiento}
                onChange={handleChange}
              />
              <i className='bx bxs-calendar'></i>
            </div>

            <div className="input-box">
              <input
                type="text"
                name="pais"
                placeholder="País"
                required
                value={registerData.pais}
                onChange={handleChange}
              />
              <i className='bx bxs-map'></i>
            </div>

            <div className="input-box">
              <input
                type="email"
                name="correo"
                placeholder="Email"
                required
                value={registerData.correo}
                onChange={handleChange}
              />
              <i className='bx bxs-envelope'></i>
            </div>

            <div className="input-box">
              <input
                type="password"
                name="password"
                placeholder="Password"
                required
                value={registerData.password}
                onChange={handleChange}
              />
              <i className='bx bxs-lock-alt'></i>
            </div>

            <button type="submit" className="btn">
              Registrar
            </button>
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
