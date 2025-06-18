export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  contactPhone?: string;
  phoneVerified: boolean;
  emailVerified: boolean;
  confirmationCode?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  role: 'customer' | 'driver' | 'restaurant_owner' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}

export interface Address {
  id: number;
  userId: number;
  streetAddress1: string;
  streetAddress2?: string;
  cityId: number;
  zipCode: string;
  deliveryInstructions?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Restaurant {
  id: number;
  name: string;
  streetAddress: string;
  zipCode: string;
  cityId: number;
  phone?: string;
  email?: string;
  description?: string;
  imageUrl?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MenuItem {
  id: number;
  restaurantId: number;
  categoryId: number;
  name: string;
  description?: string;
  ingredients?: string;
  price: string;
  imageUrl?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  id: number;
  restaurantId: number;
  userId: number;
  driverId?: number;
  deliveryAddressId: number;
  estimatedDeliveryTime?: Date;
  actualDeliveryTime?: Date;
  price: string;
  discount: string;
  finalPrice: string;
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Driver {
  id: number;
  userId: number;
  carMake?: string;
  carModel?: string;
  carYear?: number;
  carColor?: string;
  carPlateNumber?: string;
  online: boolean;
  delivering: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface State {
  id: number;
  name: string;
  code: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface City {
  id: number;
  name: string;
  stateId: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Comment {
  id: number;
  userId: number;
  orderId: number;
  commentText: string;
  isComplaint: boolean;
  isPraise: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface StatusCatalog {
  id: number;
  name: string;
  description?: string;
  createdAt: Date;
}

export interface OrderStatus {
  id: number;
  orderId: number;
  statusCatalogId: number;
  createdAt: Date;
}

export interface OrderMenuItem {
  id: number;
  orderId: number;
  menuItemId: number;
  quantity: number;
  itemPrice: string;
  comment?: string;
  createdAt: Date;
}

export interface RestaurantOwner {
  id: number;
  userId: number;
  restaurantId: number;
  createdAt: Date;
}

// Request/Response types
export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  contactPhone?: string;
  role?: 'customer' | 'driver' | 'restaurant_owner';
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: Omit<User, 'password'>;
  token: string;
}

export interface CreateRestaurantRequest {
  name: string;
  streetAddress: string;
  zipCode: string;
  cityId: number;
  phone?: string;
  email?: string;
  description?: string;
  imageUrl?: string;
}

export interface CreateMenuItemRequest {
  restaurantId: number;
  categoryId: number;
  name: string;
  description?: string;
  ingredients?: string;
  price: number;
  imageUrl?: string;
}

export interface CreateOrderRequest {
  restaurantId: number;
  deliveryAddressId: number;
  items: {
    menuItemId: number;
    quantity: number;
    comment?: string;
  }[];
  comment?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

