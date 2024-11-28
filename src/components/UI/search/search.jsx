import React, { useState, useEffect, useRef } from "react";
import { db } from "../../../index.js";
import {
  collection,
  query,
  getDocs,
  doc as firebaseDoc,
  getDoc,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "./search.css";

const Search = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleItemClick = (item) => {
    let url;
    if (item.type === "category") {
      url = `/${item.sectionName}/${item.name}`;
    } else if (item.type === "product") {
      url = `/${item.sectionName}/${item.categoryName}/${item.id}`;
    }
    if (url) {
      navigate(url);
      setSearchQuery("");
      setSuggestions([]);
    }
  };

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.length === 0) {
        setSuggestions([]);
        return;
      }

      try {
        const categoriesRef = collection(db, "categories");
        const productsRef = collection(db, "product");

        // Запрос категорий
        const categorySnapshot = await getDocs(query(categoriesRef));
        const categoriesWithSectionNames = await Promise.all(
          categorySnapshot.docs.map(async (categoryDoc) => {
            const categoryData = categoryDoc.data();
            let sectionName = "";

            if (categoryData.sectionId) {
              try {
                const sectionRef = firebaseDoc(
                  db,
                  "sections",
                  categoryData.sectionId
                );
                const sectionDoc = await getDoc(sectionRef);
                sectionName = sectionDoc.exists()
                  ? sectionDoc.data().name
                  : "Без раздела";
              } catch (sectionError) {
                console.error("Ошибка при получении раздела: ", sectionError);
              }
            }

            return {
              id: categoryDoc.id,
              ...categoryData,
              sectionName,
              type: "category",
            };
          })
        );

        const filteredCategories = categoriesWithSectionNames.filter(
          (category) =>
            category.name.toLowerCase().includes(searchQuery.toLowerCase())
        );

        // Запрос товаров
        const productSnapshot = await getDocs(query(productsRef));
        const productItems = productSnapshot.docs
          .map((productDoc) => ({
            id: productDoc.id,
            ...productDoc.data(),
            type: "product",
          }))
          .filter(
            (product) =>
              product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              product.companyName
                .toLowerCase()
                .includes(searchQuery.toLowerCase())
          )
          .map((product) => ({
            ...product,
            sectionName: categoriesWithSectionNames.find(
              (cat) => cat.id === product.categoryId
            )?.sectionName,
            categoryName: categoriesWithSectionNames.find(
              (cat) => cat.id === product.categoryId
            )?.name,
          }));

        // Объединение результатов
        setSuggestions([...filteredCategories, ...productItems]);
      } catch (error) {
        console.error("Ошибка при поиске данных: ", error);
      }
    };

    fetchSuggestions();
  }, [searchQuery]);

  const handleOutsideClick = (e) => {
    if (searchRef.current && !searchRef.current.contains(e.target)) {
      setSuggestions([]);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  return (
    <div className="search" ref={searchRef}>
      <input
        type="text"
        placeholder="Поиск товаров и категорий..."
        value={searchQuery}
        onChange={handleSearchChange}
        className="search-input"
      />

      {suggestions.length > 0 && (
        <div className="suggestions-container">
          {suggestions.map((item) => (
            <div
              key={item.id}
              className="suggestion-item"
              onClick={() => handleItemClick(item)}
            >
              <img
                src={item.image || item.mainImage}
                className="suggestion-image"
                alt={item.name}
              />
              <div className="suggestion-details">
                <p className="suggestion-name">{item.name}</p>
                {item.type === "category" ? (
                  <p className="suggestion-section">
                    Раздел: {item.sectionName || "Без раздела"}
                  </p>
                ) : (
                  <p className="suggestion-company">{item.companyName}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Search;
