export interface Promotion {
  id: string;
  categoryName: string;
  productId: string; // Обязательное поле
  mainImage?: string;
  productName?: string;
  companyName?: string;
  price: number;
  discount?: number;
  position?: number;
  promotionType: string;
  [key: string]: any;
}
