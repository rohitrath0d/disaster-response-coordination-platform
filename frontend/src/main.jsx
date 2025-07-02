import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// import ReportPage from './pages/ReportPage.jsx';
import ReportPage from './components/pages/ReportPage';
import DashboardPage from './components/pages/DashboardPage';
import 'leaflet/dist/leaflet.css';
import "leaflet-geosearch/dist/geosearch.css";
import MapPage from './components/pages/MapPage';
import LoginPage from "./components/pages/LoginPage";
import HomePage from './components/pages/HomePage';
// import ProtectedRoute from "./components/ProtectedRoute";
import AdminBroadcastPanel from './components/pages/AdminBroadcastPanel';
import BroadcastedDisasters from './components/pages/BroadcastedDisasters';
// import ErrorBoundary from './components/ErrorBoundary';
import NearbyDisasters from './components/pages/NearbyDisasters';
import ListedDisasters from './components/pages/ListedDisasters';
import SocialMediaFeed from './components/pages/SocialMediaFeed';
import ResourceList from './components/pages/ResourceList';
import ResourceForm from './components/pages/ResourceForm';
import ResourcesPanel from './components/pages/ResourcePanel';
import NearbyResources from './components/pages/NearbyResources';
// import SideBar from './components/pages/Sidebar';
import SidebarLayout from './components/pages/SidebarLayout';
import ReportsPanel from './components/pages/ReportsPanel';
import OfficialUpdatesPanel from './components/pages/OfficialUpdatesPanel';



createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* <App /> */}

    <BrowserRouter>
      <Routes>
        {/* <Route path="/" element={<App />} /> */}
        <Route path="/home" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* <Route
          path="/report"
          element={
            <ProtectedRoute allowedRole="user">
              <ReportPage />
            </ProtectedRoute>
          }
        /> */}

        {/* <Route path="/report" element={<ReportPage />}/> */}



        {/* <Route path="/" element={<Navigate to="/sidebar" replace />}> */}
        <Route path="/sidebar" element= {<SidebarLayout/>}>
          {/* <Route path="/dashboard" index element={<DashboardPage />} /> */}
          {/* <Route index element={<Navigate to="dashboard" replace />} /> */}
          <Route path="dashboard" element={<DashboardPage />} />

          <Route path="resources" element={<ResourcesPanel />} />
          {/* <Route path="reports" element={<ReportPage />} /> */}
          {/* <Route path="/broadcast" element={<AdminBroadcastPanel />} /> */}
          <Route path="reports" element={<ReportsPanel />} />
          <Route path="official-updates" element={<OfficialUpdatesPanel />} />
          <Route path="social-feed" element={<SocialMediaFeed />} />

        </Route>

        <Route path="/social-feed" element={<SocialMediaFeed />} />
        <Route path="/disasters/:id/resources" element={<ResourceForm />} />

        <Route path="/broadcasted" element={<BroadcastedDisasters />} />
        <Route path="/nearby-disasters" element={<NearbyDisasters />} />
        <Route path="/listed-disasters" element={<ListedDisasters />} />
        <Route path="/disasters/:id/nearby-resources" element={<NearbyResources />} />
        <Route path="/disasters/:id/resources/list" element={<ResourceList />} />
        

        {/* <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRole="admin">
              <DashboardPage />
            </ProtectedRoute>
          }
        /> */}

        <Route path="/map" element={<MapPage />} />

        {/* <Route
          path="/map"
          element={
            <ProtectedRoute allowedRole="admin">
              <MapPage />
            </ProtectedRoute>
          }
        /> */}




      </Routes>
    </BrowserRouter>

    {/* <ErrorBoundary>
      <ListedDisasters />
      </ErrorBoundary> */}



  </StrictMode>,
)
