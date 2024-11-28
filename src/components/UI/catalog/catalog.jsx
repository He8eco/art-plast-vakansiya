import "./catalog.css";

export default function Catalog({ onClick, isDisabled }) {
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
}
