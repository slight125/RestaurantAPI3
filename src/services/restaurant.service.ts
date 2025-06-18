import { db } from '../models/db';
import { restaurants, restaurantOwners, menuItems, categories, cities, states } from '../models/schema';
import { eq, and, desc, asc } from 'drizzle-orm';
import { CreateRestaurantRequest, Restaurant, PaginationQuery, PaginatedResponse } from '../types';

export class RestaurantService {
  static async createRestaurant(restaurantData: CreateRestaurantRequest, ownerId: number): Promise<Restaurant> {
    try {
      // Create restaurant
      const newRestaurant = await db
        .insert(restaurants)
        .values({
          name: restaurantData.name,
          streetAddress: restaurantData.streetAddress,
          zipCode: restaurantData.zipCode,
          cityId: restaurantData.cityId,
          phone: restaurantData.phone,
          email: restaurantData.email,
          description: restaurantData.description,
          imageUrl: restaurantData.imageUrl,
          active: true,
        })
        .returning();

      const restaurant = newRestaurant[0];

      // Assign owner to restaurant
      await db.insert(restaurantOwners).values({
        userId: ownerId,
        restaurantId: restaurant.id,
      });

      return restaurant;
    } catch (error) {
      throw error;
    }
  }

  static async getRestaurants(pagination: PaginationQuery = {}): Promise<PaginatedResponse<Restaurant & { city: string; state: string }>> {
    try {
      const page = pagination.page || 1;
      const limit = pagination.limit || 10;
      const offset = (page - 1) * limit;

      // Get restaurants with city and state information
      const restaurantsResult = await db
        .select({
          id: restaurants.id,
          name: restaurants.name,
          streetAddress: restaurants.streetAddress,
          zipCode: restaurants.zipCode,
          cityId: restaurants.cityId,
          phone: restaurants.phone,
          email: restaurants.email,
          description: restaurants.description,
          imageUrl: restaurants.imageUrl,
          active: restaurants.active,
          createdAt: restaurants.createdAt,
          updatedAt: restaurants.updatedAt,
          city: cities.name,
          state: states.name,
        })
        .from(restaurants)
        .leftJoin(cities, eq(restaurants.cityId, cities.id))
        .leftJoin(states, eq(cities.stateId, states.id))
        .where(eq(restaurants.active, true))
        .orderBy(asc(restaurants.name))
        .limit(limit)
        .offset(offset);

      // Get total count
      const totalResult = await db
        .select({ count: restaurants.id })
        .from(restaurants)
        .where(eq(restaurants.active, true));

      const total = totalResult.length;
      const totalPages = Math.ceil(total / limit);

      return {
        data: restaurantsResult,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  static async getRestaurantById(restaurantId: number): Promise<(Restaurant & { city: string; state: string }) | null> {
    try {
      const restaurantResult = await db
        .select({
          id: restaurants.id,
          name: restaurants.name,
          streetAddress: restaurants.streetAddress,
          zipCode: restaurants.zipCode,
          cityId: restaurants.cityId,
          phone: restaurants.phone,
          email: restaurants.email,
          description: restaurants.description,
          imageUrl: restaurants.imageUrl,
          active: restaurants.active,
          createdAt: restaurants.createdAt,
          updatedAt: restaurants.updatedAt,
          city: cities.name,
          state: states.name,
        })
        .from(restaurants)
        .leftJoin(cities, eq(restaurants.cityId, cities.id))
        .leftJoin(states, eq(cities.stateId, states.id))
        .where(eq(restaurants.id, restaurantId))
        .limit(1);

      if (restaurantResult.length === 0) {
        return null;
      }

      return restaurantResult[0];
    } catch (error) {
      throw error;
    }
  }

  static async updateRestaurant(restaurantId: number, updateData: Partial<Restaurant>, userId: number): Promise<Restaurant | null> {
    try {
      // Check if user owns this restaurant
      const ownershipResult = await db
        .select()
        .from(restaurantOwners)
        .where(
          and(
            eq(restaurantOwners.restaurantId, restaurantId),
            eq(restaurantOwners.userId, userId)
          )
        )
        .limit(1);

      if (ownershipResult.length === 0) {
        throw new Error('You do not have permission to update this restaurant');
      }

      const updatedRestaurant = await db
        .update(restaurants)
        .set({
          ...updateData,
          updatedAt: new Date(),
        })
        .where(eq(restaurants.id, restaurantId))
        .returning();

      if (updatedRestaurant.length === 0) {
        return null;
      }

      return updatedRestaurant[0];
    } catch (error) {
      throw error;
    }
  }

  static async deleteRestaurant(restaurantId: number, userId: number): Promise<boolean> {
    try {
      // Check if user owns this restaurant
      const ownershipResult = await db
        .select()
        .from(restaurantOwners)
        .where(
          and(
            eq(restaurantOwners.restaurantId, restaurantId),
            eq(restaurantOwners.userId, userId)
          )
        )
        .limit(1);

      if (ownershipResult.length === 0) {
        throw new Error('You do not have permission to delete this restaurant');
      }

      // Soft delete by setting active to false
      const deletedRestaurant = await db
        .update(restaurants)
        .set({
          active: false,
          updatedAt: new Date(),
        })
        .where(eq(restaurants.id, restaurantId))
        .returning();

      return deletedRestaurant.length > 0;
    } catch (error) {
      throw error;
    }
  }

  static async getRestaurantsByOwner(ownerId: number): Promise<Restaurant[]> {
    try {
      const restaurantsResult = await db
        .select({
          id: restaurants.id,
          name: restaurants.name,
          streetAddress: restaurants.streetAddress,
          zipCode: restaurants.zipCode,
          cityId: restaurants.cityId,
          phone: restaurants.phone,
          email: restaurants.email,
          description: restaurants.description,
          imageUrl: restaurants.imageUrl,
          active: restaurants.active,
          createdAt: restaurants.createdAt,
          updatedAt: restaurants.updatedAt,
        })
        .from(restaurants)
        .innerJoin(restaurantOwners, eq(restaurants.id, restaurantOwners.restaurantId))
        .where(eq(restaurantOwners.userId, ownerId))
        .orderBy(asc(restaurants.name));

      return restaurantsResult;
    } catch (error) {
      throw error;
    }
  }

  static async getRestaurantMenu(restaurantId: number): Promise<any[]> {
    try {
      const menuResult = await db
        .select({
          id: menuItems.id,
          name: menuItems.name,
          description: menuItems.description,
          ingredients: menuItems.ingredients,
          price: menuItems.price,
          imageUrl: menuItems.imageUrl,
          active: menuItems.active,
          category: categories.name,
          categoryId: categories.id,
        })
        .from(menuItems)
        .innerJoin(categories, eq(menuItems.categoryId, categories.id))
        .where(
          and(
            eq(menuItems.restaurantId, restaurantId),
            eq(menuItems.active, true)
          )
        )
        .orderBy(asc(categories.name), asc(menuItems.name));

      return menuResult;
    } catch (error) {
      throw error;
    }
  }
}

