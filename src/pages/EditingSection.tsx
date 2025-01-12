import React, { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  query,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
  orderBy,
} from "firebase/firestore";
import { db } from "../index";
import ListEditing from "../components/listEditing/listEditing";

// Интерфейсы для типов данных
interface Section {
  id: string;
  name: string;
  position: number;
}

const SectionManagement: React.FC = () => {
  const [sectionName, setSectionName] = useState<string>("");
  const [sectionPosition, setSectionPosition] = useState<string>(""); // Строка для ввода
  const [sections, setSections] = useState<Section[]>([]);
  const [filteredSectionsForEdit, setFilteredSectionsForEdit] = useState<Section[]>([]);
  const [filteredSectionsForDelete, setFilteredSectionsForDelete] = useState<Section[]>([]);
  const [searchTermForEdit, setSearchTermForEdit] = useState<string>("");
  const [searchTermForDelete, setSearchTermForDelete] = useState<string>("");
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [newSectionName, setNewSectionName] = useState<string>("");
  const [newSectionPosition, setNewSectionPosition] = useState<string>(""); // Строка для ввода

  // Получение разделов из базы данных, отсортированных по `position`
  useEffect(() => {
    const fetchSections = async () => {
      const q = query(collection(db, "sections"), orderBy("position", "asc"));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const sectionsList: Section[] = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Section, "id">), // Приведение типов
        }));
        setSections(sectionsList);
      });
      return () => unsubscribe();
    };
    fetchSections();
  }, []);

  const handleAddSection = async () => {
    const positionNumber = Number(sectionPosition);
    if (!sectionName || isNaN(positionNumber)) {
      alert("Введите корректные данные для раздела!");
      return;
    }

    try {
      await addDoc(collection(db, "sections"), {
        name: sectionName,
        position: positionNumber,
      });
      setSectionName("");
      setSectionPosition("");
    } catch (error) {
      console.error("Error adding section: ", error);
    }
  };

  const handleSearchSectionsForEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchTerm = e.target.value.toLowerCase();
    const filtered = sections.filter((section) =>
      section.name.toLowerCase().includes(searchTerm)
    );
    setFilteredSectionsForEdit(filtered);
    setSearchTermForEdit(searchTerm);
  };

  const handleSearchSectionsForDelete = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchTerm = e.target.value.toLowerCase();
    const filtered = sections.filter((section) =>
      section.name.toLowerCase().includes(searchTerm)
    );
    setFilteredSectionsForDelete(filtered);
    setSearchTermForDelete(searchTerm);
  };

  const handleSelectSectionForEdit = (section: Section) => {
    setSearchTermForEdit(section.name);
    setFilteredSectionsForEdit([]);
    setEditingSectionId(section.id);
    setNewSectionName(section.name);
    setNewSectionPosition(section.position.toString());
  };

  const handleSelectSectionForDelete = (section: Section) => {
    setSearchTermForDelete(section.name);
    setFilteredSectionsForDelete([]);
  };

  const handleDeleteSection = async () => {
    const sectionToDelete = sections.find(
      (section) =>
        section.name.toLowerCase() === searchTermForDelete.toLowerCase()
    );

    if (!sectionToDelete) {
      alert("Раздел не найден!");
      return;
    }

    try {
      await deleteDoc(doc(db, "sections", sectionToDelete.id));
      setSearchTermForDelete("");
    } catch (error) {
      console.error("Error deleting section: ", error);
    }
  };

  const handleEditSection = async () => {
    const positionNumber = Number(newSectionPosition);
    if (!editingSectionId || !newSectionName || isNaN(positionNumber)) {
      alert("Введите корректные данные для редактирования!");
      return;
    }

    try {
      const sectionRef = doc(db, "sections", editingSectionId);
      await updateDoc(sectionRef, {
        name: newSectionName,
        position: positionNumber,
      });

      setEditingSectionId(null);
      setNewSectionName("");
      setNewSectionPosition("");
      setSearchTermForEdit("");
    } catch (error) {
      console.error("Error updating section: ", error);
    }
  };

  return (
    <div className="flex">
      <ListEditing />
      <div className="editing">
        <p className="title top">Управление разделами</p>

        {/* Создание раздела */}
        <div>
          <p>Создание раздела</p>
          <input
            type="text"
            placeholder="Название раздела"
            value={sectionName}
            onChange={(e) => setSectionName(e.target.value)}
          />
          <input
            type="number"
            placeholder="Позиция раздела"
            value={sectionPosition}
            onChange={(e) => setSectionPosition(e.target.value)}
          />
        </div>
        <button className="button-editing" onClick={handleAddSection}>
          Создать раздел
        </button>

        {/* Редактирование раздела */}
        <div>
          <p>Редактирование раздела</p>
          <div className="list-editing">
            <input
              className="z"
              type="text"
              placeholder="Поиск раздела"
              value={searchTermForEdit}
              onChange={handleSearchSectionsForEdit}
            />
            {searchTermForEdit && filteredSectionsForEdit.length > 0 && (
              <ul>
                {filteredSectionsForEdit.map((section) => (
                  <li
                    key={section.id}
                    onClick={() => handleSelectSectionForEdit(section)}
                  >
                    {section.name}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <input
              type="text"
              placeholder="Новое название раздела"
              value={newSectionName}
              onChange={(e) => setNewSectionName(e.target.value)}
              disabled={!editingSectionId}
            />
            <input
              type="number"
              placeholder="Новая позиция"
              value={newSectionPosition}
              onChange={(e) => setNewSectionPosition(e.target.value)}
              disabled={!editingSectionId}
            />
          </div>
          <button
            className="button-editing"
            onClick={handleEditSection}
            disabled={
              !editingSectionId || !newSectionName || !newSectionPosition
            }
          >
            Сохранить изменения
          </button>
        </div>

        {/* Удаление раздела */}
        <div>
          <p>Удаление раздела</p>
          <div className="list-editing">
            <input
              className="z"
              type="text"
              placeholder="Поиск раздела"
              value={searchTermForDelete}
              onChange={handleSearchSectionsForDelete}
            />
            {searchTermForDelete && filteredSectionsForDelete.length > 0 && (
              <ul>
                {filteredSectionsForDelete.map((section) => (
                  <li
                    key={section.id}
                    onClick={() => handleSelectSectionForDelete(section)}
                  >
                    {section.name}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <button className="button-editing" onClick={handleDeleteSection}>
          Удалить раздел
        </button>
      </div>
    </div>
  );
};

export default SectionManagement;
