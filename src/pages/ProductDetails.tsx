import React, { useState, useEffect } from "react";
import { db } from "../index";
import { doc, getDoc } from "firebase/firestore";
import { useParams } from "react-router-dom";
import "../styles/ProductDetails.scss";
import Breadcrumb from "../components/UI/BreadCrumb";
import FavoriteButton from "../components/UI/FavoriteButton";

interface Product {
  id: string;
  name: string;
  companyName: string;
  categoryName: string;
  price: number;
  discount?: number;
  images: string[];
  fullSpecs?: { name: string; value: string }[];
  description?: string;
  benefits?: string[];
}

const ProductDetails = () => {
  const { productId } = useParams<{ productId: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [visibleThumbnailsStart, setVisibleThumbnailsStart] =
    useState<number>(0);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) return;

      try {
        const productRef = doc(db, "product", productId);
        const productSnapshot = await getDoc(productRef);

        if (productSnapshot.exists()) {
          const data = productSnapshot.data() as Omit<Product, "id">;
          setProduct({ id: productSnapshot.id, ...data });
        } else {
          console.error("Товар не найден.");
        }
      } catch (error) {
        console.error("Ошибка при получении данных товара: ", error);
      }
    };

    fetchProduct();
  }, [productId]);

  if (!product) return <p>Загрузка...</p>;

  const THUMBNAILS_VISIBLE_COUNT = 3;

  const showNextImage = () => {
    const newIndex = (selectedImageIndex + 1) % product.images.length;
    setSelectedImageIndex(newIndex);
    ensureThumbnailVisible(newIndex);
  };

  const showPreviousImage = () => {
    const newIndex =
      (selectedImageIndex - 1 + product.images.length) % product.images.length;
    setSelectedImageIndex(newIndex);
    ensureThumbnailVisible(newIndex);
  };

  const scrollThumbnailsDown = () => {
    setVisibleThumbnailsStart(
      (prevStart) => (prevStart + 1) % product.images.length
    );
  };

  const scrollThumbnailsUp = () => {
    setVisibleThumbnailsStart(
      (prevStart) =>
        (prevStart - 1 + product.images.length) % product.images.length
    );
  };

  const ensureThumbnailVisible = (index: number) => {
    if (
      index < visibleThumbnailsStart ||
      index >= visibleThumbnailsStart + THUMBNAILS_VISIBLE_COUNT
    ) {
      setVisibleThumbnailsStart(index);
    }
  };

  return (
    <div className="product-details">
      <FavoriteButton productId={product.id} />
      <Breadcrumb
        categoryName={product.categoryName}
        companyName={product.companyName}
      />
      <p className="product-name">
        {product.companyName} {product.name}
      </p>
      <div className="product">
        <div className="images-container">
          <div className="thumbnail-column">
            <button
              className="arrow-button up-arrow"
              onClick={scrollThumbnailsUp}
              disabled={product.images.length <= THUMBNAILS_VISIBLE_COUNT}
            >
              <span>&gt;</span>
            </button>
            {product.images &&
              Array.from({ length: THUMBNAILS_VISIBLE_COUNT }, (_, i) => {
                const thumbnailIndex =
                  (visibleThumbnailsStart + i) % product.images.length;
                return (
                  <img
                    key={thumbnailIndex}
                    src={product.images[thumbnailIndex]}
                    alt={`${product.name} thumbnail`}
                    className={`thumbnail ${
                      selectedImageIndex === thumbnailIndex
                        ? "selected-thumbnail"
                        : ""
                    }`}
                    onClick={() => setSelectedImageIndex(thumbnailIndex)}
                  />
                );
              })}
            <button
              className="arrow-button down-arrow"
              onClick={scrollThumbnailsDown}
              disabled={product.images.length <= THUMBNAILS_VISIBLE_COUNT}
            >
              <span>&gt;</span>
            </button>
          </div>
          <div className="mobile-image-container">
            <span className="arrow left-arrow" onClick={showPreviousImage}>
              &lt;
            </span>
            <div className="main-image-container">
              <img
                className="main-image"
                src={product.images[selectedImageIndex]}
                alt={`${product.name} main`}
              />
            </div>
            <span className="arrow right-arrow" onClick={showNextImage}>
              &gt;
            </span>
          </div>
        </div>
        <div className="product-specs-price">
          <div className="product-specs">
            <p>Технические характеристики</p>
            <ul>
              {product.fullSpecs &&
                product.fullSpecs.map((spec, index) => (
                  <li key={index}>
                    <span className="product-name-property">{spec.name}:</span>{" "}
                    <span>{spec.value}</span>
                  </li>
                ))}
            </ul>
          </div>
          <div>
            <p
              className={`product-price ${
                product.discount ? "product-price-none" : ""
              }`}
            >
              {product.price} ₽
            </p>
            {product.discount && (
              <p className="product-discount-price">{product.discount} ₽</p>
            )}
          </div>
        </div>
      </div>
      <p className="description-title">Описание</p>
      <div className="product-description">
        <p>{product.description}</p>
      </div>
      <p className="description-title">Преимущества {product.name}</p>
      <div className="product-description">
        <ul>
          {product.benefits &&
            product.benefits.map((benefit, index) => (
              <li key={index}>{benefit}</li>
            ))}
        </ul>
      </div>
    </div>
  );
};

export default ProductDetails;
