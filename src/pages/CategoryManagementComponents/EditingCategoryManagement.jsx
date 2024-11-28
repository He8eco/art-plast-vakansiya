import React, { useState, useEffect } from "react";
import { db } from "../../index.js";
import {
  collection,
  query,
  onSnapshot,
  doc,
  updateDoc,
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const EditingCategoryManagement = () => {
  const [sectionName, setSectionName] = useState("");
  const [sections, setSections] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [filteredSections, setFilteredSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState(null);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [image, setImage] = useState(null);
  const storage = getStorage();

  useEffect(() => {
    const fetchSections = async () => {
      const q = query(collection(db, "sections"));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const sectionsList = [];
        querySnapshot.forEach((doc) => {
          sectionsList.push({ id: doc.id, ...doc.data() });
        });
        setSections(sectionsList);
      });
      return () => unsubscribe();
    };
    fetchSections();
  }, []);

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

  const handleSearchTermChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (value) {
      const filtered = categories.filter((category) =>
        category.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredCategories(filtered);
    } else {
      setFilteredCategories([]);
    }
  };

  const handleSaveChanges = async () => {
    if (!editingCategoryId) return;

    // Сначала обновляем категорию, если новое изображение не нужно
    const categoryUpdatePromise = updateDoc(
      doc(db, "categories", editingCategoryId),
      {
        name: newCategoryName,
        sectionId: selectedSection?.id,
      }
    );

    if (image && typeof image !== "string") {
      // Загружаем изображение в фоне
      const uploadPromise = uploadImageToStorage(image)
        .then((imageUrl) => {
          return updateDoc(doc(db, "categories", editingCategoryId), {
            image: imageUrl,
          });
        })
        .catch((error) => {
          console.error("Ошибка при загрузке изображения:", error);
        });
    }

    await categoryUpdatePromise;

    resetFormFields();
  };

  const resetFormFields = () => {
    setEditingCategoryId(null);
    setNewCategoryName("");
    setSelectedSection(null);
    setSectionName("");
    setImage(null);
    setSearchTerm("");
    setFilteredCategories([]);
    setFilteredSections([]);
    reloadCategories();
  };

  const handleEditCategory = (category) => {
    setEditingCategoryId(category.id);
    setNewCategoryName(category.name);
    setSelectedSection(
      sections.find((section) => section.id === category.sectionId) || null
    );
    setSectionName(
      sections.find((section) => section.id === category.sectionId)?.name || ""
    );
    setImage(category.image || null);
    setSearchTerm(category.name);
    setFilteredCategories([]);
  };

  const reloadCategories = () => {
    const q = query(collection(db, "categories"));
    onSnapshot(q, (querySnapshot) => {
      const categoriesList = [];
      querySnapshot.forEach((doc) => {
        categoriesList.push({ id: doc.id, ...doc.data() });
      });
      setCategories(categoriesList);
    });
  };

  const uploadImageToStorage = async (file) => {
    if (!file) return null;

    try {
      const storageRef = ref(storage, `category-images/${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
    } catch (error) {
      return null;
    }
  };

  const handleSearchSections = (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filtered = sections.filter((section) =>
      section.name.toLowerCase().includes(searchTerm)
    );
    setFilteredSections(filtered);
    setSectionName(searchTerm);
  };

  const handleSelectSection = (section) => {
    setSelectedSection(section);
    setSectionName(section.name);
    setFilteredSections([]);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
    }
  };

  const handleDeleteImage = () => {
    setImage(null);
  };

  return (
    <div className="editing">
      <p className="title">Редактирование категории</p>
      <p>Название категории</p>
      <div className="list-editing z2">
        <input
          className="z z3"
          type="text"
          placeholder="Поиск категории"
          value={searchTerm}
          onChange={handleSearchTermChange}
        />
        {searchTerm && filteredCategories.length > 0 && (
          <ul>
            {filteredCategories.map((category) => (
              <li
                key={category.id}
                onClick={() => handleEditCategory(category)}
              >
                {category.name}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <p>Новое название категории</p>
        <input
          type="text"
          placeholder="Название категории"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          disabled={!editingCategoryId}
        />
        <p>Раздел категории</p>
        <div className="list-editing">
          <input
            className="z"
            type="text"
            placeholder="Выберите раздел"
            value={sectionName}
            onChange={handleSearchSections}
            disabled={!editingCategoryId}
          />
          {filteredSections.length > 0 && (
            <ul>
              {filteredSections.map((section) => (
                <li
                  key={section.id}
                  onClick={() => handleSelectSection(section)}
                >
                  {section.name}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <div className="photo-editing">
            {image ? (
              typeof image === "string" ? (
                <img
                  src={image}
                  alt="Обложка категории"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <img
                  src={URL.createObjectURL(image)}
                  alt="Обложка категории"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              )
            ) : (
              <p style={{ textAlign: "center", lineHeight: "150px" }}>
                Обложка категории
              </p>
            )}
          </div>
          <div className="buttons-photo">
            <button
              className="button-editing"
              onClick={() => document.getElementById("editFileInput").click()}
              disabled={!editingCategoryId}
            >
              Загрузить фотографию
            </button>
            <input
              type="file"
              id="editFileInput"
              style={{ display: "none" }}
              onChange={handleImageUpload}
            />
            <button
              className="button-editing"
              onClick={handleDeleteImage}
              disabled={!image || !editingCategoryId}
            >
              Удалить фотографию
            </button>
          </div>
        </div>
        <button
          className="button-editing"
          onClick={handleSaveChanges}
          disabled={!editingCategoryId}
        >
          Сохранить изменения
        </button>
      </div>
    </div>
  );
};

export default EditingCategoryManagement;
