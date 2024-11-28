import React, { useState, useEffect } from "react";
import { db } from "../index.js";
import {
  collection,
  query,
  onSnapshot,
  getDocs,
  doc,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import AddProductSpecifications from "./AddCharacteristics.jsx";
import ListEditing from "../components/listEditing/listEditing.jsx";

const EditProduct = () => {
  const [productName, setProductName] = useState("");
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [category, setCategory] = useState("");
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [price, setPrice] = useState("");
  const [discount, setDiscount] = useState("");
  const [description, setDescription] = useState("");
  const [benefits, setBenefits] = useState([{ text: "" }]);
  const [categories, setCategories] = useState([]);
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const [mainImage, setMainImage] = useState(null);
  const [shortSpecs, setShortSpecs] = useState([{ name: "", value: "" }]);
  const [fullSpecs, setFullSpecs] = useState([{ name: "", value: "" }]);
  const storage = getStorage();
  const [imageURLs, setImageURLs] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [newProductName, setNewProductName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [templates, setTemplates] = useState([]);
  const [templateCategory, setTemplateCategory] = useState("");
  const [filteredTemplates, setFilteredTemplates] = useState([]);
  const [showTemplateList, setShowTemplateList] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      const q = query(collection(db, "categories"));
      onSnapshot(q, (querySnapshot) => {
        const categoriesList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCategories(categoriesList);
      });
    };

    const fetchProducts = async () => {
      const q = query(collection(db, "product"));
      const productsSnapshot = await getDocs(q);
      const productsList = productsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProducts(productsList);
    };
    const fetchTemplates = async () => {
      const templatesCollection = collection(db, "specTemplates");
      const templatesSnapshot = await getDocs(templatesCollection);
      const templatesList = templatesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTemplates(templatesList);
    };

    fetchCategories();
    fetchProducts();
    fetchTemplates();
  }, []);

  const handleProductSearch = (name) => {
    setProductName(name);

    if (name.trim() === "") {
      setFilteredProducts([]); // Скрыть список, если поле пустое
      return;
    }

    const filtered = products.filter((product) => {
      const combinedName =
        `${product.companyName} ${product.name}`.toLowerCase();
      return combinedName.includes(name.toLowerCase());
    });

    setFilteredProducts(filtered);
  };
  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    setProductName(`${product.companyName} ${product.name}`); // Обновлено
    setCategory(product.categoryName || "");
    setPrice(product.price || "");
    setDiscount(product.discount || "");
    setDescription(product.description || "");
    setBenefits(product.benefits?.map((text) => ({ text })) || [{ text: "" }]);
    setShortSpecs(product.shortSpecs || [{ name: "", value: "" }]);
    setFullSpecs(product.fullSpecs || [{ name: "", value: "" }]);
    setExistingImages(product.images || []);
    setMainImage(product.mainImage || null);
    setFilteredProducts([]); // Очистка списка после выбора продукта
  };
  const handleCategorySearch = (name) => {
    setCategory(name);

    if (name.trim() === "") {
      setFilteredCategories([]); // Скрыть список, если поле пустое
      return;
    }

    const filtered = categories.filter((cat) =>
      cat.name.toLowerCase().includes(name.toLowerCase())
    );

    setFilteredCategories(filtered);
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setImages((prevImages) => [...prevImages, ...files]);

    const newImageURLs = files.map((file) => URL.createObjectURL(file));
    setImageURLs((prevURLs) => [...prevURLs, ...newImageURLs]);
  };

  const handleDeleteImage = () => {
    if (selectedImageIndex !== null) {
      if (existingImages[selectedImageIndex]) {
        setExistingImages(
          existingImages.filter((_, i) => i !== selectedImageIndex)
        );
      } else {
        setImages(images.filter((_, i) => i !== selectedImageIndex));
      }
      setSelectedImageIndex(null);
    }
  };

  const handleSetMainImage = () => {
    if (selectedImageIndex !== null) {
      if (existingImages[selectedImageIndex]) {
        setMainImage(existingImages[selectedImageIndex]);
      } else {
        setMainImage(images[selectedImageIndex]);
      }
    }
  };
  const handleImageClick = (index) => {
    setSelectedImage(index);
    setSelectedImageIndex(index); // сохранить индекс выбранного изображения
  };

  const handleSaveChanges = async () => {
    if (!selectedProduct) return; // Проверка на наличие выбранного продукта

    const productRef = doc(db, "product", selectedProduct.id);
    const newImages = [];

    try {
      // Загрузка новых изображений в хранилище и получение их URL
      for (const image of images) {
        const imageRef = ref(storage, `products/${image.name}`);
        await uploadBytes(imageRef, image);
        const imageUrl = await getDownloadURL(imageRef);
        newImages.push(imageUrl);
      }

      // Обновлённый массив изображений и главного изображения
      const updatedImages = [...existingImages, ...newImages];
      const mainImageUrl =
        typeof mainImage === "string" && mainImage.startsWith("http")
          ? mainImage
          : updatedImages[images.indexOf(mainImage)];

      // Создаём объект с обновлёнными данными продукта
      const updatedProductData = {
        name: newProductName || selectedProduct.name, // Устанавливаем новое название, если оно задано
        companyName: companyName || selectedProduct.companyName, // Устанавливаем новое название компании
        categoryName: category,
        price,
        discount,
        description,
        benefits: benefits.map((benefit) => benefit.text),
        images: updatedImages,
        mainImage: mainImageUrl,
        shortSpecs,
        fullSpecs,
      };

      // Обновляем документ продукта в Firestore
      await updateDoc(productRef, updatedProductData);

      // Обновляем состояние selectedProduct с новыми данными
      setSelectedProduct({ ...selectedProduct, ...updatedProductData });

      // Очищаем поля после успешного сохранения
      setProductName("");
      setNewProductName("");
      setCompanyName("");
      setCategory("");
      setPrice("");
      setDiscount("");
      setDescription("");
      setBenefits([{ text: "" }]);
      setImages("");
      setExistingImages([]);
      setSelectedImage(null);
      setMainImage("");
      setShortSpecs([{ name: "", value: "" }]);
      setFullSpecs([{ name: "", value: "" }]);
      setTemplateCategory("");

      alert("Изменения успешно сохранены!");
    } catch (error) {
      console.error("Error saving product: ", error);
      alert("Произошла ошибка при сохранении изменений");
    }
  };

  const handleBenefitChange = (index, value) => {
    const updatedBenefits = [...benefits];
    updatedBenefits[index].text = value;
    setBenefits(updatedBenefits);
  };

  const handleAddBenefit = () => {
    setBenefits([...benefits, { text: "" }]);
  };

  const handleRemoveBenefit = (index) => {
    const updatedBenefits = benefits.filter((_, i) => i !== index);
    setBenefits(updatedBenefits);
  };
  const handleTemplateInputChange = (e) => {
    const input = e.target.value;
    setTemplateCategory(input);
    if (input === "") {
      setFilteredTemplates([]);
      setShowTemplateList(false);
    } else {
      const filtered = templates.filter((template) =>
        template.categoryName.toLowerCase().includes(input.toLowerCase())
      );
      setFilteredTemplates(filtered);
      setShowTemplateList(filtered.length > 0);
    }
  };
  const handleTemplateSelect = (template) => {
    setTemplateCategory(template.categoryName);
    setShortSpecs(template.shortSpecs || [{ name: "", value: "" }]);
    setFullSpecs(template.fullSpecs || [{ name: "", value: "" }]);
    setShowTemplateList(false);
  };

  return (
    <div className="flex">
      <ListEditing />
      <div className="editing">
        <p className="title top">Редактирование товара</p>
        <p>Название товара</p>
        <div className="list-editing">
          <input
            className="z"
            type="text"
            placeholder="Название товара"
            value={productName}
            onChange={(e) => handleProductSearch(e.target.value)}
          />
          {filteredProducts.length > 0 && ( // Условие для отображения списка
            <ul className="product-list">
              {filteredProducts.map((product) => (
                <li
                  key={product.id}
                  onClick={() => handleProductSelect(product)}
                  className="product-list-item"
                >
                  {`${product.companyName} ${product.name}`}{" "}
                  {/* Отображение полной строки */}
                </li>
              ))}
            </ul>
          )}
        </div>
        <p>Новое название товара</p>
        <input
          type="text"
          placeholder="Новое название товара"
          value={newProductName}
          onChange={(e) => setNewProductName(e.target.value)}
        />

        <p>Изменение названия компании</p>
        <input
          type="text"
          placeholder="Изменение названия компании"
          value={companyName} // Добавьте состояние для хранения названия компании
          onChange={(e) => setCompanyName(e.target.value)} // Обновите состояние при вводе
        />
        <p>Категория товара</p>
        <div className="list-editing">
          <input
            className="z"
            type="text"
            placeholder="Категория товара"
            value={category}
            onChange={(e) => handleCategorySearch(e.target.value)}
          />
          {filteredCategories.length > 0 && (
            <ul className="category-list">
              {filteredCategories.map((cat) => (
                <li
                  key={cat.id}
                  onClick={() => {
                    setCategory(cat.name);
                    setFilteredCategories([]); // Очистка списка после выбора категории
                  }}
                  className="category-list-item"
                >
                  {cat.name}
                </li>
              ))}
            </ul>
          )}
        </div>

        <p>Цена товара</p>
        <input
          type="number"
          placeholder="Цена товара"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
        <p>Скидка</p>
        <input
          type="number"
          placeholder="Цена со скидкой"
          value={discount}
          onChange={(e) => setDiscount(e.target.value)}
        />

        <p>Описание товара</p>
        <textarea
          placeholder="Описание товара"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <p>Преимущества товара</p>
        {benefits.map((benefit, index) => (
          <div key={index} className="benefit-row">
            <input
              type="text"
              placeholder="Преимущество"
              value={benefit.text}
              onChange={(e) => handleBenefitChange(index, e.target.value)}
            />
            <button
              className="button-editing"
              onClick={() => handleRemoveBenefit(index)}
            >
              Удалить
            </button>
          </div>
        ))}
        <button className="button-editing" onClick={handleAddBenefit}>
          Добавить преимущество
        </button>

        <p>Фотографии товара</p>
        <div className="buttons-product">
          <button
            className="button-editing"
            onClick={() => document.getElementById("fileInput").click()}
          >
            Загрузить фотографии
          </button>
          <button
            className="button-editing"
            onClick={handleDeleteImage}
            disabled={selectedImageIndex === null}
          >
            Удалить фотографию
          </button>
          <button
            className="button-editing"
            onClick={handleSetMainImage}
            disabled={selectedImageIndex === null}
          >
            Сделать основной
          </button>
        </div>
        <input
          type="file"
          id="fileInput"
          style={{ display: "none" }}
          multiple
          onChange={handleImageUpload}
        />

        <div>
          <ul className="list-photos-product">
            {existingImages.map((imageUrl, index) => (
              <li key={index}>
                <img
                  src={imageUrl}
                  onClick={() => handleImageClick(index)} // обновлено
                  alt="Product"
                  className={`image ${
                    mainImage === imageUrl ? "main-photo" : ""
                  } ${selectedImage === index ? "photo-selected" : ""}`} // добавлено
                />
                {mainImage === imageUrl && <span>Основная</span>}
              </li>
            ))}
            {imageURLs.map((imageUrl, index) => (
              <li key={`new-${index}`}>
                <img
                  src={imageUrl}
                  onClick={() =>
                    handleImageClick(existingImages.length + index)
                  } // обновлено
                  alt="New Upload"
                  className={`image ${
                    mainImage === images[index] ? "main-photo" : ""
                  } ${
                    selectedImage === existingImages.length + index
                      ? "photo-selected"
                      : ""
                  }`} // добавлено
                />
                {mainImage === images[index] && <span>Основная</span>}
              </li>
            ))}
          </ul>
        </div>
        <p>Выберите категорию шаблона</p>
        <div className="list-editing">
          <input
            className="z"
            type="text"
            placeholder="Выберите категорию шаблона"
            value={templateCategory}
            onChange={handleTemplateInputChange}
          />
          {showTemplateList && filteredTemplates.length > 0 && (
            <ul className="template-list">
              {filteredTemplates.map((template) => (
                <li
                  key={template.id}
                  onClick={() => handleTemplateSelect(template)}
                  className="template-list-item"
                >
                  {template.categoryName}
                </li>
              ))}
            </ul>
          )}
        </div>
        <AddProductSpecifications
          shortSpecs={shortSpecs}
          setShortSpecs={setShortSpecs}
          fullSpecs={fullSpecs}
          setFullSpecs={setFullSpecs}
        />
        <button className="button-editing" onClick={handleSaveChanges}>
          Сохранить изменения
        </button>
      </div>
    </div>
  );
};

export default EditProduct;
