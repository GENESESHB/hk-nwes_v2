// PrivateRoute.js
import React from 'react';
import { Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const PrivateRoute = ({ element: Element, ...rest }) => {
  const { loggedIn } = useAuth();

  return (
    <Route
      {...rest}
      element={loggedIn ? <Element /> : <Navigate to="/login" replace />}
    />
  );
};

export default PrivateRoute;
