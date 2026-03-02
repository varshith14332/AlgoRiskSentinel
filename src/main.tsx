import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'leaflet/dist/leaflet.css'
import './index.css'
import { Buffer } from "buffer";
window.Buffer = Buffer;

import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
