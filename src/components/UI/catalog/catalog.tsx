import React from "react";
import "./catalog.scss";

interface CatalogProps {
  onClick: () => void; // Функция, которая вызывается при клике
  isDisabled?: boolean; // Опциональный булевый проп
}

const Catalog: React.FC<CatalogProps> = ({ onClick, isDisabled = false }) => {
  return (
    <button
      className="button-categories"
      onClick={() => {
        console.log("Клик по кнопке Каталог");
        if (!isDisabled) {
          onClick();
        }
      }}
      style={{ cursor: isDisabled ? "default" : "pointer" }}
    >
      <span className="burger"></span>
      <span className="buttonValue">Каталог</span>
    </button>
  );
};

export default Catalog;
