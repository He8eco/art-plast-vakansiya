import React, { useState, useEffect, useRef } from "react";
import { db } from "../index.js";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useParams, Link, useLocation } from "react-router-dom";
import ReactSlider from "react-slider";
import "../styles/productsByCategory.css";
import fourSquares from "../img/fourSquares.svg";
import Breadcrumb from "../components/UI/BreadCrumb.jsx";
import FavoriteButton from "../components/UI/FavoriteButton.jsx";

const ProductsByCategory = () => {
  const { sectionName, categoryName } = useParams();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 0 });
  const [availableFilters, setAvailableFilters] = useState({});
  const [selectedFilters, setSelectedFilters] = useState({});
  const [companyNames, setCompanyNames] = useState([]);
  const [selectedCompanies, setSelectedCompanies] = useState([]);
  const [sliderValue, setSliderValue] = useState(null);
  const [sortOrder, setSortOrder] = useState("default");
  const [activeDisplay, setActiveDisplay] = useState("lines"); // по умолчанию активен "lines"
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const filtersRef = useRef(null);
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const handleDisplayClick = (displayType) => {
    setActiveDisplay(displayType); // обновляем активный элемент
  };
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isMobile &&
        isFiltersOpen &&
        filtersRef.current &&
        !filtersRef.current.contains(event.target)
      ) {
        setIsFiltersOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobile, isFiltersOpen]);

  // Загрузка продуктов
  useEffect(() => {
    const fetchProducts = async () => {
      if (!categoryName) {
        console.error("Имя категории не указано.");
        return;
      }

      try {
        const productsQuery = query(
          collection(db, "product"),
          where("categoryName", "==", categoryName)
        );
        const productsSnapshot = await getDocs(productsQuery);
        const productsData = productsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setProducts(productsData);
        setFilteredProducts(productsData);

        const prices = productsData.map((product) => product.price);
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        setPriceRange({ min: minPrice, max: maxPrice });
        setSliderValue([minPrice, maxPrice]);

        const uniqueCompanies = [
          ...new Set(productsData.map((product) => product.companyName)),
        ];
        setCompanyNames(uniqueCompanies);

        extractFilters(productsData);
      } catch (error) {
        console.error("Ошибка при получении товаров: ", error);
      }
    };

    fetchProducts();
  }, [categoryName]);

  useEffect(() => {
    applyFiltersAndSorting();
  }, [sliderValue, selectedFilters, selectedCompanies, sortOrder, products]);

  const handleSortOrder = (order) => {
    setSortOrder((prevOrder) => (prevOrder === order ? "default" : order));
  };

  const applyFiltersAndSorting = () => {
    let tempProducts = products;

    const [minSliderValue, maxSliderValue] = sliderValue || [
      priceRange.min,
      priceRange.max,
    ];

    // Фильтрация по цене с учетом скидки
    tempProducts = tempProducts.filter((product) => {
      const priceToFilter = product.discount || product.price;
      return priceToFilter >= minSliderValue && priceToFilter <= maxSliderValue;
    });

    // Фильтрация по компании
    if (selectedCompanies.length > 0) {
      tempProducts = tempProducts.filter((product) =>
        selectedCompanies.includes(product.companyName)
      );
    }

    // Фильтрация по характеристикам
    for (const [filterName, filterValues] of Object.entries(selectedFilters)) {
      if (filterValues.length > 0) {
        tempProducts = tempProducts.filter((product) =>
          product.fullSpecs.some(
            (spec) =>
              spec.name === filterName &&
              filterValues.includes(spec.value.trim())
          )
        );
      }
    }

    // Сортировка по цене
    if (sortOrder === "asc") {
      tempProducts.sort((a, b) => a.price - b.price);
    } else if (sortOrder === "desc") {
      tempProducts.sort((a, b) => b.price - a.price);
    }

    setFilteredProducts(tempProducts);
  };

  const extractFilters = (products) => {
    const filters = {};
    products.forEach((product) => {
      if (product.fullSpecs) {
        product.fullSpecs.forEach(({ name, value }) => {
          const normalizedValue = value.trim();
          if (!filters[name]) {
            filters[name] = new Set();
          }
          filters[name].add(normalizedValue);
        });
      }
    });

    const filtersObject = {};
    for (const [key, valuesSet] of Object.entries(filters)) {
      filtersObject[key] = Array.from(valuesSet);
    }
    setAvailableFilters(filtersObject);
  };

  const handleSliderChange = (newRange) => {
    setSliderValue(newRange);
  };

  const handleCompanyChange = (event) => {
    const company = event.target.value;
    setSelectedCompanies((prevSelectedCompanies) =>
      prevSelectedCompanies.includes(company)
        ? prevSelectedCompanies.filter((c) => c !== company)
        : [...prevSelectedCompanies, company]
    );
  };

  const handlePriceInputChange = (type, value) => {
    const newRange =
      type === "min" ? [value, sliderValue[1]] : [sliderValue[0], value];
    setSliderValue(newRange);
  };

  const toggleFilter = (filterName, filterValue) => {
    setSelectedFilters((prevFilters) => {
      const currentValues = prevFilters[filterName] || [];
      const newValues = currentValues.includes(filterValue)
        ? currentValues.filter((value) => value !== filterValue)
        : [...currentValues, filterValue];

      return {
        ...prevFilters,
        [filterName]: newValues,
      };
    });
  };
  const availableCompanies = [
    ...new Set(products.map((product) => product.company).filter(Boolean)),
  ];
  const toggleCompanyFilter = (company) => {
    setSelectedCompanies((prevSelected) =>
      prevSelected.includes(company)
        ? prevSelected.filter((c) => c !== company)
        : [...prevSelected, company]
    );
  };

  const handleFiltersToggle = () => {
    setIsFiltersOpen((prev) => !prev);
  };

  return (
    <div className="product">
      <Breadcrumb categoryName={categoryName} />
      <div className="product-and-filters">
        {/* Фильтры */}
        {(!isMobile || (isMobile && isFiltersOpen)) && (
          <div className={`block-filters ${isMobile ? "mobile-filters" : ""}`}>
            <div className="filters" ref={filtersRef}>
              {isMobile && (
                <button className="close-filters" onClick={handleFiltersToggle}>
                  ×
                </button>
              )}
              <div className="price-block">
                <p>Цена, руб.</p>
                <div className="price">
                  <label>
                    <div>От</div>
                    <input
                      type="number"
                      name="min"
                      value={sliderValue ? sliderValue[0] : ""}
                      onChange={(e) =>
                        handlePriceInputChange("min", +e.target.value)
                      }
                    />
                  </label>
                  <label>
                    <div>До</div>
                    <input
                      type="number"
                      name="max"
                      value={sliderValue ? sliderValue[1] : ""}
                      onChange={(e) =>
                        handlePriceInputChange("max", +e.target.value)
                      }
                    />
                  </label>
                </div>
                {sliderValue && (
                  <ReactSlider
                    className="price-slider"
                    thumbClassName="price-slider-thumb"
                    trackClassName="price-slider-track"
                    min={priceRange.min}
                    max={priceRange.max}
                    value={sliderValue}
                    onChange={handleSliderChange}
                    pearling
                    minDistance={10}
                  />
                )}
              </div>
              <div className="filter-group">
                <p>Компании:</p>
                <div className="filter-values">
                  {products.length > 0 ? (
                    [
                      ...new Set(
                        products.map((product) => product.companyName)
                      ),
                    ].map((company, index) => (
                      <div
                        key={`${company}-${index}`}
                        className={`filter-option ${
                          selectedCompanies.includes(company) ? "selected" : ""
                        }`}
                        onClick={() => toggleCompanyFilter(company)}
                      >
                        <span className="filter-square"></span>
                        <span className="filter-text">{company}</span>
                      </div>
                    ))
                  ) : (
                    <p>Нет доступных компаний</p>
                  )}
                </div>
              </div>
              {Object.entries(availableFilters).map(
                ([filterName, filterValues]) => (
                  <div key={filterName} className="filter-group">
                    <p>{filterName}:</p>
                    <div className="filter-values">
                      {filterValues.map((value) => (
                        <div
                          key={value}
                          className={`filter-option ${
                            selectedFilters[filterName]?.includes(value)
                              ? "selected"
                              : ""
                          }`}
                          onClick={() => toggleFilter(filterName, value)}
                        >
                          <span className="filter-square"></span>
                          <span className="filter-text">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        )}
        <div className="products">
          <div className="sorting">
            <div className="products-filters">
              {isMobile && (
                <div
                  className="mobile-filters-button"
                  onClick={handleFiltersToggle}
                >
                  <svg
                    width="2rem"
                    height="2rem"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 7L20 7"
                      stroke="#33363F"
                      stroke-width="2"
                      stroke-linecap="round"
                    />
                    <path
                      d="M4 7L8 7"
                      stroke="#33363F"
                      stroke-width="2"
                      stroke-linecap="round"
                    />
                    <path
                      d="M17 17L20 17"
                      stroke="#33363F"
                      stroke-width="2"
                      stroke-linecap="round"
                    />
                    <path
                      d="M4 17L12 17"
                      stroke="#33363F"
                      stroke-width="2"
                      stroke-linecap="round"
                    />
                    <circle
                      cx="10"
                      cy="7"
                      r="2"
                      transform="rotate(90 10 7)"
                      stroke="#33363F"
                      stroke-width="2"
                      stroke-linecap="round"
                    />
                    <circle
                      cx="15"
                      cy="17"
                      r="2"
                      transform="rotate(90 15 17)"
                      stroke="#33363F"
                      stroke-width="2"
                      stroke-linecap="round"
                    />
                  </svg>
                  <span>Фильтры</span>
                </div>
              )}
              <div className="sorting-by-price">
                <p>Сортировать по цене:</p>
                <div className="sorting-options">
                  <div
                    className={`filter-option ${
                      sortOrder === "asc" ? "selected" : ""
                    }`}
                    onClick={() => handleSortOrder("asc")}
                  >
                    <span className="filter-square"></span>
                    <span className="filter-text">От меньшей</span>
                  </div>
                  <div
                    className={`filter-option ${
                      sortOrder === "desc" ? "selected" : ""
                    }`}
                    onClick={() => handleSortOrder("desc")}
                  >
                    <span className="filter-square"></span>
                    <span className="filter-text">От большей</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="sorting-by-display">
              <svg
                className={`squares ${
                  activeDisplay === "squares" ? "active" : ""
                }`}
                fill="#000000"
                viewBox="0 0 606.877 606.877"
                onClick={() => handleDisplayClick("squares")}
              >
                <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                <g
                  id="SVGRepo_tracerCarrier"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                ></g>
                <g id="SVGRepo_iconCarrier">
                  {" "}
                  <g>
                    {" "}
                    <g>
                      {" "}
                      <g>
                        {" "}
                        <path d="M58.64,280.154h162.654c32.058,0,58.14-26.082,58.14-58.14V59.36c0-32.059-26.082-58.14-58.14-58.14H58.64 C26.582,1.22,0.5,27.301,0.5,59.36v162.654C0.5,254.072,26.582,280.154,58.64,280.154z M43.34,59.36c0-8.45,6.85-15.3,15.3-15.3 h162.654c8.45,0,15.3,6.85,15.3,15.3v162.654c0,8.45-6.85,15.3-15.3,15.3H58.64c-8.45,0-15.3-6.85-15.3-15.3V59.36z"></path>{" "}
                        <path d="M221.294,280.654H58.64c-32.334,0-58.64-26.306-58.64-58.64V59.36C0,27.025,26.306,0.72,58.64,0.72h162.654 c32.334,0,58.64,26.306,58.64,58.64v162.654C279.934,254.348,253.628,280.654,221.294,280.654z M58.64,1.72 C26.857,1.72,1,27.577,1,59.36v162.654c0,31.783,25.857,57.64,57.64,57.64h162.654c31.783,0,57.64-25.857,57.64-57.64V59.36 c0-31.783-25.857-57.64-57.64-57.64H58.64z M221.294,237.813H58.64c-8.712,0-15.8-7.088-15.8-15.8V59.36 c0-8.712,7.088-15.8,15.8-15.8h162.654c8.712,0,15.8,7.088,15.8,15.8v162.654C237.094,230.726,230.006,237.813,221.294,237.813z M58.64,44.56c-8.161,0-14.8,6.639-14.8,14.8v162.654c0,8.161,6.639,14.8,14.8,14.8h162.654c8.161,0,14.8-6.639,14.8-14.8V59.36 c0-8.161-6.639-14.8-14.8-14.8H58.64z"></path>{" "}
                      </g>{" "}
                      <g>
                        {" "}
                        <path d="M548.238,1.22H385.584c-32.059,0-58.141,26.082-58.141,58.14v162.654c0,32.058,26.082,58.14,58.141,58.14h162.654 c32.059,0,58.139-26.082,58.139-58.14V59.36C606.377,27.301,580.297,1.22,548.238,1.22z M563.537,222.014 c0,8.45-6.85,15.3-15.299,15.3H385.584c-8.449,0-15.301-6.85-15.301-15.3V59.36c0-8.45,6.852-15.3,15.301-15.3h162.654 c8.449,0,15.299,6.85,15.299,15.3V222.014z"></path>{" "}
                        <path d="M548.238,280.654H385.584c-32.335,0-58.641-26.306-58.641-58.64V59.36c0-32.334,26.306-58.64,58.641-58.64h162.654 c32.333,0,58.639,26.306,58.639,58.64v162.654C606.877,254.348,580.571,280.654,548.238,280.654z M385.584,1.72 c-31.783,0-57.641,25.857-57.641,57.64v162.654c0,31.783,25.857,57.64,57.641,57.64h162.654c31.782,0,57.639-25.857,57.639-57.64 V59.36c0-31.783-25.856-57.64-57.639-57.64H385.584z M548.238,237.813H385.584c-8.713,0-15.801-7.088-15.801-15.8V59.36 c0-8.712,7.088-15.8,15.801-15.8h162.654c8.712,0,15.799,7.088,15.799,15.8v162.654 C564.037,230.726,556.95,237.813,548.238,237.813z M385.584,44.56c-8.161,0-14.801,6.639-14.801,14.8v162.654 c0,8.161,6.64,14.8,14.801,14.8h162.654c8.16,0,14.799-6.639,14.799-14.8V59.36c0-8.161-6.639-14.8-14.799-14.8H385.584z"></path>{" "}
                      </g>{" "}
                      <g>
                        {" "}
                        <path d="M58.64,605.657h162.654c32.058,0,58.14-26.08,58.14-58.139V384.864c0-32.059-26.082-58.141-58.14-58.141H58.64 c-32.058,0-58.14,26.082-58.14,58.141v162.654C0.5,579.577,26.582,605.657,58.64,605.657z M43.34,384.864 c0-8.449,6.85-15.301,15.3-15.301h162.654c8.45,0,15.3,6.852,15.3,15.301v162.654c0,8.449-6.85,15.299-15.3,15.299H58.64 c-8.45,0-15.3-6.85-15.3-15.299V384.864z"></path>{" "}
                        <path d="M221.294,606.157H58.64C26.306,606.157,0,579.852,0,547.519V384.864c0-32.335,26.306-58.641,58.64-58.641h162.654 c32.334,0,58.64,26.306,58.64,58.641v162.654C279.934,579.852,253.628,606.157,221.294,606.157z M58.64,327.224 C26.857,327.224,1,353.081,1,384.864v162.654c0,31.782,25.857,57.639,57.64,57.639h162.654c31.783,0,57.64-25.856,57.64-57.639 V384.864c0-31.783-25.857-57.641-57.64-57.641H58.64z M221.294,563.317H58.64c-8.712,0-15.8-7.087-15.8-15.799V384.864 c0-8.713,7.088-15.801,15.8-15.801h162.654c8.712,0,15.8,7.088,15.8,15.801v162.654 C237.094,556.23,230.006,563.317,221.294,563.317z M58.64,370.063c-8.161,0-14.8,6.64-14.8,14.801v162.654 c0,8.16,6.639,14.799,14.8,14.799h162.654c8.161,0,14.8-6.639,14.8-14.799V384.864c0-8.161-6.639-14.801-14.8-14.801H58.64z"></path>{" "}
                      </g>{" "}
                      <g>
                        {" "}
                        <path d="M548.238,326.724H385.584c-32.059,0-58.141,26.082-58.141,58.141v162.654c0,32.059,26.082,58.139,58.141,58.139h162.654 c32.059,0,58.139-26.08,58.139-58.139V384.864C606.377,352.806,580.297,326.724,548.238,326.724z M563.537,547.519 c0,8.449-6.85,15.299-15.299,15.299H385.584c-8.449,0-15.301-6.85-15.301-15.299V384.864c0-8.449,6.852-15.301,15.301-15.301 h162.654c8.449,0,15.299,6.852,15.299,15.301V547.519z"></path>{" "}
                        <path d="M548.238,606.157H385.584c-32.335,0-58.641-26.306-58.641-58.639V384.864c0-32.335,26.306-58.641,58.641-58.641h162.654 c32.333,0,58.639,26.306,58.639,58.641v162.654C606.877,579.852,580.571,606.157,548.238,606.157z M385.584,327.224 c-31.783,0-57.641,25.857-57.641,57.641v162.654c0,31.782,25.857,57.639,57.641,57.639h162.654 c31.782,0,57.639-25.856,57.639-57.639V384.864c0-31.783-25.856-57.641-57.639-57.641H385.584z M548.238,563.317H385.584 c-8.713,0-15.801-7.087-15.801-15.799V384.864c0-8.713,7.088-15.801,15.801-15.801h162.654c8.712,0,15.799,7.088,15.799,15.801 v162.654C564.037,556.23,556.95,563.317,548.238,563.317z M385.584,370.063c-8.161,0-14.801,6.64-14.801,14.801v162.654 c0,8.16,6.64,14.799,14.801,14.799h162.654c8.16,0,14.799-6.639,14.799-14.799V384.864c0-8.161-6.639-14.801-14.799-14.801 H385.584z"></path>{" "}
                      </g>{" "}
                    </g>{" "}
                  </g>{" "}
                </g>
              </svg>
              <svg
                className={`lines ${activeDisplay === "lines" ? "active" : ""}`}
                viewBox="0 0 32 32"
                onClick={() => handleDisplayClick("lines")}
              >
                <path d="M 8 5 C 6.3550302 5 5 6.3550302 5 8 C 5 9.6449698 6.3550302 11 8 11 L 24 11 C 25.64497 11 27 9.6449698 27 8 C 27 6.3550302 25.64497 5 24 5 L 8 5 z M 8 7 L 24 7 C 24.56503 7 25 7.4349698 25 8 C 25 8.5650302 24.56503 9 24 9 L 8 9 C 7.4349698 9 7 8.5650302 7 8 C 7 7.4349698 7.4349698 7 8 7 z M 8 13 C 6.3550302 13 5 14.35503 5 16 C 5 17.64497 6.3550302 19 8 19 L 24 19 C 25.64497 19 27 17.64497 27 16 C 27 14.35503 25.64497 13 24 13 L 8 13 z M 8 15 L 24 15 C 24.56503 15 25 15.43497 25 16 C 25 16.56503 24.56503 17 24 17 L 8 17 C 7.4349698 17 7 16.56503 7 16 C 7 15.43497 7.4349698 15 8 15 z M 8 21 C 6.3550302 21 5 22.35503 5 24 C 5 25.64497 6.3550302 27 8 27 L 24 27 C 25.64497 27 27 25.64497 27 24 C 27 22.35503 25.64497 21 24 21 L 8 21 z M 8 23 L 24 23 C 24.56503 23 25 23.43497 25 24 C 25 24.56503 24.56503 25 24 25 L 8 25 C 7.4349698 25 7 24.56503 7 24 C 7 23.43497 7.4349698 23 8 23 z"></path>
              </svg>
            </div>
          </div>
          <div className="product-display">
            {activeDisplay === "lines" ? (
              <ul className="lines-cards">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <li key={product.id}>
                      <div className="product-block">
                        <FavoriteButton productId={product.id} />
                        <div>
                          {product.mainImage && (
                            <img
                              className="product-photo"
                              src={product.mainImage}
                              alt={product.name}
                            />
                          )}
                        </div>
                        <div className="product-values">
                          <p>
                            <Link
                              className="product-name"
                              to={`/${sectionName}/${categoryName}/${product.id}`}
                            >
                              {product.companyName} {product.name}
                            </Link>
                          </p>
                          {product.shortSpecs &&
                            product.shortSpecs.length > 0 && (
                              <div>
                                <ul>
                                  {product.shortSpecs.map((spec, index) => (
                                    <li key={index}>
                                      <span className="product-name-property">
                                        {spec.name}: 
                                      </span>
                                      <span> {spec.value}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          <div>
                            <p
                              className={`product-price ${
                                product.discount ? "product-price-none" : ""
                              }`}
                            >
                              {product.price} ₽
                            </p>
                            {product.discount && (
                              <p className="product-discount-price">
                                {product.discount} ₽
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </li>
                  ))
                ) : (
                  <p>Товары не найдены.</p>
                )}
              </ul>
            ) : (
              <ul className="squares-cards">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <li key={product.id}>
                      <Link
                        to={`/${sectionName}/${categoryName}/${product.id}`}
                      >
                        <div className="card">
                          <FavoriteButton productId={product.id} />
                          <div>
                            {product.mainImage && (
                              <img
                                className="product-photo"
                                src={product.mainImage}
                                alt={product.name}
                              />
                            )}
                          </div>
                          <div className="product-values">
                            <p className="product-name">
                              {product.companyName} {product.name}
                            </p>
                            <div>
                              <p
                                className={`product-price ${
                                  product.discount ? "product-price-none" : ""
                                }`}
                              >
                                {product.price} ₽
                              </p>
                              {product.discount && (
                                <p className="product-discount-price">
                                  {product.discount} ₽
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </Link>
                    </li>
                  ))
                ) : (
                  <p>Товары не найдены.</p>
                )}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsByCategory;
