import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import axios from 'axios'
import 'bootstrap/dist/css/bootstrap.css'
import App from './App.jsx'

axios.defaults.withCredentials = true; // Ensure cookies are sent with requests
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
