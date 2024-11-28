import React, { useState, useEffect } from "react";
import { db } from "../../index.js"; // Импортируем Firebase
import {
  collection,
  query,
  onSnapshot,
  doc,
  deleteDoc,
} from "firebase/firestore";

const CategoryDeletion = () => {
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false); // Состояние для видимости списка

  // Получение категорий из базы данных
  useEffect(() => {
    const fetchCategories = async () => {
      const q = query(collection(db, "categories"));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const categoriesList = [];
        querySnapshot.forEach((doc) => {
          categoriesList.push({ id: doc.id, ...doc.data() });
        });
        setCategories(categoriesList);
      });
      return () => unsubscribe();
    };
    fetchCategories();
  }, []);

  const handleSearchCategories = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
    setIsDropdownVisible(true); // Показываем список при изменении текста
  };

  const handleSelectCategory = (category) => {
    setSelectedCategory(category);
    setSearchTerm(category.name); // Устанавливаем название категории в поле поиска
    setIsDropdownVisible(false); // Скрываем список после выбора категории
  };

  const handleDeleteCategory = async () => {
    if (!selectedCategory) return;

    try {
      await deleteDoc(doc(db, "categories", selectedCategory.id));
      setSelectedCategory(null);
      setSearchTerm("");
    } catch (error) {
      console.error("Error deleting category: ", error);
    }
  };

  return (
    <div className="editing">
      <p className="title">Удаление категории</p>
      <p>Название категории</p>
      <div className="list-editing">
        <input
          className="z"
          type="text"
          placeholder="Поиск категории"
          value={searchTerm}
          onChange={handleSearchCategories}
        />
        {/* Отображаем список только если он видим и введённый текст не пуст */}
        {isDropdownVisible && searchTerm && categories.length > 0 && (
          <ul>
            {categories
              .filter((category) =>
                category.name.toLowerCase().includes(searchTerm)
              )
              .map((category) => (
                <li
                  key={category.id}
                  onClick={() => handleSelectCategory(category)}
                >
                  {category.name}
                </li>
              ))}
          </ul>
        )}
      </div>
      <button
        className="button-editing"
        onClick={handleDeleteCategory}
        disabled={!selectedCategory}
      >
        Удалить категорию
      </button>
    </div>
  );
};

export default CategoryDeletion;
