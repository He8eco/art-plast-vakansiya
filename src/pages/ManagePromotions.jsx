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
import ListEditing from "../components/listEditing/listEditing";
import "../styles/editing.css";

export default function ManagePromotions() {
  const [promotionType, setPromotionType] = useState(""); // Тип акции
  const [promotionName, setPromotionName] = useState(""); // Название товара
  const [products, setProducts] = useState([]); // Список всех товаров
  const [filteredProducts, setFilteredProducts] = useState([]); // Отфильтрованные товары
  const [position, setPosition] = useState(""); // Позиция товара в акции
  const [showProductList, setShowProductList] = useState(false); // Показать список товаров

  // Для редактирования акций
  const [promotions, setPromotions] = useState([]); // Список акций

  // Состояния для редактирования акций
  const [selectedPromotionType, setSelectedPromotionType] = useState(""); // Выбранный тип акции для редактирования
  const [promotionProducts, setPromotionProducts] = useState([]); // Товары в выбранной акции
  const [selectedPromotionProduct, setSelectedPromotionProduct] = useState(""); // Выбранный товар в акции
  const [newPosition, setNewPosition] = useState(""); // Новая позиция
  const [newPromotionType, setNewPromotionType] = useState(""); // Новый тип акции

  // Состояния для удаления акций
  const [deletePromotionType, setDeletePromotionType] = useState(""); // Выбранный тип акции для удаления
  const [deletePromotionProducts, setDeletePromotionProducts] = useState([]); // Товары в выбранной акции для удаления
  const [selectedDeletePromotionProduct, setSelectedDeletePromotionProduct] =
    useState(""); // Выбранный товар для удаления

  useEffect(() => {
    // Загружаем товары из базы данных
    const fetchProducts = async () => {
      const productCollection = collection(db, "product");
      const productSnapshot = await getDocs(productCollection);
      const productList = productSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProducts(productList);
      setFilteredProducts(productList);
    };

    // Загружаем все акции из базы данных
    const fetchPromotions = async () => {
      const promotionsCollection = collection(db, "promotions");
      const promotionsSnapshot = await getDocs(promotionsCollection);
      const promotionsList = promotionsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPromotions(promotionsList);
    };

    fetchProducts();
    fetchPromotions();
  }, []);

  // Функция для поиска товара по названию
  const handleProductSearch = (name) => {
    setPromotionName(name);
    const filtered = products.filter(
      (product) =>
        product.name.toLowerCase().includes(name.toLowerCase()) ||
        product.companyName.toLowerCase().includes(name.toLowerCase())
    );
    setFilteredProducts(filtered);
    setShowProductList(name.length > 0 && filtered.length > 0);
  };

  // Функция для выбора товара из списка
  const handleProductSelect = (product) => {
    setPromotionName(product.name);
    setShowProductList(false);
  };

  // Функция для добавления товара в акцию
  const handleAddPromotion = async () => {
    if (!promotionType || !promotionName || !position) {
      alert("Пожалуйста, заполните все поля");
      return;
    }

    // Находим выбранный товар по имени
    const selectedProduct = products.find(
      (product) => product.name === promotionName
    );

    if (!selectedProduct) {
      alert("Выбранный товар не найден");
      return;
    }

    // Добавляем новый товар в акцию с необходимыми данными
    await addDoc(collection(db, "promotions"), {
      productName: promotionName,
      position: position,
      mainImage: selectedProduct.mainImage,
      promotionType: promotionType,
      productId: selectedProduct.id,
      categoryName: selectedProduct.categoryName,
      price: selectedProduct.price,
      discount: selectedProduct.discount,
      companyName: selectedProduct.companyName,
    });

    // Очищаем поля после добавления
    setPromotionName("");
    setPosition("");
    setPromotionType("");

    // Обновляем список акций
    const promotionsCollection = collection(db, "promotions");
    const promotionsSnapshot = await getDocs(promotionsCollection);
    const promotionsList = promotionsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setPromotions(promotionsList);
  };

  // Обработчик выбора типа акции для редактирования
  const handlePromotionTypeSelect = (e) => {
    const type = e.target.value;
    setSelectedPromotionType(type);
    setSelectedPromotionProduct(""); // Сбрасываем выбранный товар
    setNewPosition("");
    setNewPromotionType("");

    // Фильтруем акции по выбранному типу
    const filteredPromotions = promotions.filter(
      (promotion) => promotion.promotionType === type
    );
    setPromotionProducts(filteredPromotions);
  };

  // Обработчик обновления акции
  const handleUpdatePromotion = async () => {
    if (!selectedPromotionProduct) return;

    const promotionRef = doc(db, "promotions", selectedPromotionProduct);
    const updatedData = {};

    if (newPosition) updatedData.position = newPosition;
    if (newPromotionType) updatedData.promotionType = newPromotionType;

    await updateDoc(promotionRef, updatedData);

    // Сбрасываем поля после обновления
    setNewPosition("");
    setNewPromotionType("");

    // Обновляем данные акций
    const promotionsCollection = collection(db, "promotions");
    const promotionsSnapshot = await getDocs(promotionsCollection);
    const promotionsList = promotionsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setPromotions(promotionsList);

    // Обновляем список товаров в акции
    const filteredPromotions = promotionsList.filter(
      (promotion) => promotion.promotionType === selectedPromotionType
    );
    setPromotionProducts(filteredPromotions);

    alert("Изменения успешно сохранены.");
  };

  // Обработчик выбора типа акции для удаления
  const handleDeletePromotionTypeSelect = (e) => {
    const type = e.target.value;
    setDeletePromotionType(type);
    setSelectedDeletePromotionProduct(""); // Сбрасываем выбранный товар

    // Фильтруем акции по выбранному типу
    const filteredPromotions = promotions.filter(
      (promotion) => promotion.promotionType === type
    );
    setDeletePromotionProducts(filteredPromotions);
  };

  // Функция для удаления товара из акции
  const handleDeletePromotion = async () => {
    if (!selectedDeletePromotionProduct) return;

    const promotionRef = doc(db, "promotions", selectedDeletePromotionProduct);
    await deleteDoc(promotionRef);

    // Сбрасываем выбранные значения
    setSelectedDeletePromotionProduct("");

    // Обновляем список акций
    const promotionsCollection = collection(db, "promotions");
    const promotionsSnapshot = await getDocs(promotionsCollection);
    const promotionsList = promotionsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setPromotions(promotionsList);

    // Обновляем список товаров в акции для удаления
    const filteredPromotions = promotionsList.filter(
      (promotion) => promotion.promotionType === deletePromotionType
    );
    setDeletePromotionProducts(filteredPromotions);

    alert("Товар успешно удален из акции.");
  };

  return (
    <div className="flex">
      <ListEditing />
      <div className="editing">
        <p className="title top">Добавить товар в акцию</p>

        {/* Добавление товара в акцию */}
        <p>Выберите тип акции</p>
        <select
          value={promotionType}
          onChange={(e) => setPromotionType(e.target.value)}
        >
          <option value="">Выберите тип акции</option>
          <option value="Акции">Акции</option>
          <option value="Рекомендуем">Рекомендуем</option>
          <option value="Хиты продаж">Хиты продаж</option>
          <option value="Новинки">Новинки</option>
        </select>

        <p>Название товара</p>
        <div className="list-editing">
          <input
            className="z"
            type="text"
            placeholder="Название товара"
            value={promotionName}
            onChange={(e) => handleProductSearch(e.target.value)}
          />
          {showProductList && filteredProducts.length > 0 && (
            <ul className="product-list">
              {filteredProducts.map((product) => (
                <li
                  key={product.id}
                  className="product-list-item"
                  onClick={() => handleProductSelect(product)}
                >
                  <div>
                    {product.companyName} {product.name}
                  </div>
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
        <button className="button-editing" onClick={handleAddPromotion}>
          Добавить товар в акцию
        </button>

        {/* Редактирование акций */}
        <div className="edit-promotion">
          <h3>Редактирование акций</h3>

          {/* Выбор типа акции */}
          <p>Выберите тип акции для редактирования:</p>
          <select
            value={selectedPromotionType}
            onChange={handlePromotionTypeSelect}
          >
            <option value="">Выберите тип акции</option>
            <option value="Акции">Акции</option>
            <option value="Рекомендуем">Рекомендуем</option>
            <option value="Хиты продаж">Хиты продаж</option>
            <option value="Новинки">Новинки</option>
          </select>

          {/* Выбор товара из выбранной акции */}
          {selectedPromotionType && (
            <>
              <p>Выберите товар в акции:</p>
              <select
                value={selectedPromotionProduct}
                onChange={(e) => setSelectedPromotionProduct(e.target.value)}
              >
                <option value="">Выберите товар</option>
                {promotionProducts.map((promotion) => (
                  <option key={promotion.id} value={promotion.id}>
                    Позиция: {promotion.position} - {promotion.productName}
                  </option>
                ))}
              </select>
            </>
          )}

          {/* Поля для изменения позиции и типа акции */}
          {selectedPromotionProduct && (
            <>
              <p>Изменить позицию:</p>
              <input
                type="number"
                placeholder="Новая позиция"
                value={newPosition}
                onChange={(e) => setNewPosition(e.target.value)}
              />

              <p>Изменить тип акции:</p>
              <select
                value={newPromotionType}
                onChange={(e) => setNewPromotionType(e.target.value)}
              >
                <option value="">Выберите новый тип акции</option>
                <option value="Акции">Акции</option>
                <option value="Рекомендуем">Рекомендуем</option>
                <option value="Хиты продаж">Хиты продаж</option>
                <option value="Новинки">Новинки</option>
              </select>

              <button
                className="button-editing"
                onClick={handleUpdatePromotion}
              >
                Сохранить изменения
              </button>
            </>
          )}
        </div>

        {/* Удаление акций */}
        <div className="delete-promotion">
          <h3>Удаление акций</h3>

          {/* Выбор типа акции */}
          <p>Выберите тип акции для удаления:</p>
          <select
            value={deletePromotionType}
            onChange={handleDeletePromotionTypeSelect}
          >
            <option value="">Выберите тип акции</option>
            <option value="Акции">Акции</option>
            <option value="Рекомендуем">Рекомендуем</option>
            <option value="Хиты продаж">Хиты продаж</option>
            <option value="Новинки">Новинки</option>
          </select>

          {/* Выбор товара из выбранной акции */}
          {deletePromotionType && (
            <>
              <p>Выберите товар в акции:</p>
              <select
                value={selectedDeletePromotionProduct}
                onChange={(e) =>
                  setSelectedDeletePromotionProduct(e.target.value)
                }
              >
                <option value="">Выберите товар</option>
                {deletePromotionProducts.map((promotion) => (
                  <option key={promotion.id} value={promotion.id}>
                    Позиция: {promotion.position} - {promotion.productName}
                  </option>
                ))}
              </select>
            </>
          )}

          {/* Кнопка для удаления товара из акции */}
          {selectedDeletePromotionProduct && (
            <button className="button-editing" onClick={handleDeletePromotion}>
              Удалить товар из акции
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
