import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import ListEditing from '../components/listEditing/listEditing.jsx'

const DeleteProduct = () => {
  const [productName, setProductName] = useState('')
  const [filteredProducts, setFilteredProducts] = useState([])
  const [products, setProducts] = useState([])
  const [selectedProduct, setSelectedProduct] = useState(null)

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Ошибка при загрузке товаров:', error)
      return
    }

    setProducts(data)
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const handleProductSearch = (input) => {
    setProductName(input)
    setSelectedProduct(null)

    if (input === '') {
      setFilteredProducts([])
      return
    }

    const lowerInput = input.toLowerCase()

    const filtered = products.filter(
      (product) =>
        product.name?.toLowerCase().includes(lowerInput) ||
        product.company_name?.toLowerCase().includes(lowerInput)
    )

    setFilteredProducts(filtered)
  }

  const handleProductSelect = (product) => {
    setProductName(`${product.company_name || ''} ${product.name || ''}`)
    setSelectedProduct(product)
    setFilteredProducts([])
  }

  const handleDeleteProduct = async () => {
    if (!selectedProduct) return

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', selectedProduct.id)

      if (error) {
        throw error
      }

      setProductName('')
      setFilteredProducts([])
      setSelectedProduct(null)

      await fetchProducts()

      alert('Товар успешно удален')
    } catch (error) {
      console.error('Ошибка при удалении товара:', error)
    }
  }

  return (
    <div className="flex">
      <ListEditing />
      <div className="editing">
        <p className="title top">Удаление товара</p>
        <div className="list-editing">
          <input
            className="z"
            type="text"
            placeholder="Название товара или компании"
            value={productName}
            onChange={(e) => handleProductSearch(e.target.value)}
          />
          {filteredProducts.length > 0 && (
            <ul className="product-list">
              {filteredProducts.map((product) => (
                <li
                  key={product.id}
                  onClick={() => handleProductSelect(product)}
                  className="product-list-item"
                >
                  {product.company_name} {product.name}
                </li>
              ))}
            </ul>
          )}
        </div>
        <button
          className="button-editing"
          onClick={handleDeleteProduct}
          disabled={!selectedProduct}
        >
          Удалить товар
        </button>
      </div>
    </div>
  )
}

export default DeleteProduct
