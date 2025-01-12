import React, { useState, useEffect } from "react";
import { db } from "../../index";
import {
  collection,
  query,
  onSnapshot,
  doc,
  updateDoc,
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

// Типы данных
interface Section {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
  sectionId: string;
  image?: string | null;
}

const EditingCategoryManagement = () => {
  const [sectionName, setSectionName] = useState<string>("");
  const [sections, setSections] = useState<Section[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [filteredSections, setFilteredSections] = useState<Section[]>([]);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(
    null
  );
  const [newCategoryName, setNewCategoryName] = useState<string>("");
  const [image, setImage] = useState<File | string | null>(null);

  const storage = getStorage();

  useEffect(() => {
    const fetchSections = async () => {
      const q = query(collection(db, "sections"));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const sectionsList: Section[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.name) {
            sectionsList.push({ id: doc.id, ...data } as Section);
          }
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
        const categoriesList: Category[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.name && data.sectionId) {
            categoriesList.push({ id: doc.id, ...data } as Category);
          }
        });
        setCategories(categoriesList);
      });
      return () => unsubscribe();
    };
    fetchCategories();
  }, []);

  const handleSearchTermChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
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

  const handleSaveChanges = async (): Promise<void> => {
    if (!editingCategoryId || !newCategoryName) return;

    const categoryUpdate: Partial<Category> = {
      name: newCategoryName,
      sectionId: selectedSection?.id || "",
    };

    if (image && typeof image !== "string") {
      try {
        const imageUrl = await uploadImageToStorage(image);
        categoryUpdate.image = imageUrl;
      } catch (error) {
        console.error("Ошибка при загрузке изображения:", error);
      }
    }

    try {
      await updateDoc(doc(db, "categories", editingCategoryId), categoryUpdate);
      resetFormFields();
    } catch (error) {
      console.error("Ошибка при обновлении категории:", error);
    }
  };

  const resetFormFields = (): void => {
    setEditingCategoryId(null);
    setNewCategoryName("");
    setSelectedSection(null);
    setSectionName("");
    setImage(null);
    setSearchTerm("");
    setFilteredCategories([]);
    setFilteredSections([]);
  };

  const handleEditCategory = (category: Category): void => {
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

  const uploadImageToStorage = async (file: File): Promise<string | null> => {
    if (!file) return null;

    try {
      const storageRef = ref(storage, `category-images/${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
    } catch (error) {
      console.error("Ошибка при загрузке файла в хранилище:", error);
      return null;
    }
  };

  const handleSearchSections = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const searchTerm = e.target.value.toLowerCase();
    const filtered = sections.filter((section) =>
      section.name.toLowerCase().includes(searchTerm)
    );
    setFilteredSections(filtered);
    setSectionName(searchTerm);
  };

  const handleSelectSection = (section: Section): void => {
    setSelectedSection(section);
    setSectionName(section.name);
    setFilteredSections([]);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
    }
  };

  const handleDeleteImage = (): void => {
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
              onClick={() => document.getElementById("editFileInput")?.click()}
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
