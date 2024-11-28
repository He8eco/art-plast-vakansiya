import React, { useState } from "react";
import { auth } from "../index.js"; // Импортируйте ваш экземпляр Firebase Auth
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/about");
    } catch (error) {
      console.error("Ошибка при входе:", error);
      alert("Ошибка при входе: " + error.message);
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
        />
        <br />
        <input
          type="password"
          placeholder="Введите пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <button className="button-editing" onClick={handleLogin}>
        Войти
      </button>
    </div>
  );
};

export default LoginPage;
