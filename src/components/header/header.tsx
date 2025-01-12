import React from "react";
import { Link } from "react-router-dom";
import Search from "../UI/search/search";
import "./header.scss";
import CatalogComponent from "../CatalogComponent";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../hooks/useAuth";

export default function Header() {
  const { currentUser } = useAuth();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 967);
  const infoRef = useRef<HTMLDivElement | null>(null); // Указываем, что это HTMLDivElement
  const infoIconRef = useRef<HTMLDivElement | null>(null);
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  // Отслеживание изменения размера окна
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 967);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Обработчик клика вне области окна информации
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        infoRef.current &&
        !infoRef.current.contains(event.target as Node) &&
        infoIconRef.current &&
        !infoIconRef.current.contains(event.target as Node)
      ) {
        setIsInfoOpen(false);
      }
    };
    if (isInfoOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isInfoOpen]);

  const handleInfoClick = () => {
    setIsInfoOpen((prev) => !prev);
  };

  return (
    <header className={isMobile ? "header-mobile" : ""}>
      <div className="header header-top">
        <div className="title">
          <h1>Арт-Пласт</h1>
          <h3>
            Магазин стройматериалов <br />и хозяйственных товаров
          </h3>
        </div>
        {!isMobile && (
          <>
            <p className="address">
              г. Семикаракорск, <br />
              ул. Калинина 138А
            </p>
            <div className="graphic">
              <p>пн-пт: с 8:00 до 18:00</p>
              <p>сб: с 9:00 до 15:00</p>
            </div>
          </>
        )}
        <p className="telephone">+7 (928)603-55-58</p>
        {isMobile && (
          <div
            className="info-icon"
            onClick={handleInfoClick}
            ref={infoIconRef}
          >
            {/* Укажите правильный путь к вашему файлу info.svg */}
            <svg
              width="3rem"
              height="3rem"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 17V11"
                stroke="#fff"
                stroke-width="1.5"
                stroke-linecap="round"
              />
              <circle
                cx="1"
                cy="1"
                r="1"
                transform="matrix(1 0 0 -1 11 9)"
                fill="#fff"
              />
              <path
                d="M7 3.33782C8.47087 2.48697 10.1786 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 10.1786 2.48697 8.47087 3.33782 7"
                stroke="#fff"
                stroke-width="1.5"
                stroke-linecap="round"
              />
            </svg>
          </div>
        )}
        {/* Окно с информацией на мобильных устройствах */}
        {isMobile && isInfoOpen && (
          <div className="info-window" ref={infoRef}>
            <div>
              <p>Адрес:</p>
              <p className="address">
                г. Семикаракорск, <br />
                ул. Калинина 138А
              </p>
            </div>
            <div>
              <p>График работы:</p>
              <div className="graphic">
                <p>пн-пт: с 8:00 до 18:00</p>
                <p>сб: с 9:00 до 15:00</p>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="header header-bottom">
        <CatalogComponent />
        <Search />
        {!isMobile && (
          <>
            <Link to="/about">Главная</Link>
            <Link to="/FavoritesPage">Избранное</Link>
            {currentUser && <Link to="/SectionManagement">Редактирование</Link>}
          </>
        )}

        {isMobile && (
          <>
            <Link to="/about">
              <svg
                width="3rem"
                height="3rem"
                viewBox="0 -1 22 22"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M2 11C1.08049 11 0.648384 9.86349 1.33564 9.25259L10.3356 1.25259C10.7145 0.915803 11.2855 0.915803 11.6644 1.25259L20.6644 9.25259C21.3516 9.86349 20.9195 11 20 11H19V18C19 18.5523 18.5523 19 18 19H4C3.44772 19 3 18.5523 3 18V11H2ZM8 17V12C8 11.4477 8.44772 11 9 11H13C13.5523 11 14 11.4477 14 12V17H17V10C17 9.62477 17.2067 9.29781 17.5124 9.12674L11 3.33795L4.48762 9.12674C4.79334 9.29781 5 9.62477 5 10V17H8ZM10 17V13H12V17H10Z"
                  fill="#fff"
                />
              </svg>
            </Link>
            <Link to="/FavoritesPage">
              <svg
                width="3rem"
                height="3rem"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M15.7 4C18.87 4 21 6.98 21 9.76C21 15.39 12.16 20 12 20C11.84 20 3 15.39 3 9.76C3 6.98 5.13 4 8.3 4C10.12 4 11.31 4.91 12 5.71C12.69 4.91 13.88 4 15.7 4Z"
                  stroke="#fff"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </Link>
            {currentUser && (
              <Link to="/SectionManagement">
                <svg
                  width="3rem"
                  height="3rem"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                >
                  <path
                    fill="#fff"
                    fill-rule="evenodd"
                    d="M15.198 3.52a1.612 1.612 0 012.223 2.336L6.346 16.421l-2.854.375 1.17-3.272L15.197 3.521zm3.725-1.322a3.612 3.612 0 00-5.102-.128L3.11 12.238a1 1 0 00-.253.388l-1.8 5.037a1 1 0 001.072 1.328l4.8-.63a1 1 0 00.56-.267L18.8 7.304a3.612 3.612 0 00.122-5.106zM12 17a1 1 0 100 2h6a1 1 0 100-2h-6z"
                  />
                </svg>
              </Link>
            )}
          </>
        )}
      </div>
    </header>
  );
}
