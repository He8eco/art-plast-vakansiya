import React, { useState, useEffect } from "react";
import { db } from "../index.js";
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
import ListEditing from "../components/listEditing/listEditing.jsx";

const SectionManagement = () => {
  const [sectionName, setSectionName] = useState("");
  const [sectionPosition, setSectionPosition] = useState(""); // Поле для позиции
  const [sections, setSections] = useState([]);
  const [filteredSectionsForEdit, setFilteredSectionsForEdit] = useState([]);
  const [filteredSectionsForDelete, setFilteredSectionsForDelete] = useState(
    []
  );
  const [searchTermForEdit, setSearchTermForEdit] = useState("");
  const [searchTermForDelete, setSearchTermForDelete] = useState("");
  const [editingSectionId, setEditingSectionId] = useState(null);
  const [newSectionName, setNewSectionName] = useState("");
  const [newSectionPosition, setNewSectionPosition] = useState(""); // Новая позиция при редактировании

  // Получение разделов из базы данных, отсортированных по `position`
  useEffect(() => {
    const fetchSections = async () => {
      const q = query(collection(db, "sections"), orderBy("position", "asc"));
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

  const handleAddSection = async () => {
    if (!sectionName || !sectionPosition) return;

    try {
      await addDoc(collection(db, "sections"), {
        name: sectionName,
        position: parseInt(sectionPosition), // Преобразование позиции в число
      });
      setSectionName("");
      setSectionPosition("");
    } catch (error) {
      console.error("Error adding section: ", error);
    }
  };

  const handleSearchSectionsForEdit = (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filtered = sections.filter((section) =>
      section.name.toLowerCase().includes(searchTerm)
    );
    setFilteredSectionsForEdit(filtered);
    setSearchTermForEdit(searchTerm);
  };

  const handleSearchSectionsForDelete = (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filtered = sections.filter((section) =>
      section.name.toLowerCase().includes(searchTerm)
    );
    setFilteredSectionsForDelete(filtered);
    setSearchTermForDelete(searchTerm);
  };

  const handleSelectSectionForEdit = (section) => {
    setSearchTermForEdit(section.name);
    setFilteredSectionsForEdit([]);
    setEditingSectionId(section.id);
    setNewSectionName(section.name);
    setNewSectionPosition(section.position);
  };

  const handleSelectSectionForDelete = (section) => {
    setSearchTermForDelete(section.name);
    setFilteredSectionsForDelete([]);
  };

  const handleDeleteSection = async () => {
    try {
      const sectionToDelete = sections.find(
        (section) =>
          section.name.toLowerCase() === searchTermForDelete.toLowerCase()
      );

      if (sectionToDelete) {
        await deleteDoc(doc(db, "sections", sectionToDelete.id));
      }
      setSearchTermForDelete("");
    } catch (error) {
      console.error("Error deleting section: ", error);
    }
  };

  const handleEditSection = async () => {
    if (!editingSectionId || !newSectionName || !newSectionPosition) return;

    try {
      const sectionRef = doc(db, "sections", editingSectionId);
      await updateDoc(sectionRef, {
        name: newSectionName,
        position: parseInt(newSectionPosition),
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
      <ListEditing></ListEditing>
      <div className="editing">
        <p className="title top">Управление разделами</p>
        <div>
          <p>Введите название раздела и позицию</p>
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

        <div>
          <p className="title">Редактирование раздела</p>
          <p>Выберите раздел</p>
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
          <p>Введите название раздела и позицию</p>
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

        <div>
          <p className="title">Удаление раздела</p>
          <p>Выберите раздел</p>
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
