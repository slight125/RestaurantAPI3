import { pgTable, serial, varchar, text, timestamp, boolean, integer, decimal, uuid } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// States table
export const states = pgTable('states', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  code: varchar('code', { length: 2 }).notNull().unique(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Cities table
export const cities = pgTable('cities', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  stateId: integer('state_id').references(() => states.id).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  contactPhone: varchar('contact_phone', { length: 20 }),
  phoneVerified: boolean('phone_verified').default(false),
  emailVerified: boolean('email_verified').default(false),
  confirmationCode: varchar('confirmation_code', { length: 6 }),
  passwordResetToken: varchar('password_reset_token', { length: 255 }),
  passwordResetExpires: timestamp('password_reset_expires'),
  role: varchar('role', { length: 20 }).default('customer'), // customer, driver, restaurant_owner, admin
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Address table
export const addresses = pgTable('addresses', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  streetAddress1: varchar('street_address_1', { length: 255 }).notNull(),
  streetAddress2: varchar('street_address_2', { length: 255 }),
  cityId: integer('city_id').references(() => cities.id).notNull(),
  zipCode: varchar('zip_code', { length: 10 }).notNull(),
  deliveryInstructions: text('delivery_instructions'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Restaurants table
export const restaurants = pgTable('restaurants', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  streetAddress: varchar('street_address', { length: 255 }).notNull(),
  zipCode: varchar('zip_code', { length: 10 }).notNull(),
  cityId: integer('city_id').references(() => cities.id).notNull(),
  phone: varchar('phone', { length: 20 }),
  email: varchar('email', { length: 255 }),
  description: text('description'),
  imageUrl: varchar('image_url', { length: 500 }),
  active: boolean('active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Restaurant Owners table (junction table)
export const restaurantOwners = pgTable('restaurant_owners', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  restaurantId: integer('restaurant_id').references(() => restaurants.id).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Categories table
export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Menu Items table
export const menuItems = pgTable('menu_items', {
  id: serial('id').primaryKey(),
  restaurantId: integer('restaurant_id').references(() => restaurants.id).notNull(),
  categoryId: integer('category_id').references(() => categories.id).notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  ingredients: text('ingredients'),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  imageUrl: varchar('image_url', { length: 500 }),
  active: boolean('active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Drivers table
export const drivers = pgTable('drivers', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  carMake: varchar('car_make', { length: 50 }),
  carModel: varchar('car_model', { length: 50 }),
  carYear: integer('car_year'),
  carColor: varchar('car_color', { length: 30 }),
  carPlateNumber: varchar('car_plate_number', { length: 20 }),
  online: boolean('online').default(false),
  delivering: boolean('delivering').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Status Catalog table
export const statusCatalog = pgTable('status_catalog', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 50 }).notNull().unique(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Orders table
export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  restaurantId: integer('restaurant_id').references(() => restaurants.id).notNull(),
  userId: integer('user_id').references(() => users.id).notNull(),
  driverId: integer('driver_id').references(() => drivers.id),
  deliveryAddressId: integer('delivery_address_id').references(() => addresses.id).notNull(),
  estimatedDeliveryTime: timestamp('estimated_delivery_time'),
  actualDeliveryTime: timestamp('actual_delivery_time'),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  discount: decimal('discount', { precision: 10, scale: 2 }).default('0.00'),
  finalPrice: decimal('final_price', { precision: 10, scale: 2 }).notNull(),
  comment: text('comment'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Order Menu Items table (junction table)
export const orderMenuItems = pgTable('order_menu_items', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').references(() => orders.id).notNull(),
  menuItemId: integer('menu_item_id').references(() => menuItems.id).notNull(),
  quantity: integer('quantity').notNull().default(1),
  itemPrice: decimal('item_price', { precision: 10, scale: 2 }).notNull(),
  comment: text('comment'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Order Status table
export const orderStatus = pgTable('order_status', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').references(() => orders.id).notNull(),
  statusCatalogId: integer('status_catalog_id').references(() => statusCatalog.id).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Comments table
export const comments = pgTable('comments', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  orderId: integer('order_id').references(() => orders.id).notNull(),
  commentText: text('comment_text').notNull(),
  isComplaint: boolean('is_complaint').default(false),
  isPraise: boolean('is_praise').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Relations
export const statesRelations = relations(states, ({ many }) => ({
  cities: many(cities),
}));

export const citiesRelations = relations(cities, ({ one, many }) => ({
  state: one(states, {
    fields: [cities.stateId],
    references: [states.id],
  }),
  addresses: many(addresses),
  restaurants: many(restaurants),
}));

export const usersRelations = relations(users, ({ many }) => ({
  addresses: many(addresses),
  orders: many(orders),
  comments: many(comments),
  restaurantOwners: many(restaurantOwners),
  drivers: many(drivers),
}));

export const addressesRelations = relations(addresses, ({ one, many }) => ({
  user: one(users, {
    fields: [addresses.userId],
    references: [users.id],
  }),
  city: one(cities, {
    fields: [addresses.cityId],
    references: [cities.id],
  }),
  orders: many(orders),
}));

export const restaurantsRelations = relations(restaurants, ({ one, many }) => ({
  city: one(cities, {
    fields: [restaurants.cityId],
    references: [cities.id],
  }),
  menuItems: many(menuItems),
  orders: many(orders),
  restaurantOwners: many(restaurantOwners),
}));

export const restaurantOwnersRelations = relations(restaurantOwners, ({ one }) => ({
  user: one(users, {
    fields: [restaurantOwners.userId],
    references: [users.id],
  }),
  restaurant: one(restaurants, {
    fields: [restaurantOwners.restaurantId],
    references: [restaurants.id],
  }),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  menuItems: many(menuItems),
}));

export const menuItemsRelations = relations(menuItems, ({ one, many }) => ({
  restaurant: one(restaurants, {
    fields: [menuItems.restaurantId],
    references: [restaurants.id],
  }),
  category: one(categories, {
    fields: [menuItems.categoryId],
    references: [categories.id],
  }),
  orderMenuItems: many(orderMenuItems),
}));

export const driversRelations = relations(drivers, ({ one, many }) => ({
  user: one(users, {
    fields: [drivers.userId],
    references: [users.id],
  }),
  orders: many(orders),
}));

export const statusCatalogRelations = relations(statusCatalog, ({ many }) => ({
  orderStatus: many(orderStatus),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  restaurant: one(restaurants, {
    fields: [orders.restaurantId],
    references: [restaurants.id],
  }),
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  driver: one(drivers, {
    fields: [orders.driverId],
    references: [drivers.id],
  }),
  deliveryAddress: one(addresses, {
    fields: [orders.deliveryAddressId],
    references: [addresses.id],
  }),
  orderMenuItems: many(orderMenuItems),
  orderStatus: many(orderStatus),
  comments: many(comments),
}));

export const orderMenuItemsRelations = relations(orderMenuItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderMenuItems.orderId],
    references: [orders.id],
  }),
  menuItem: one(menuItems, {
    fields: [orderMenuItems.menuItemId],
    references: [menuItems.id],
  }),
}));

export const orderStatusRelations = relations(orderStatus, ({ one }) => ({
  order: one(orders, {
    fields: [orderStatus.orderId],
    references: [orders.id],
  }),
  statusCatalog: one(statusCatalog, {
    fields: [orderStatus.statusCatalogId],
    references: [statusCatalog.id],
  }),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  user: one(users, {
    fields: [comments.userId],
    references: [users.id],
  }),
  order: one(orders, {
    fields: [comments.orderId],
    references: [orders.id],
  }),
}));

