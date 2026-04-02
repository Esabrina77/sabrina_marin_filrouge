export enum Role {
  CLIENT = 'CLIENT',
  ADMIN = 'ADMIN'
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
}

export interface UserRequest {
  firstName: string;
  lastName: string;
  email: string;
  password?: string; // Optional for updates if not changing
  role?: Role;
}

export interface UserFilters {
  page?: number;
  size?: number;
  sort?: string;
  role?: Role;
  name?: string;
  search?: string;
}
