import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import AdminPortal from './AdminPortal.jsx'

const isAdminRoute = new URLSearchParams(window.location.search).get('admin') === '1'
  || window.location.pathname === '/admin';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {isAdminRoute ? <AdminPortal /> : <App />}
  </StrictMode>,
)
