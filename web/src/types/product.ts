export enum Category {
  ENTREE = 'ENTREE',
  PLAT = 'PLAT',
  DESSERT = 'DESSERT'
}

export enum Allergen {
  GLUTEN = 'GLUTEN',
  LACTOSE = 'LACTOSE',
  ARACHIDES = 'ARACHIDES',
  AUCUN = 'AUCUN'
}

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  imgUrl: string;
  category: Category;
  allergen: Allergen;
  quantity: number;
  available: boolean;
}

export interface CreateProductRequest {
  name: string;
  price: number;
  description: string;
  imgUrl: string;
  category: Category;
  allergen: Allergen;
  quantity: number;
  available?: boolean;
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {}

export interface StockUpdateRequest {
  quantity: number;
}

export interface PagedResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface ProductFilters {
  name?: string;
  category?: Category;
  excludedAllergen?: Allergen;
  minPrice?: number;
  maxPrice?: number;
  onlyAvailable?: boolean;
  page?: number;
  size?: number;
  sort?: string;
}
