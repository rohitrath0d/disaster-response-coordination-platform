import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ReportPage from './pages/ReportPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import 'leaflet/dist/leaflet.css';
import MapPage from './pages/MapPage.jsx';



createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* <App /> */}

    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/report" element={<ReportPage />} />
        <Route path="/dashboard" element={<DashboardPage/>} />
        <Route path="/map" element={<MapPage/>} />
      </Routes>
    </BrowserRouter>

  </StrictMode>,
)
