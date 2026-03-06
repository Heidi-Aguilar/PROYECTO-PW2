import { useState } from 'react'
import Principal from './pages/Principal.jsx'
import "./App.css"

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Principal />
    </>
  )
}

export default App
