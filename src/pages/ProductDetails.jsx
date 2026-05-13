import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useParams } from 'react-router-dom'
import '../styles/ProductDetails.css'
import Breadcrumb from '../components/UI/BreadCrumb.jsx'
import FavoriteButton from '../components/UI/FavoriteButton.jsx'

const ProductDetails = () => {
  const { productId } = useParams()
  const [product, setProduct] = useState(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [visibleThumbnailsStart, setVisibleThumbnailsStart] = useState(0)

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) return

      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', productId)
          .single()

        if (error) {
          console.error('Ошибка при получении данных товара:', error)
          return
        }

        setProduct(data)
      } catch (error) {
        console.error('Ошибка при получении данных товара: ', error)
      }
    }

    fetchProduct()
  }, [productId])

  if (!product) return <p>Загрузка...</p>

  const productImages = product.images || []
  const THUMBNAILS_VISIBLE_COUNT = 3

  const showNextImage = () => {
    if (productImages.length === 0) return

    const newIndex = (selectedImageIndex + 1) % productImages.length
    setSelectedImageIndex(newIndex)
    ensureThumbnailVisible(newIndex)
  }

  const showPreviousImage = () => {
    if (productImages.length === 0) return

    const newIndex =
      (selectedImageIndex - 1 + productImages.length) % productImages.length

    setSelectedImageIndex(newIndex)
    ensureThumbnailVisible(newIndex)
  }

  const scrollThumbnailsDown = () => {
    if (productImages.length === 0) return

    setVisibleThumbnailsStart(
      (prevStart) => (prevStart + 1) % productImages.length
    )
  }

  const scrollThumbnailsUp = () => {
    if (productImages.length === 0) return

    setVisibleThumbnailsStart(
      (prevStart) =>
        (prevStart - 1 + productImages.length) % productImages.length
    )
  }
  const ensureThumbnailVisible = (index) => {
    if (
      index < visibleThumbnailsStart ||
      index >= visibleThumbnailsStart + THUMBNAILS_VISIBLE_COUNT
    ) {
      setVisibleThumbnailsStart(index)
    }
  }
  return (
    <div className="product-details">
      <FavoriteButton productId={product.id} />
      <Breadcrumb
        categoryName={product.category_name}
        companyName={product.company_name}
      />
      <p className="product-name">
        {product.company_name} {product.name}
      </p>
      <div className="product">
        <div className="images-container">
          <div className="thumbnail-column">
            <button
              className="arrow-button up-arrow"
              onClick={scrollThumbnailsUp}
              disabled={productImages.length <= THUMBNAILS_VISIBLE_COUNT}
            >
              <span>&gt;</span>
            </button>
            {productImages.length > 0 &&
              Array.from(
                {
                  length: Math.min(
                    THUMBNAILS_VISIBLE_COUNT,
                    productImages.length
                  ),
                },
                (_, i) => {
                  const thumbnailIndex =
                    (visibleThumbnailsStart + i) % productImages.length

                  return (
                    <img
                      key={thumbnailIndex}
                      src={productImages[thumbnailIndex]}
                      alt={`${product.name} thumbnail`}
                      className={`thumbnail ${
                        selectedImageIndex === thumbnailIndex
                          ? 'selected-thumbnail'
                          : ''
                      }`}
                      onClick={() => setSelectedImageIndex(thumbnailIndex)}
                    />
                  )
                }
              )}
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
              {productImages.length > 0 && (
                <img
                  className="main-image"
                  src={productImages[selectedImageIndex]}
                  alt={`${product.name} main`}
                />
              )}
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
              {product.full_specs &&
                product.full_specs.map((spec, index) => (
                  <li key={index}>
                    <span className="product-name-property">{spec.name}:</span>{' '}
                    <span>{spec.value}</span>
                  </li>
                ))}
            </ul>
          </div>
          <div>
            <p
              className={`product-price ${
                product.discount ? 'product-price-none' : ''
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
  )
}

export default ProductDetails
