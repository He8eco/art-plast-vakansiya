import React, { useEffect, useState } from "react";
import { db } from "../index";
import { collection, query, where, getDocs } from "firebase/firestore";
import { Link } from "react-router-dom";
import FavoriteButton from "../components/UI/FavoriteButton";

// Описание интерфейса для продукта
interface Product {
  id: string;
  sectionName: string;
  categoryName: string;
  mainImage?: string;
  companyName?: string;
  name: string;
  price: number;
  discount?: number;
}

const FavoritesPage: React.FC = () => {
  const [favoriteProducts, setFavoriteProducts] = useState<Product[]>([]); // Явно указываем тип массива продуктов
  const [isLoading, setIsLoading] = useState(true); // Состояние загрузки
  const [error, setError] = useState<string | null>(null); // Состояние ошибки

  useEffect(() => {
    const fetchFavoriteProducts = async () => {
      try {
        const favoritesString = localStorage.getItem("favorites"); // Получаем строку или null
        const favorites: string[] = favoritesString
          ? JSON.parse(favoritesString)
          : []; // Проверяем на null и парсим

        if (favorites.length === 0) {
          setFavoriteProducts([]);
          setIsLoading(false);
          return;
        }

        const productsRef = collection(db, "product");
        const products: Product[] = [];

        // Разбиваем массив favorites на подмассивы по 10 элементов
        const chunkSize = 10;
        for (let i = 0; i < favorites.length; i += chunkSize) {
          const chunk = favorites.slice(i, i + chunkSize);
          const q = query(productsRef, where("__name__", "in", chunk));
          const querySnapshot = await getDocs(q);

          querySnapshot.forEach((doc) => {
            products.push({
              id: doc.id,
              ...doc.data(),
            } as Product); // Приводим данные к типу Product
          });
        }

        setFavoriteProducts(products);
      } catch (err) {
        console.error("Ошибка загрузки избранных товаров:", err);
        setError("Ошибка загрузки избранных товаров.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFavoriteProducts();
  }, []);

  if (isLoading) {
    return <p>Загрузка...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className="favorites-page">
      <h2>Избранные товары</h2>
      {favoriteProducts.length === 0 ? (
        <p>У вас нет избранных товаров.</p>
      ) : (
        <div className="flex">
          {favoriteProducts.map((product) => (
            <Link
              key={product.id}
              to={`/${product.sectionName}/${product.categoryName}/${product.id}`}
              className="card"
            >
              <div style={{ position: "relative" }}>
                {product.mainImage ? (
                  <img
                    className="product-photo"
                    src={product.mainImage}
                    alt={product.name}
                  />
                ) : (
                  <div className="placeholder-image">Нет изображения</div>
                )}
                {/* Кнопка избранного */}
                <FavoriteButton productId={product.id} />
              </div>
              <div className="product-values">
                <p className="product-name">
                  {product.companyName || "Без названия"} {product.name}
                </p>
                <div>
                  <p
                    className={`product-price ${
                      product.discount ? "product-price-none" : ""
                    }`}
                  >
                    {product.price} ₽
                  </p>
                  {product.discount && (
                    <p className="product-discount-price">
                      {product.discount} ₽
                    </p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;
