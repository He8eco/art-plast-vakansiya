import React, { useContext, ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";

interface ProtectedRouteProps {
  children: ReactNode; // Дочерние элементы, которые нужно отображать
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { currentUser } = useAuth();

  // Если пользователь не авторизован, перенаправляем на главную страницу "/about"
  if (!currentUser) {
    return <Navigate to="/about" replace />;
  }

  // Если пользователь авторизован, отображаем запрошенный маршрут
  return <>{children}</>;
};

export default ProtectedRoute;
