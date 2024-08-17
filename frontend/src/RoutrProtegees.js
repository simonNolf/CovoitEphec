import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const isLoggedIn = !!sessionStorage.getItem('token');

  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ showToast: true }} />;
  }

  return children;
};

export default ProtectedRoute;
