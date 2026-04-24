import { BrowserRouter, Routes, Route } from "react-router-dom";
import Auth from './pages/Auth.jsx'
import Principal from './pages/Principal.jsx'
import Renta from './pages/Renta.jsx'
import "./App.css"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Principal />} />
        <Route path="/renta" element={<Renta />} />
        <Route path="/login" element={<Auth />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
