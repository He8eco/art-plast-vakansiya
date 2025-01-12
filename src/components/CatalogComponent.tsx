import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import Catalog from "./UI/catalog/catalog";
import SectionsList from "./listSections/listSections";

const CatalogComponent: React.FC = () => {
  const location = useLocation();
  const isHomePage =
    location.pathname === "/" || location.pathname === "/about";

  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth <= 967);
  const [isListVisible, setListVisible] = useState<boolean>(
    isHomePage ? !isMobile : false
  );
  const listRef = useRef<HTMLDivElement | null>(null);

  const handleCatalogClick = () => {
    if (isHomePage && isMobile) {
      // На главной странице на мобильном устройстве переключаем видимость списка
      setListVisible((prev) => !prev);
    } else if (!isHomePage) {
      // На других страницах переключаем видимость списка независимо от устройства
      setListVisible((prev) => !prev);
    }
    // На главной странице на десктопе кнопка некликабельна, ничего не делаем
  };

  // Отслеживаем изменение размера окна для определения мобильного устройства
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 967;
      setIsMobile(mobile);

      // Обновляем видимость списка при изменении размера окна
      if (isHomePage) {
        setListVisible(!mobile);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [isHomePage]);

  useEffect(() => {
    // При изменении маршрута обновляем состояние видимости списка
    if (isHomePage) {
      setListVisible(!isMobile);
    } else {
      setListVisible(false);
    }
  }, [location.pathname, isHomePage, isMobile]);

  // Обработчик клика вне списка для его скрытия
  const handleClickOutside = (event: MouseEvent) => {
    if (listRef.current && !listRef.current.contains(event.target as Node)) {
      setListVisible(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Определяем, должна ли кнопка быть некликабельной
  const isDisabled = isHomePage ? !isMobile : false;

  return (
    <div ref={listRef}>
      {/* Кнопка "Каталог" */}
      <Catalog onClick={handleCatalogClick} isDisabled={isDisabled} />
      {/* Отображаем список только если он должен быть видим */}
      {isListVisible && (isMobile || !isHomePage) && (
        <SectionsList
          className="active"
          onClose={() => setListVisible(false)}
        />
      )}
    </div>
  );
};

export default CatalogComponent;
