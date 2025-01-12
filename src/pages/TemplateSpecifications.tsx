import React, { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../index";
import AddProductSpecifications from "./AddCharacteristics";
import ListEditing from "../components/listEditing/listEditing";
import "../styles/editing.scss";

// Интерфейсы для данных
interface Category {
  id: string;
  name: string;
}

interface Spec {
  name: string;
  value: string;
}

interface Template {
  id: string;
  categoryName: string;
  shortSpecs: Spec[];
  fullSpecs: Spec[];
}

export default function TemplateSpecifications() {
  const [categoryName, setCategoryName] = useState<string>("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [showCategoryList, setShowCategoryList] = useState<boolean>(false);

  const [createShortSpecs, setCreateShortSpecs] = useState<Spec[]>([
    { name: "", value: "" },
  ]);
  const [createFullSpecs, setCreateFullSpecs] = useState<Spec[]>([
    { name: "", value: "" },
  ]);

  const [templates, setTemplates] = useState<Template[]>([]);

  const [editCategoryName, setEditCategoryName] = useState<string>("");
  const [filteredTemplates, setFilteredTemplates] = useState<Template[]>([]);
  const [showTemplateList, setShowTemplateList] = useState<boolean>(false);
  const [selectedEditTemplate, setSelectedEditTemplate] =
    useState<Template | null>(null);

  const [editShortSpecs, setEditShortSpecs] = useState<Spec[]>([]);
  const [editFullSpecs, setEditFullSpecs] = useState<Spec[]>([]);

  const [deleteCategoryName, setDeleteCategoryName] = useState<string>("");
  const [filteredTemplatesForDelete, setFilteredTemplatesForDelete] = useState<
    Template[]
  >([]);
  const [showTemplateListForDelete, setShowTemplateListForDelete] =
    useState<boolean>(false);
  const [selectedDeleteTemplate, setSelectedDeleteTemplate] =
    useState<Template | null>(null);

  useEffect(() => {
    fetchCategories();
    fetchTemplates();
  }, []);

  // Получение категорий из Firebase
  const fetchCategories = async (): Promise<void> => {
    const categoryCollection = collection(db, "categories");
    const categorySnapshot = await getDocs(categoryCollection);
    const categoryList: Category[] = categorySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Category, "id">),
    }));
    setCategories(categoryList);
    setFilteredCategories(categoryList);
  };

  // Получение шаблонов из Firebase
  const fetchTemplates = async (): Promise<void> => {
    const templatesCollection = collection(db, "specTemplates");
    const templatesSnapshot = await getDocs(templatesCollection);
    const templatesList: Template[] = templatesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Template, "id">),
    }));
    setTemplates(templatesList);
  };

  // Поиск категорий
  const handleCategorySearch = (name: string): void => {
    setCategoryName(name);
    const filtered = categories.filter((category) =>
      category.name.toLowerCase().includes(name.toLowerCase())
    );
    setFilteredCategories(filtered);
    setShowCategoryList(name.length > 0 && filtered.length > 0);
  };

  const handleCategorySelect = (category: Category): void => {
    setCategoryName(category.name);
    setShowCategoryList(false);
  };

  // Создание шаблона
  const handleAddTemplate = async (): Promise<void> => {
    if (!categoryName) {
      alert("Пожалуйста, выберите категорию");
      return;
    }

    await addDoc(collection(db, "specTemplates"), {
      categoryName,
      shortSpecs: createShortSpecs,
      fullSpecs: createFullSpecs,
    });

    setCategoryName("");
    setCreateShortSpecs([{ name: "", value: "" }]);
    setCreateFullSpecs([{ name: "", value: "" }]);
    alert("Шаблон успешно создан");
    await fetchTemplates();
  };

  // Поиск шаблонов для редактирования
  const handleTemplateSearch = (name: string): void => {
    setEditCategoryName(name);
    const filtered = templates.filter((template) =>
      template.categoryName.toLowerCase().includes(name.toLowerCase())
    );
    setFilteredTemplates(filtered);
    setShowTemplateList(name.length > 0 && filtered.length > 0);
  };

  const handleTemplateSelect = (template: Template): void => {
    setEditCategoryName(template.categoryName);
    setEditShortSpecs(template.shortSpecs);
    setEditFullSpecs(template.fullSpecs);
    setSelectedEditTemplate(template);
    setShowTemplateList(false);
  };

  // Сохранение изменений
  const handleSaveTemplateChanges = async (): Promise<void> => {
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
    await fetchTemplates();
  };

  // Удаление шаблона
  const handleTemplateSearchForDelete = (name: string): void => {
    setDeleteCategoryName(name);
    const filtered = templates.filter((template) =>
      template.categoryName.toLowerCase().includes(name.toLowerCase())
    );
    setFilteredTemplatesForDelete(filtered);
    setShowTemplateListForDelete(name.length > 0 && filtered.length > 0);
  };

  const handleTemplateSelectForDelete = (template: Template): void => {
    setDeleteCategoryName(template.categoryName);
    setSelectedDeleteTemplate(template);
    setShowTemplateListForDelete(false);
  };

  const handleDeleteTemplate = async (): Promise<void> => {
    if (!selectedDeleteTemplate) {
      alert("Пожалуйста, выберите шаблон для удаления");
      return;
    }

    const templateRef = doc(db, "specTemplates", selectedDeleteTemplate.id);
    await deleteDoc(templateRef);

    setDeleteCategoryName("");
    setSelectedDeleteTemplate(null);
    alert("Шаблон удален");
    await fetchTemplates();
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
