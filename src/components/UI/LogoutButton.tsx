import React from "react";
import { auth } from "../../index"; // Путь к вашему файлу с конфигурацией Firebase
import { signOut } from "firebase/auth";

const LogoutButton: React.FC = () => {
  const handleLogout = async (): Promise<void> => {
    try {
      await signOut(auth);
      alert("Вы успешно вышли из системы");
      // Здесь вы можете перенаправить пользователя на страницу входа или обновить состояние приложения
    } catch (error) {
      console.error("Ошибка при выходе:", error);
      alert("Ошибка при выходе: " + (error as Error).message);
    }
  };

  return (
    <button className="button-logout" onClick={handleLogout}>
      Выйти
    </button>
  );
};

export default LogoutButton;
