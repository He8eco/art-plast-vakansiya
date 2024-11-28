import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import FavoriteButton from "./UI/FavoriteButton";

const PromotionBlock = ({
  promotionType,
  promotionsArray,
  categorySectionMap,
  currentUser,
}) => {
  const [productsVisibleCount, setProductsVisibleCount] = useState(3);
  const [visibleProductsStart, setVisibleProductsStart] = useState(0);
  const productsContainerRef = useRef(null);

  const totalProducts = promotionsArray.length;

  // Функция для вычисления количества видимых карточек
  const calculateVisibleCount = () => {
    const screenWidth = window.innerWidth;
    const rootFontSizeStr = window
      .getComputedStyle(document.documentElement)
      .getPropertyValue("font-size");
    const rootFontSize = parseFloat(rootFontSizeStr); // Размер `1rem` в пикселях

    const cardWidthRem = 16; // Ширина карточки в rem
    const cardMarginRem = 1; // Отступ между карточками в rem
    const cardTotalWidthRem = cardWidthRem + cardMarginRem;

    const cardTotalWidthPx = cardTotalWidthRem * rootFontSize; // Полная ширина карточки в пикселях

    const maxVisibleCards = Math.floor(screenWidth / cardTotalWidthPx);
    return Math.min(Math.max(maxVisibleCards, 1), totalProducts);
  };

  useEffect(() => {
    // Обработчик изменения размера окна
    const handleResize = () => {
      const visibleCount = calculateVisibleCount();
      setProductsVisibleCount(visibleCount);
    };

    // Устанавливаем начальное значение
    handleResize();

    // Добавляем слушатель события
    window.addEventListener("resize", handleResize);

    // Удаляем слушатель при размонтировании компонента
    return () => window.removeEventListener("resize", handleResize);
  }, [totalProducts]);

  const showNextProducts = () => {
    setVisibleProductsStart((prevStart) => {
      const newStart = (prevStart + 1) % totalProducts;
      animateScroll(newStart, "next");
      return newStart;
    });
  };

  const showPreviousProducts = () => {
    setVisibleProductsStart((prevStart) => {
      const newStart = (prevStart - 1 + totalProducts) % totalProducts;
      animateScroll(newStart, "previous");
      return newStart;
    });
  };

  const animateScroll = (newStart, direction) => {
    if (productsContainerRef.current) {
      const scrollAmount =
        productsContainerRef.current.offsetWidth / productsVisibleCount;
      productsContainerRef.current.scrollBy({
        left: direction === "next" ? scrollAmount : -scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const visibleProducts = [];
  for (let i = 0; i < productsVisibleCount; i++) {
    visibleProducts.push(
      promotionsArray[(visibleProductsStart + i) % totalProducts]
    );
  }

  return (
    <div className="promotion-block">
      <div className="stock">
        <p>{promotionType}</p>
        <div className="line"></div>
      </div>
      <div className="promotion-carousel">
        {/* Левая стрелка */}
        {totalProducts > productsVisibleCount && (
          <span className="arrow left-arrow" onClick={showPreviousProducts}>
            &lt;
          </span>
        )}

        {/* Товары */}
        <div
          className="promotion-products"
          ref={productsContainerRef}
          style={{
            display: "flex",
            overflow: "hidden",
            scrollBehavior: "smooth",
          }}
        >
          {visibleProducts.map((promotion) => {
            const sectionName = categorySectionMap[promotion.categoryName];

            if (!sectionName) {
              console.warn(
                `Не удалось получить 'sectionName' для категории ${promotion.categoryName}.`
              );
              return null;
            }

            return (
              <Link
                key={promotion.id}
                to={`/${sectionName}/${promotion.categoryName}/${promotion.productId}`}
                className="card"
                style={
                  (currentUser && {
                    height: "17rem",
                    width: "16rem",
                    margin: "1rem",
                  }) || { height: "16rem", margin: "1rem" }
                }
              >
                <FavoriteButton productId={promotion.productId} />
                {promotion.mainImage ? (
                  <img
                    src={promotion.mainImage}
                    alt={promotion.productName || "Товар без названия"}
                  />
                ) : (
                  <p>Изображение товара недоступно</p>
                )}

                <div className="product-values">
                  <p className="product-name">
                    {promotion.companyName} {promotion.productName}
                  </p>
                  <div>
                    <p
                      className={`product-price ${
                        promotion.discount ? "product-price-none" : ""
                      }`}
                    >
                      {promotion.price} ₽
                    </p>
                    {promotion.discount && (
                      <p className="product-discount-price">
                        {promotion.discount} ₽
                      </p>
                    )}
                  </div>
                  {currentUser && (
                    <p className="position">Позиция: {promotion.position}</p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>

        {/* Правая стрелка */}
        {totalProducts > productsVisibleCount && (
          <span className="arrow right-arrow" onClick={showNextProducts}>
            &gt;
          </span>
        )}
      </div>
    </div>
  );
};

export default PromotionBlock;
