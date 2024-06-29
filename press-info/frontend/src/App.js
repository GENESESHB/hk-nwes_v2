// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import SportInfo from './pages/SportInfo';
import Meteo from './pages/Meteo';
import About from './pages/About';
import ContactUs from './pages/ContactUs';
import ForgotPassword from './pages/forgot-password';
import ResetPassword from './pages/ResetPassword';
import Register from './pages/Register';
import Login from './pages/Login';
import Controller from './components/Controller/Controller';
import MediaServices from './components/Controller/mediainfo'; // Corrected import
import SportServices from './components/Controller/sportinfos'; // Corrected import
import MeteoServices from './components/Controller/meteoinfo'; // Corrected import
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './routes/privatRoutes';
import './App.css';

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <div>
          <Navbar />
          <div className="content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/sportinfo" element={<SportInfo />} />
              <Route path="/meteo" element={<Meteo />} />
              <Route path="/about" element={<About />} />
              <Route path="/contactus" element={<ContactUs />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/ResetPassword/:token" element={<ResetPassword />} />
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
              <Route
                path="/controller"
                element={
                  <PrivateRoute>
                    <Controller />
                  </PrivateRoute>
                }
              />
              <Route
                path="/mediainfo"
                element={
                  <PrivateRoute>
                    <MediaServices />
                  </PrivateRoute>
                }
              />
              <Route
                path="/sportinfos"
                element={
                  <PrivateRoute>
                    <SportServices />
                  </PrivateRoute>
                }
              />
              <Route
                path="/meteoinfo"
                element={
                  <PrivateRoute>
                    <MeteoServices />
                  </PrivateRoute>
                }
              />
            </Routes>
          </div>
        </div>
      </AuthProvider>
    </Router>
  );
};

export default App;
