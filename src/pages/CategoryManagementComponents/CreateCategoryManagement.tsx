import React, { useState, useEffect } from "react";
import { db } from "../../index"; // Импортируем Firebase
import { collection, addDoc, query, onSnapshot } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

// Типы для данных
interface Section {
  id: string;
  name: string;
  [key: string]: any;
}

interface Category {
  id: string;
  name: string;
  sectionId: string;
  image?: string | null;
}

const CreateCategoryManagement = () => {
  const [categoryName, setCategoryName] = useState<string>("");
  const [sectionName, setSectionName] = useState<string>("");
  const [sections, setSections] = useState<Section[]>([]);
  const [filteredSections, setFilteredSections] = useState<Section[]>([]);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const [error, setError] = useState<string>("");

  const storage = getStorage();

  // Получение разделов из базы данных
  useEffect(() => {
    const fetchSections = async () => {
      const q = query(collection(db, "sections"));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const sectionsList: Section[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.name) {
            // Проверяем наличие обязательного поля "name"
            sectionsList.push({ id: doc.id, ...data } as Section);
          } else {
            console.warn(
              `Пропущен раздел с id=${doc.id}, так как отсутствует поле 'name'.`
            );
          }
        });
        setSections(sectionsList);
      });
      return () => unsubscribe();
    };
    fetchSections();
  }, []);

  const handleAddCategory = async () => {
    if (!categoryName || !selectedSection) {
      setError("Пожалуйста, заполните все поля.");
      return;
    }
    setError("");

    try {
      let imageUrl: string | null = null;
      if (image) {
        const imageRef = ref(storage, `categories/${image.name}`);
        await uploadBytes(imageRef, image);
        imageUrl = await getDownloadURL(imageRef);
      }

      await addDoc(collection(db, "categories"), {
        name: categoryName,
        sectionId: selectedSection.id,
        image: imageUrl,
      });

      // Сброс состояния после добавления
      setCategoryName("");
      setSelectedSection(null);
      setSectionName("");
      setImage(null);
    } catch (error) {
      console.error("Error adding category: ", error);
    }
  };

  const handleSearchSections = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchTerm = e.target.value.toLowerCase();
    const filtered = sections.filter((section) =>
      section.name.toLowerCase().includes(searchTerm)
    );
    setFilteredSections(filtered);
    setSectionName(searchTerm);
  };

  const handleSelectSection = (section: Section) => {
    setSelectedSection(section);
    setSectionName(section.name);
    setFilteredSections([]);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
    }
  };

  const handleDeleteImage = () => {
    setImage(null);
  };

  return (
    <div className="editing">
      <p className="title top">Создание категории</p>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <div>
        <p>Название категории</p>
        <input
          type="text"
          placeholder="Название категории"
          value={categoryName}
          onChange={(e) => setCategoryName(e.target.value)}
        />
        <p>Раздел категории</p>
        <div className="list-editing">
          <input
            className="z"
            type="text"
            placeholder="Выберите раздел"
            value={sectionName}
            onChange={handleSearchSections}
          />
          {sectionName && filteredSections.length > 0 && (
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
              <img
                src={URL.createObjectURL(image)}
                alt="Обложка категории"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <p style={{ textAlign: "center", lineHeight: "150px" }}>
                Обложка
              </p>
            )}
          </div>
          <div className="buttons-photo">
            <button
              className="button-editing"
              onClick={() =>
                document.getElementById("createFileInput")?.click()
              }
            >
              Загрузить фотографию
            </button>
            <input
              type="file"
              id="createFileInput"
              style={{ display: "none" }}
              onChange={handleImageUpload}
            />
            <button
              className="button-editing"
              onClick={handleDeleteImage}
              disabled={!image}
            >
              Удалить фотографию
            </button>
          </div>
        </div>
        <button className="button-editing" onClick={handleAddCategory}>
          Создать категорию
        </button>
      </div>
    </div>
  );
};

export default CreateCategoryManagement;
