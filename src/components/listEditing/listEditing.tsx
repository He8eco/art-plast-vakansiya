import React from "react";
import { Link, NavLink } from "react-router-dom";
import "./listEditing.scss";

export default function ListEditing() {
  return (
    <div className="listEditing">
      <NavLink
        to="/SectionManagement"
        className={({ isActive, isPending }) =>
          isPending ? "pending" : isActive ? "active" : ""
        }
      >
        Управление разделами
      </NavLink>
      <NavLink
        to="/CategoryManagement"
        className={({ isActive, isPending }) =>
          isPending ? "pending" : isActive ? "active" : ""
        }
      >
        Управление категориями
      </NavLink>
      <NavLink
        to="/AddProduct"
        className={({ isActive, isPending }) =>
          isPending ? "pending" : isActive ? "active" : ""
        }
      >
        Добавление товара
      </NavLink>
      <NavLink
        to="/EditProduct"
        className={({ isActive, isPending }) =>
          isPending ? "pending" : isActive ? "active" : ""
        }
      >
        Изменение товара
      </NavLink>
      <NavLink
        to="/DeleteProduct"
        className={({ isActive, isPending }) =>
          isPending ? "pending" : isActive ? "active" : ""
        }
      >
        Удаление товара
      </NavLink>
      <NavLink
        to="/Offers"
        className={({ isActive, isPending }) =>
          isPending ? "pending" : isActive ? "active" : ""
        }
      >
        Рекомендуемые категории
      </NavLink>
      <NavLink
        to="/ManagePromotions"
        className={({ isActive, isPending }) =>
          isPending ? "pending" : isActive ? "active" : ""
        }
      >
        Акции
      </NavLink>
      <NavLink
        to="/TemplateSpecifications"
        className={({ isActive, isPending }) =>
          isPending ? "pending" : isActive ? "active" : ""
        }
      >
        Шаблон характеристик
      </NavLink>
      <NavLink
        to="/Logout"
        className={({ isActive, isPending }) =>
          isPending ? "pending" : isActive ? "active" : ""
        }
      >
        Выход
      </NavLink>
      <Link to="">Архив товаров</Link>
      <Link to="">Добавление в архив</Link>
    </div>
  );
}
