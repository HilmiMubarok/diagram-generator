import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { PinGate } from './components/PinGate.tsx'

createRoot(document.getElementById('root')!).render(
  <PinGate>
    <App />
  </PinGate>
)
