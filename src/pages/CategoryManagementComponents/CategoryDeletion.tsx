import React, { useState, useEffect } from "react";
import { db } from "../../index"; // Импортируем Firebase
import {
  collection,
  query,
  onSnapshot,
  doc,
  deleteDoc,
} from "firebase/firestore";

// Тип для категории
interface Category {
  id: string;
  name: string;
  [key: string]: any; // Для других возможных полей
}

const CategoryDeletion = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>(""); // Добавлен тип
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  ); // Типизация выбранной категории
  const [isDropdownVisible, setIsDropdownVisible] = useState<boolean>(false); // Состояние для видимости списка

  // Получение категорий из базы данных
  useEffect(() => {
    const fetchCategories = async () => {
      const q = query(collection(db, "categories"));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const categoriesList: Category[] = []; // Указываем тип массива
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.name) {
            // Проверяем, что поле name существует
            categoriesList.push({ id: doc.id, ...data } as Category);
          } else {
            console.warn(
              `Пропущена категория с id=${doc.id}, так как отсутствует поле 'name'.`
            );
          }
        });
        setCategories(categoriesList);
      });
      return () => unsubscribe();
    };
    fetchCategories();
  }, []);

  const handleSearchCategories = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSearchTerm(e.target.value.toLowerCase());
    setIsDropdownVisible(true); // Показываем список при изменении текста
  };

  const handleSelectCategory = (category: Category) => {
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
          onChange={handleSearchCategories} // Исправлена типизация
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
