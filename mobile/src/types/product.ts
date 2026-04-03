export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    imgUrl: string;
    category: string;
    available: boolean;
    quantity: number;
}

export interface Category {
    id: string;
    name: string;
    slug: string;
}

export interface PagedResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
}
