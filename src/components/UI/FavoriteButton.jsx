// FavoriteButton.jsx
import React, { useState, useEffect } from "react";

const FavoriteButton = ({ productId }) => {
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    // Проверяем, находится ли товар в избранном при монтировании компонента
    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    setIsFavorite(favorites.includes(productId));
  }, [productId]);

  const handleFavoriteClick = (event) => {
    event.stopPropagation(); // Предотвращаем всплытие события клика
    event.preventDefault(); // Предотвращаем действие по умолчанию (если кнопка внутри ссылки)

    let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

    if (favorites.includes(productId)) {
      // Удаляем из избранного
      favorites = favorites.filter((id) => id !== productId);
      setIsFavorite(false);
    } else {
      // Добавляем в избранное
      favorites.push(productId);
      setIsFavorite(true);
    }

    localStorage.setItem("favorites", JSON.stringify(favorites));
  };

  return (
    <button onClick={handleFavoriteClick} className="favorite-button">
      {isFavorite ? (
        // Закрашенное сердечко для избранного товара
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="#FF0000"
          viewBox="0 0 24 24"
        >
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      ) : (
        // Пустое сердечко для не избранного товара
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          stroke="#000000"
          viewBox="0 0 24 24"
        >
          <path
            d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
            strokeWidth="2"
          />
        </svg>
      )}
    </button>
  );
};

export default FavoriteButton;
