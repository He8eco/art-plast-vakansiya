// FavoritesPage.jsx
import React, { useEffect, useState } from "react";
import { db } from "../index.js"; // Путь к вашей конфигурации Firebase
import { collection, query, where, getDocs } from "firebase/firestore";
import { Link } from "react-router-dom";
import FavoriteButton from "../components/UI/FavoriteButton";

const FavoritesPage = () => {
  const [favoriteProducts, setFavoriteProducts] = useState([]);
  const [sectionName, setSectionName] = useState("");
  const [categoryName, setCategoryName] = useState("");

  useEffect(() => {
    const fetchFavoriteProducts = async () => {
      const favorites = JSON.parse(localStorage.getItem("favorites")) || [];

      if (favorites.length === 0) {
        setFavoriteProducts([]);
        return;
      }

      const productsRef = collection(db, "product");
      const products = [];

      // Разбиваем массив favorites на подмассивы по 10 элементов
      const chunkSize = 10;
      for (let i = 0; i < favorites.length; i += chunkSize) {
        const chunk = favorites.slice(i, i + chunkSize);
        const q = query(productsRef, where("__name__", "in", chunk));
        const querySnapshot = await getDocs(q);

        querySnapshot.forEach((doc) => {
          products.push({ id: doc.id, ...doc.data() });
        });
      }

      setFavoriteProducts(products);
    };

    fetchFavoriteProducts();
  }, []);

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
                {product.mainImage && (
                  <img
                    className="product-photo"
                    src={product.mainImage}
                    alt={product.name}
                  />
                )}
                {/* Кнопка избранного */}
                <FavoriteButton productId={product.id} />
              </div>
              <div className="product-values">
                <p className="product-name">
                  {product.companyName} {product.name}
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
