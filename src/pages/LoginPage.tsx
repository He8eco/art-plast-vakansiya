import React, { useState } from "react";
import { auth } from "../index"; // Импорт Firebase Auth
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) {
      setErrorMessage("Пожалуйста, заполните все поля.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/about"); // Перенаправляем на страницу после успешного входа
    } catch (error: any) {
      console.error("Ошибка при входе:", error);
      // Отображаем пользовательское сообщение об ошибке
      setErrorMessage(
        error.code === "auth/wrong-password"
          ? "Неверный пароль. Попробуйте снова."
          : error.code === "auth/user-not-found"
          ? "Пользователь с таким email не найден."
          : "Ошибка при входе: " + error.message
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="editing autorization">
      <div className="title">Вход в систему</div>
      <div>
        <input
          type="email"
          placeholder="Введите email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
        />
        <br />
        <input
          type="password"
          placeholder="Введите пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
        />
      </div>
      {errorMessage && <p className="error-message">{errorMessage}</p>}
      <button
        className="button-editing"
        onClick={handleLogin}
        disabled={isLoading}
      >
        {isLoading ? "Вход..." : "Войти"}
      </button>
    </div>
  );
};

export default LoginPage;
