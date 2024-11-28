import React, { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../index.js";
import AddProductSpecifications from "./AddCharacteristics.jsx";
import ListEditing from "../components/listEditing/listEditing";
import "../styles/editing.css";

export default function TemplateSpecifications() {
  const [categoryName, setCategoryName] = useState("");
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [showCategoryList, setShowCategoryList] = useState(false);

  // Состояния для создания шаблона
  const [createShortSpecs, setCreateShortSpecs] = useState([
    { name: "", value: "" },
  ]);
  const [createFullSpecs, setCreateFullSpecs] = useState([
    { name: "", value: "" },
  ]);

  const [templates, setTemplates] = useState([]);

  // Для редактирования
  const [editCategoryName, setEditCategoryName] = useState("");
  const [filteredTemplates, setFilteredTemplates] = useState([]);
  const [showTemplateList, setShowTemplateList] = useState(false);
  const [selectedEditTemplate, setSelectedEditTemplate] = useState(null);

  // Состояния для редактирования шаблона
  const [editShortSpecs, setEditShortSpecs] = useState([]);
  const [editFullSpecs, setEditFullSpecs] = useState([]);

  // Для удаления
  const [deleteCategoryName, setDeleteCategoryName] = useState("");
  const [filteredTemplatesForDelete, setFilteredTemplatesForDelete] = useState(
    []
  );
  const [showTemplateListForDelete, setShowTemplateListForDelete] =
    useState(false);
  const [selectedDeleteTemplate, setSelectedDeleteTemplate] = useState(null);

  useEffect(() => {
    fetchCategories();
    fetchTemplates();
  }, []);

  // Функция для получения категорий из Firebase
  const fetchCategories = async () => {
    const categoryCollection = collection(db, "categories");
    const categorySnapshot = await getDocs(categoryCollection);
    const categoryList = categorySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setCategories(categoryList);
    setFilteredCategories(categoryList);
  };

  // Функция для получения шаблонов из Firebase
  const fetchTemplates = async () => {
    const templatesCollection = collection(db, "specTemplates");
    const templatesSnapshot = await getDocs(templatesCollection);
    const templatesList = templatesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setTemplates(templatesList);
  };

  // Функции для поиска категорий при создании шаблона
  const handleCategorySearch = (name) => {
    setCategoryName(name);
    const filtered = categories.filter((category) =>
      category.name.toLowerCase().includes(name.toLowerCase())
    );
    setFilteredCategories(filtered);
    setShowCategoryList(name.length > 0 && filtered.length > 0);
  };

  const handleCategorySelect = (category) => {
    setCategoryName(category.name);
    setShowCategoryList(false);
  };

  // Функция для создания шаблона
  const handleAddTemplate = async () => {
    if (!categoryName) {
      alert("Пожалуйста, выберите категорию");
      return;
    }

    await addDoc(collection(db, "specTemplates"), {
      categoryName: categoryName,
      shortSpecs: createShortSpecs,
      fullSpecs: createFullSpecs,
    });

    setCategoryName("");
    setCreateShortSpecs([]);
    setCreateFullSpecs([]);
    alert("Шаблон успешно создан");
    await fetchTemplates(); // Обновляем список шаблонов
  };

  // Функции для поиска шаблонов при редактировании
  const handleTemplateSearch = (name) => {
    setEditCategoryName(name);
    const filtered = templates.filter((template) =>
      template.categoryName.toLowerCase().includes(name.toLowerCase())
    );
    setFilteredTemplates(filtered);
    setShowTemplateList(name.length > 0 && filtered.length > 0);
  };

  const handleTemplateSelect = (template) => {
    setEditCategoryName(template.categoryName);
    setEditShortSpecs(template.shortSpecs);
    setEditFullSpecs(template.fullSpecs);
    setSelectedEditTemplate(template);
    setShowTemplateList(false);
  };

  // Функция для сохранения изменений шаблона
  const handleSaveTemplateChanges = async () => {
    if (!selectedEditTemplate) return;

    const templateRef = doc(db, "specTemplates", selectedEditTemplate.id);
    await updateDoc(templateRef, {
      shortSpecs: editShortSpecs,
      fullSpecs: editFullSpecs,
    });

    setEditCategoryName("");
    setEditShortSpecs([]);
    setEditFullSpecs([]);
    setSelectedEditTemplate(null);
    alert("Изменения сохранены");
    await fetchTemplates(); // Обновляем список шаблонов
  };

  // Функции для поиска шаблонов при удалении
  const handleTemplateSearchForDelete = (name) => {
    setDeleteCategoryName(name);
    const filtered = templates.filter((template) =>
      template.categoryName.toLowerCase().includes(name.toLowerCase())
    );
    setFilteredTemplatesForDelete(filtered);
    setShowTemplateListForDelete(name.length > 0 && filtered.length > 0);
  };

  const handleTemplateSelectForDelete = (template) => {
    setDeleteCategoryName(template.categoryName);
    setSelectedDeleteTemplate(template);
    setShowTemplateListForDelete(false);
  };

  // Функция для удаления шаблона
  const handleDeleteTemplate = async () => {
    if (!selectedDeleteTemplate) {
      alert("Пожалуйста, выберите шаблон для удаления");
      return;
    }

    const templateRef = doc(db, "specTemplates", selectedDeleteTemplate.id);
    await deleteDoc(templateRef);

    setDeleteCategoryName("");
    setSelectedDeleteTemplate(null);
    alert("Шаблон удален");
    await fetchTemplates(); // Обновляем список шаблонов
  };

  return (
    <div className="flex">
      <ListEditing />
      <div className="editing">
        {/* Создание шаблона */}
        <h2>Создание шаблона характеристик</h2>
        <p>Название категории</p>
        <div className="list-editing">
          <input
            className="z"
            type="text"
            placeholder="Название категории"
            value={categoryName}
            onChange={(e) => handleCategorySearch(e.target.value)}
          />
          {showCategoryList && filteredCategories.length > 0 && (
            <ul className="product-list">
              {filteredCategories.map((category) => (
                <li
                  key={category.id}
                  className="product-list-item"
                  onClick={() => handleCategorySelect(category)}
                >
                  {category.name}
                </li>
              ))}
            </ul>
          )}
        </div>

        <AddProductSpecifications
          shortSpecs={createShortSpecs}
          setShortSpecs={setCreateShortSpecs}
          fullSpecs={createFullSpecs}
          setFullSpecs={setCreateFullSpecs}
        />

        <button className="button-editing" onClick={handleAddTemplate}>
          Создать шаблон
        </button>

        {/* Редактирование шаблона */}
        <h2>Редактирование шаблона характеристик</h2>
        <p>Название категории</p>
        <div className="list-editing">
          <input
            className="z"
            type="text"
            placeholder="Название категории"
            value={editCategoryName}
            onChange={(e) => handleTemplateSearch(e.target.value)}
          />
          {showTemplateList && filteredTemplates.length > 0 && (
            <ul className="product-list">
              {filteredTemplates.map((template) => (
                <li
                  key={template.id}
                  className="product-list-item"
                  onClick={() => handleTemplateSelect(template)}
                >
                  {template.categoryName}
                </li>
              ))}
            </ul>
          )}
        </div>

        {selectedEditTemplate && (
          <>
            <AddProductSpecifications
              shortSpecs={editShortSpecs}
              setShortSpecs={setEditShortSpecs}
              fullSpecs={editFullSpecs}
              setFullSpecs={setEditFullSpecs}
            />
            <button
              className="button-editing"
              onClick={handleSaveTemplateChanges}
            >
              Сохранить изменения
            </button>
          </>
        )}

        {/* Удаление шаблона */}
        <h2>Удаление шаблона характеристик</h2>
        <p>Название категории</p>
        <div className="list-editing">
          <input
            className="z"
            type="text"
            placeholder="Название категории"
            value={deleteCategoryName}
            onChange={(e) => handleTemplateSearchForDelete(e.target.value)}
          />
          {showTemplateListForDelete &&
            filteredTemplatesForDelete.length > 0 && (
              <ul className="product-list">
                {filteredTemplatesForDelete.map((template) => (
                  <li
                    key={template.id}
                    className="product-list-item"
                    onClick={() => handleTemplateSelectForDelete(template)}
                  >
                    {template.categoryName}
                  </li>
                ))}
              </ul>
            )}
        </div>
        <button className="button-editing" onClick={handleDeleteTemplate}>
          Удалить шаблон
        </button>
      </div>
    </div>
  );
}
