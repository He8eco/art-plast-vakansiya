import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import FavoriteButton from "./UI/FavoriteButton";
import { Promotion } from "./UI/promotions/promotion"; // Импортируем внешний Promotion

interface PromotionBlockProps {
  promotionType: string;
  promotionsArray: Promotion[]; // Используем локальный интерфейс
  categorySectionMap: Record<string, string>;
  currentUser: boolean;
}

const PromotionBlock: React.FC<PromotionBlockProps> = ({
  promotionType,
  promotionsArray,
  categorySectionMap,
  currentUser,
}) => {
  const [productsVisibleCount, setProductsVisibleCount] = useState<number>(3);
  const [visibleProductsStart, setVisibleProductsStart] = useState<number>(0);
  const productsContainerRef = useRef<HTMLDivElement | null>(null);

  const totalProducts = promotionsArray.length;

  const calculateVisibleCount = (): number => {
    const screenWidth = window.innerWidth;
    const rootFontSizeStr = window
      .getComputedStyle(document.documentElement)
      .getPropertyValue("font-size");
    const rootFontSize = parseFloat(rootFontSizeStr);

    const cardWidthRem = 16;
    const cardMarginRem = 1;
    const cardTotalWidthRem = cardWidthRem + cardMarginRem;

    const cardTotalWidthPx = cardTotalWidthRem * rootFontSize;
    const maxVisibleCards = Math.floor(screenWidth / cardTotalWidthPx);
    return Math.min(Math.max(maxVisibleCards, 1), totalProducts);
  };

  useEffect(() => {
    const handleResize = () => {
      const visibleCount = calculateVisibleCount();
      setProductsVisibleCount(visibleCount);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
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

  const animateScroll = (newStart: number, direction: "next" | "previous") => {
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
        {totalProducts > productsVisibleCount && (
          <span className="arrow left-arrow" onClick={showPreviousProducts}>
            &lt;
          </span>
        )}

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
                style={{
                  height: currentUser ? "17rem" : "16rem",
                  width: "16rem",
                  margin: "1rem",
                }}
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
