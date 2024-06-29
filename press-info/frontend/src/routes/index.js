// routes/index.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import Controller from '../components/Controller';
import Login from '../components/Login';
import ResetPassword from '../components/ResetPassword';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <PrivateRoute path="/controller" element={<Controller />} />
      {/* Add other routes as needed */}
    </Routes>
  );
};

export default AppRoutes;
