import React, { useState, useEffect } from "react";
import { db } from "../index";
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
import AddProductSpecifications from "./AddCharacteristics";
import ListEditing from "../components/listEditing/listEditing";

// Описание интерфейсов для типов данных
interface Product {
  id: string;
  name: string;
  companyName: string;
  categoryName: string;
  price: number;
  discount?: number;
  description?: string;
  benefits?: string[];
  images?: string[];
  mainImage?: string;
  shortSpecs?: { name: string; value: string }[];
  fullSpecs?: { name: string; value: string }[];
}

interface Category {
  id: string;
  name: string;
}

interface Template {
  id: string;
  categoryName: string;
  shortSpecs?: { name: string; value: string }[];
  fullSpecs?: { name: string; value: string }[];
}

const EditProduct: React.FC = () => {
  const [productName, setProductName] = useState<string>("");
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [category, setCategory] = useState<string>("");
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [price, setPrice] = useState<string>("");
  const [discount, setDiscount] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [benefits, setBenefits] = useState<{ text: string }[]>([{ text: "" }]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null
  );
  const [mainImage, setMainImage] = useState<string | File | null>(null);
  const [shortSpecs, setShortSpecs] = useState<
    { name: string; value: string }[]
  >([{ name: "", value: "" }]);
  const [fullSpecs, setFullSpecs] = useState<{ name: string; value: string }[]>(
    [{ name: "", value: "" }]
  );
  const storage = getStorage();
  const [imageURLs, setImageURLs] = useState<string[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [newProductName, setNewProductName] = useState<string>("");
  const [companyName, setCompanyName] = useState<string>("");
  const [templates, setTemplates] = useState<Template[]>([]);
  const [templateCategory, setTemplateCategory] = useState<string>("");
  const [filteredTemplates, setFilteredTemplates] = useState<Template[]>([]);
  const [showTemplateList, setShowTemplateList] = useState<boolean>(false);

  useEffect(() => {
    const fetchCategories = async () => {
      const q = query(collection(db, "categories"));
      onSnapshot(q, (querySnapshot) => {
        const categoriesList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name || "", // Проверка на наличие свойства
        }));
        setCategories(categoriesList);
      });
    };

    const fetchProducts = async () => {
      const q = query(collection(db, "product"));
      const productsSnapshot = await getDocs(q);
      const productsList = productsSnapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name || "Без названия",
        companyName: doc.data().companyName || "Неизвестная компания",
        categoryName: doc.data().categoryName || "Без категории",
        price: doc.data().price || 0,
        discount: doc.data().discount || undefined,
        description: doc.data().description || "",
        benefits: doc.data().benefits || [],
        images: doc.data().images || [],
        mainImage: doc.data().mainImage || null,
        shortSpecs: doc.data().shortSpecs || [{ name: "", value: "" }],
        fullSpecs: doc.data().fullSpecs || [{ name: "", value: "" }],
      }));
      setProducts(productsList);
    };
    const fetchTemplates = async () => {
      const templatesCollection = collection(db, "specTemplates");
      const templatesSnapshot = await getDocs(templatesCollection);
      const templatesList = templatesSnapshot.docs.map((doc) => ({
        id: doc.id,
        categoryName: doc.data().categoryName || "", // Проверка на наличие свойства
        shortSpecs: doc.data().shortSpecs || [{ name: "", value: "" }],
        fullSpecs: doc.data().fullSpecs || [{ name: "", value: "" }],
      }));
      setTemplates(templatesList);
    };

    fetchCategories();
    fetchProducts();
    fetchTemplates();
  }, []);

  const handleProductSearch = (name: string) => {
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
  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setProductName(`${product.companyName} ${product.name}`);
    setCategory(product.categoryName || "");
    setPrice(product.price?.toString() || "");
    setDiscount(product.discount?.toString() || "");
    setDescription(product.description || "");
    setBenefits(product.benefits?.map((text) => ({ text })) || [{ text: "" }]);
    setShortSpecs(product.shortSpecs || [{ name: "", value: "" }]);
    setFullSpecs(product.fullSpecs || [{ name: "", value: "" }]);
    setExistingImages(product.images || []);
    setMainImage(product.mainImage || null);
    setFilteredProducts([]);
  };
  const handleCategorySearch = (name: string) => {
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

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
  const handleImageClick = (index: number) => {
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
          : updatedImages[images.indexOf(mainImage as File)];

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
      setSelectedProduct({
        ...selectedProduct,
        ...updatedProductData,
        price: Number(updatedProductData.price),
        discount: updatedProductData.discount
          ? Number(updatedProductData.discount)
          : undefined, // Преобразование discount
      });

      // Очищаем поля после успешного сохранения
      setProductName("");
      setNewProductName("");
      setCompanyName("");
      setCategory("");
      setPrice("");
      setDiscount("");
      setDescription("");
      setBenefits([{ text: "" }]);
      setImages([]);
      setExistingImages([]);
      setSelectedImageIndex(null);
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

  const handleBenefitChange = (index: number, value: string) => {
    const updatedBenefits = [...benefits];
    updatedBenefits[index].text = value;
    setBenefits(updatedBenefits);
  };

  const handleAddBenefit = () => {
    setBenefits([...benefits, { text: "" }]);
  };

  const handleRemoveBenefit = (index: number) => {
    const updatedBenefits = benefits.filter((_, i) => i !== index);
    setBenefits(updatedBenefits);
  };
  const handleTemplateInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
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
  const handleTemplateSelect = (template: Template) => {
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
            onClick={() => {
              const fileInput = document.getElementById(
                "fileInput"
              ) as HTMLInputElement | null;
              if (fileInput) {
                fileInput.click();
              }
            }}
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
                  } ${selectedImageIndex === index ? "photo-selected" : ""}`} // добавлено
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
                    selectedImageIndex === existingImages.length + index
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
