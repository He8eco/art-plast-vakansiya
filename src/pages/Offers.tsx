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
import ListEditing from "../components/listEditing/listEditing";
import "../styles/editing.scss";

interface Category {
  id: string;
  name: string;
  image: string;
}

interface Offer {
  id: string;
  categoryName: string;
  position: number;
  image?: string;
}

export default function Offers() {
  const [categoryName, setCategoryName] = useState<string>("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [position, setPosition] = useState<string>("");
  const [showCategoryList, setShowCategoryList] = useState<boolean>(false);

  const [offers, setOffers] = useState<Offer[]>([]);
  const [editPosition, setEditPosition] = useState<string>("");
  const [newPosition, setNewPosition] = useState<string>("");
  const [newCategory, setNewCategory] = useState<string>("");
  const [deletePosition, setDeletePosition] = useState<string>("");

  useEffect(() => {
    const fetchCategories = async () => {
      const categoryCollection = collection(db, "categories");
      const categorySnapshot = await getDocs(categoryCollection);
      const categoryList = categorySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Category[];
      setCategories(categoryList);
      setFilteredCategories(categoryList);
    };

    const fetchOffers = async () => {
      const offersCollection = collection(db, "offers");
      const offersSnapshot = await getDocs(offersCollection);
      const offersList = offersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Offer[];
      setOffers(offersList);
    };

    fetchCategories();
    fetchOffers();
  }, []);

  const handleCategorySearch = (name: string) => {
    setCategoryName(name);
    const filtered = categories.filter((category) =>
      category.name.toLowerCase().includes(name.toLowerCase())
    );
    setFilteredCategories(filtered);
    setShowCategoryList(name.length > 0 && filtered.length > 0);
  };

  const handleCategorySelect = (category: Category) => {
    setCategoryName(category.name);
    setShowCategoryList(false);
  };

  const handleAddOffer = async () => {
    if (!categoryName || !position) {
      alert("Пожалуйста, заполните все поля");
      return;
    }

    const selectedCategory = categories.find(
      (category) => category.name === categoryName
    );

    if (!selectedCategory) {
      alert("Категория не найдена");
      return;
    }

    await addDoc(collection(db, "offers"), {
      categoryName: categoryName,
      position: parseInt(position, 10),
      image: selectedCategory.image,
    });

    setCategoryName("");
    setPosition("");
  };

  const handleEditOffer = async () => {
    if (!editPosition) return;

    const offerRef = doc(db, "offers", editPosition);
    const newOfferData: Partial<Offer> = {};

    if (newPosition) newOfferData.position = parseInt(newPosition, 10);
    if (newCategory) newOfferData.categoryName = newCategory;

    await updateDoc(offerRef, newOfferData);
    setEditPosition("");
    setNewPosition("");
    setNewCategory("");
  };

  const handleDeleteOffer = async () => {
    if (!deletePosition) return;

    const offerRef = doc(db, "offers", deletePosition);
    await deleteDoc(offerRef);
    setDeletePosition("");
  };

  return (
    <div className="flex">
      <ListEditing />
      <div className="editing">
        <p className="title top">Добавить предложение</p>
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

        <p>Введите позицию</p>
        <input
          type="number"
          placeholder="Введите позицию"
          value={position}
          onChange={(e) => setPosition(e.target.value)}
        />
        <br />
        <button className="button-editing" onClick={handleAddOffer}>
          Добавить предложение
        </button>

        {/* Редактирование предложения */}
        <div className="edit-offer">
          <h3>Редактирование предложения</h3>
          <select
            value={editPosition}
            onChange={(e) => setEditPosition(e.target.value)}
          >
            <option value="">Выберите предложение для редактирования</option>
            {offers.map((offer) => (
              <option key={offer.id} value={offer.id}>
                Позиция: {offer.position} - Категория: {offer.categoryName}
              </option>
            ))}
          </select>
          <input
            type="number"
            placeholder="Новое число позиции (необязательно)"
            value={newPosition}
            onChange={(e) => setNewPosition(e.target.value)}
          />
          <input
            type="text"
            placeholder="Новое название категории (необязательно)"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
          />
          <button className="button-editing" onClick={handleEditOffer}>
            Сохранить изменения
          </button>
        </div>

        {/* Удаление предложения */}
        <div className="delete-offer">
          <h3>Удаление предложения</h3>
          <select
            value={deletePosition}
            onChange={(e) => setDeletePosition(e.target.value)}
          >
            <option value="">Выберите предложение для удаления</option>
            {offers.map((offer) => (
              <option key={offer.id} value={offer.id}>
                Позиция: {offer.position} - Категория: {offer.categoryName}
              </option>
            ))}
          </select>
          <br />
          <button className="button-editing" onClick={handleDeleteOffer}>
            Удалить предложение
          </button>
        </div>
      </div>
    </div>
  );
}
