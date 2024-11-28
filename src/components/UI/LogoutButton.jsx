import React from "react";
import { auth } from "../../index.js"; // Путь к вашему файлу с конфигурацией Firebase
import { signOut } from "firebase/auth";

const LogoutButton = () => {
  const handleLogout = async () => {
    try {
      await signOut(auth);
      alert("Вы успешно вышли из системы");
      // Здесь вы можете перенаправить пользователя на страницу входа или обновить состояние приложения
    } catch (error) {
      console.error("Ошибка при выходеf:", error);
      alert("Ошибка при выходе: " + error.message);
    }
  };

  return (
    <button className="button-logout" onClick={handleLogout}>
      Выйти
    </button>
  );
};

export default LogoutButton;
