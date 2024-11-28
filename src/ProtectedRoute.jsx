// ProtectedRoute.js
import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";

const ProtectedRoute = ({ children }) => {
  const { currentUser } = useContext(AuthContext);

  // Если пользователь не авторизован, перенаправляем на главную страницу "/about"
  if (!currentUser) {
    return <Navigate to="/about" replace />;
  }

  // Если пользователь авторизован, отображаем запрошенный маршрут
  return children;
};

export default ProtectedRoute;
