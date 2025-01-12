import React from "react";

interface Specification {
  name: string;
  value: string;
}

interface AddProductSpecificationsProps {
  shortSpecs: Specification[];
  setShortSpecs: React.Dispatch<React.SetStateAction<Specification[]>>;
  fullSpecs: Specification[];
  setFullSpecs: React.Dispatch<React.SetStateAction<Specification[]>>;
}

const AddProductSpecifications: React.FC<AddProductSpecificationsProps> = ({
  shortSpecs,
  setShortSpecs,
  fullSpecs,
  setFullSpecs,
}) => {
  // Функция для добавления строки в неполные характеристики
  const addShortSpecRow = () => {
    setShortSpecs([...shortSpecs, { name: "", value: "" }]);
  };

  // Функция для добавления строки в полные характеристики
  const addFullSpecRow = () => {
    setFullSpecs([...fullSpecs, { name: "", value: "" }]);
  };

  // Функция для удаления строки в неполных характеристиках
  const removeShortSpecRow = (index: number) => {
    setShortSpecs(shortSpecs.filter((_, i) => i !== index));
  };

  // Функция для удаления строки в полных характеристиках
  const removeFullSpecRow = (index: number) => {
    setFullSpecs(fullSpecs.filter((_, i) => i !== index));
  };

  // Функция для массового добавления строк в неполные характеристики
  const bulkAddShortSpecs = (number: number) => {
    const newSpecs = Array.from({ length: number }, () => ({
      name: "",
      value: "",
    }));
    setShortSpecs([...shortSpecs, ...newSpecs]);
  };

  // Функция для массового добавления строк в полные характеристики
  const bulkAddFullSpecs = (number: number) => {
    const newSpecs = Array.from({ length: number }, () => ({
      name: "",
      value: "",
    }));
    setFullSpecs([...fullSpecs, ...newSpecs]);
  };

  return (
    <div>
      <h3>Неполные характеристики</h3>
      {shortSpecs.map((spec, index) => (
        <div key={index}>
          <input
            type="text"
            placeholder="Имя характеристики"
            value={spec.name}
            onChange={(e) =>
              setShortSpecs(
                shortSpecs.map((item, i) =>
                  i === index ? { ...item, name: e.target.value } : item
                )
              )
            }
          />
          <input
            type="text"
            placeholder="Значение характеристики"
            value={spec.value}
            onChange={(e) =>
              setShortSpecs(
                shortSpecs.map((item, i) =>
                  i === index ? { ...item, value: e.target.value } : item
                )
              )
            }
          />
          <button
            className="button-icon"
            onClick={() => removeShortSpecRow(index)}
          >
            -
          </button>
        </div>
      ))}
      <button className="button-icon" onClick={addShortSpecRow}>
        +
      </button>
      <button
        className="button-icon"
        onClick={() => {
          const number = prompt("Сколько строк добавить?");
          if (number && !isNaN(Number(number))) {
            bulkAddShortSpecs(Number(number));
          }
        }}
      >
        *
      </button>

      <h3>Полные характеристики</h3>
      {fullSpecs.map((spec, index) => (
        <div key={index}>
          <input
            type="text"
            placeholder="Имя характеристики"
            value={spec.name}
            onChange={(e) =>
              setFullSpecs(
                fullSpecs.map((item, i) =>
                  i === index ? { ...item, name: e.target.value } : item
                )
              )
            }
          />
          <input
            type="text"
            placeholder="Значение характеристики"
            value={spec.value}
            onChange={(e) =>
              setFullSpecs(
                fullSpecs.map((item, i) =>
                  i === index ? { ...item, value: e.target.value } : item
                )
              )
            }
          />
          <button
            className="button-icon"
            onClick={() => removeFullSpecRow(index)}
          >
            -
          </button>
        </div>
      ))}
      <button className="button-icon" onClick={addFullSpecRow}>
        +
      </button>
      <button
        className="button-icon"
        onClick={() => {
          const number = prompt("Сколько строк добавить?");
          if (number && !isNaN(Number(number))) {
            bulkAddFullSpecs(Number(number));
          }
        }}
      >
        *
      </button>
    </div>
  );
};

export default AddProductSpecifications;
