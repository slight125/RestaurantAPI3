import { z } from 'zod';

// Auth validation schemas
export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be less than 100 characters'),
    email: z.string().email('Invalid email format'),
    password: z.string().min(8, 'Password must be at least 8 characters').regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
    contactPhone: z.string().optional(),
    role: z.enum(['customer', 'driver', 'restaurant_owner']).optional(),
  })
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required'),
  })
});

export const verifyEmailSchema = z.object({
  body: z.object({
    userId: z.number().int().positive('User ID must be a positive integer'),
    confirmationCode: z.string().length(6, 'Confirmation code must be 6 digits'),
  })
});

export const requestPasswordResetSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format'),
  })
});

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1, 'Reset token is required'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters').regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  })
});

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be less than 100 characters').optional(),
    contactPhone: z.string().optional(),
  })
});

// Restaurant validation schemas
export const createRestaurantSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Restaurant name must be at least 2 characters').max(100, 'Restaurant name must be less than 100 characters'),
    streetAddress: z.string().min(5, 'Street address must be at least 5 characters').max(255, 'Street address must be less than 255 characters'),
    zipCode: z.string().min(5, 'Zip code must be at least 5 characters').max(10, 'Zip code must be less than 10 characters'),
    cityId: z.number().int().positive('City ID must be a positive integer'),
    phone: z.string().optional(),
    email: z.string().email('Invalid email format').optional(),
    description: z.string().optional(),
    imageUrl: z.string().url('Invalid image URL').optional(),
  })
});

export const updateRestaurantSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Restaurant name must be at least 2 characters').max(100, 'Restaurant name must be less than 100 characters').optional(),
    streetAddress: z.string().min(5, 'Street address must be at least 5 characters').max(255, 'Street address must be less than 255 characters').optional(),
    zipCode: z.string().min(5, 'Zip code must be at least 5 characters').max(10, 'Zip code must be less than 10 characters').optional(),
    cityId: z.number().int().positive('City ID must be a positive integer').optional(),
    phone: z.string().optional(),
    email: z.string().email('Invalid email format').optional(),
    description: z.string().optional(),
    imageUrl: z.string().url('Invalid image URL').optional(),
    active: z.boolean().optional(),
  })
});

// Menu Item validation schemas
export const createMenuItemSchema = z.object({
  body: z.object({
    restaurantId: z.number().int().positive('Restaurant ID must be a positive integer'),
    categoryId: z.number().int().positive('Category ID must be a positive integer'),
    name: z.string().min(2, 'Menu item name must be at least 2 characters').max(100, 'Menu item name must be less than 100 characters'),
    description: z.string().optional(),
    ingredients: z.string().optional(),
    price: z.number().positive('Price must be a positive number'),
    imageUrl: z.string().url('Invalid image URL').optional(),
  })
});

export const updateMenuItemSchema = z.object({
  body: z.object({
    categoryId: z.number().int().positive('Category ID must be a positive integer').optional(),
    name: z.string().min(2, 'Menu item name must be at least 2 characters').max(100, 'Menu item name must be less than 100 characters').optional(),
    description: z.string().optional(),
    ingredients: z.string().optional(),
    price: z.number().positive('Price must be a positive number').optional(),
    imageUrl: z.string().url('Invalid image URL').optional(),
    active: z.boolean().optional(),
  })
});

// Order validation schemas
export const createOrderSchema = z.object({
  body: z.object({
    restaurantId: z.number().int().positive('Restaurant ID must be a positive integer'),
    deliveryAddressId: z.number().int().positive('Delivery address ID must be a positive integer'),
    items: z.array(z.object({
      menuItemId: z.number().int().positive('Menu item ID must be a positive integer'),
      quantity: z.number().int().positive('Quantity must be a positive integer'),
      comment: z.string().optional(),
    })).min(1, 'Order must contain at least one item'),
    comment: z.string().optional(),
  })
});

// Address validation schemas
export const createAddressSchema = z.object({
  body: z.object({
    streetAddress1: z.string().min(5, 'Street address must be at least 5 characters').max(255, 'Street address must be less than 255 characters'),
    streetAddress2: z.string().max(255, 'Street address 2 must be less than 255 characters').optional(),
    cityId: z.number().int().positive('City ID must be a positive integer'),
    zipCode: z.string().min(5, 'Zip code must be at least 5 characters').max(10, 'Zip code must be less than 10 characters'),
    deliveryInstructions: z.string().optional(),
  })
});

export const updateAddressSchema = z.object({
  body: z.object({
    streetAddress1: z.string().min(5, 'Street address must be at least 5 characters').max(255, 'Street address must be less than 255 characters').optional(),
    streetAddress2: z.string().max(255, 'Street address 2 must be less than 255 characters').optional(),
    cityId: z.number().int().positive('City ID must be a positive integer').optional(),
    zipCode: z.string().min(5, 'Zip code must be at least 5 characters').max(10, 'Zip code must be less than 10 characters').optional(),
    deliveryInstructions: z.string().optional(),
  })
});

// Driver validation schemas
export const updateDriverSchema = z.object({
  body: z.object({
    carMake: z.string().max(50, 'Car make must be less than 50 characters').optional(),
    carModel: z.string().max(50, 'Car model must be less than 50 characters').optional(),
    carYear: z.number().int().min(1900, 'Car year must be after 1900').max(new Date().getFullYear() + 1, 'Car year cannot be in the future').optional(),
    carColor: z.string().max(30, 'Car color must be less than 30 characters').optional(),
    carPlateNumber: z.string().max(20, 'Car plate number must be less than 20 characters').optional(),
    online: z.boolean().optional(),
  })
});

// Comment validation schemas
export const createCommentSchema = z.object({
  body: z.object({
    orderId: z.number().int().positive('Order ID must be a positive integer'),
    commentText: z.string().min(1, 'Comment text is required').max(1000, 'Comment text must be less than 1000 characters'),
    isComplaint: z.boolean().optional(),
    isPraise: z.boolean().optional(),
  })
});

// Common validation schemas
export const idParamSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID must be a number').transform(Number),
  })
});

export const paginationSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/, 'Page must be a number').transform(Number).optional(),
    limit: z.string().regex(/^\d+$/, 'Limit must be a number').transform(Number).optional(),
  })
});

