import { db } from '../models/db';
import { menuItems, categories, restaurants, restaurantOwners } from '../models/schema';
import { eq, and, asc } from 'drizzle-orm';
import { CreateMenuItemRequest, MenuItem, PaginationQuery, PaginatedResponse } from '../types';

export class MenuItemService {
  static async createMenuItem(menuItemData: CreateMenuItemRequest, userId: number): Promise<MenuItem> {
    try {
      // Check if user owns the restaurant
      const ownershipResult = await db
        .select()
        .from(restaurantOwners)
        .where(
          and(
            eq(restaurantOwners.restaurantId, menuItemData.restaurantId),
            eq(restaurantOwners.userId, userId)
          )
        )
        .limit(1);

      if (ownershipResult.length === 0) {
        throw new Error('You do not have permission to add menu items to this restaurant');
      }

      const newMenuItem = await db
        .insert(menuItems)
        .values({
          restaurantId: menuItemData.restaurantId,
          categoryId: menuItemData.categoryId,
          name: menuItemData.name,
          description: menuItemData.description,
          ingredients: menuItemData.ingredients,
          price: menuItemData.price.toString(),
          imageUrl: menuItemData.imageUrl,
          active: true,
        })
        .returning();

      return newMenuItem[0];
    } catch (error) {
      throw error;
    }
  }

  static async getMenuItems(restaurantId?: number, pagination: PaginationQuery = {}): Promise<PaginatedResponse<MenuItem & { category: string; restaurant: string }>> {
    try {
      const page = pagination.page || 1;
      const limit = pagination.limit || 10;
      const offset = (page - 1) * limit;

      let query = db
        .select({
          id: menuItems.id,
          restaurantId: menuItems.restaurantId,
          categoryId: menuItems.categoryId,
          name: menuItems.name,
          description: menuItems.description,
          ingredients: menuItems.ingredients,
          price: menuItems.price,
          imageUrl: menuItems.imageUrl,
          active: menuItems.active,
          createdAt: menuItems.createdAt,
          updatedAt: menuItems.updatedAt,
          category: categories.name,
          restaurant: restaurants.name,
        })
        .from(menuItems)
        .leftJoin(categories, eq(menuItems.categoryId, categories.id))
        .leftJoin(restaurants, eq(menuItems.restaurantId, restaurants.id))
        .where(eq(menuItems.active, true));

      if (restaurantId) {
        query = query.where(
          and(
            eq(menuItems.active, true),
            eq(menuItems.restaurantId, restaurantId)
          )
        );
      }

      const menuItemsResult = await query
        .orderBy(asc(categories.name), asc(menuItems.name))
        .limit(limit)
        .offset(offset);

      // Get total count
      let countQuery = db
        .select({ count: menuItems.id })
        .from(menuItems)
        .where(eq(menuItems.active, true));

      if (restaurantId) {
        countQuery = countQuery.where(
          and(
            eq(menuItems.active, true),
            eq(menuItems.restaurantId, restaurantId)
          )
        );
      }

      const totalResult = await countQuery;
      const total = totalResult.length;
      const totalPages = Math.ceil(total / limit);

      return {
        data: menuItemsResult,
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

  static async getMenuItemById(menuItemId: number): Promise<(MenuItem & { category: string; restaurant: string }) | null> {
    try {
      const menuItemResult = await db
        .select({
          id: menuItems.id,
          restaurantId: menuItems.restaurantId,
          categoryId: menuItems.categoryId,
          name: menuItems.name,
          description: menuItems.description,
          ingredients: menuItems.ingredients,
          price: menuItems.price,
          imageUrl: menuItems.imageUrl,
          active: menuItems.active,
          createdAt: menuItems.createdAt,
          updatedAt: menuItems.updatedAt,
          category: categories.name,
          restaurant: restaurants.name,
        })
        .from(menuItems)
        .leftJoin(categories, eq(menuItems.categoryId, categories.id))
        .leftJoin(restaurants, eq(menuItems.restaurantId, restaurants.id))
        .where(eq(menuItems.id, menuItemId))
        .limit(1);

      if (menuItemResult.length === 0) {
        return null;
      }

      return menuItemResult[0];
    } catch (error) {
      throw error;
    }
  }

  static async updateMenuItem(menuItemId: number, updateData: Partial<MenuItem>, userId: number): Promise<MenuItem | null> {
    try {
      // Get menu item to check restaurant ownership
      const menuItem = await db
        .select()
        .from(menuItems)
        .where(eq(menuItems.id, menuItemId))
        .limit(1);

      if (menuItem.length === 0) {
        return null;
      }

      // Check if user owns the restaurant
      const ownershipResult = await db
        .select()
        .from(restaurantOwners)
        .where(
          and(
            eq(restaurantOwners.restaurantId, menuItem[0].restaurantId),
            eq(restaurantOwners.userId, userId)
          )
        )
        .limit(1);

      if (ownershipResult.length === 0) {
        throw new Error('You do not have permission to update this menu item');
      }

      const updatedMenuItem = await db
        .update(menuItems)
        .set({
          ...updateData,
          updatedAt: new Date(),
        })
        .where(eq(menuItems.id, menuItemId))
        .returning();

      if (updatedMenuItem.length === 0) {
        return null;
      }

      return updatedMenuItem[0];
    } catch (error) {
      throw error;
    }
  }

  static async deleteMenuItem(menuItemId: number, userId: number): Promise<boolean> {
    try {
      // Get menu item to check restaurant ownership
      const menuItem = await db
        .select()
        .from(menuItems)
        .where(eq(menuItems.id, menuItemId))
        .limit(1);

      if (menuItem.length === 0) {
        return false;
      }

      // Check if user owns the restaurant
      const ownershipResult = await db
        .select()
        .from(restaurantOwners)
        .where(
          and(
            eq(restaurantOwners.restaurantId, menuItem[0].restaurantId),
            eq(restaurantOwners.userId, userId)
          )
        )
        .limit(1);

      if (ownershipResult.length === 0) {
        throw new Error('You do not have permission to delete this menu item');
      }

      // Soft delete by setting active to false
      const deletedMenuItem = await db
        .update(menuItems)
        .set({
          active: false,
          updatedAt: new Date(),
        })
        .where(eq(menuItems.id, menuItemId))
        .returning();

      return deletedMenuItem.length > 0;
    } catch (error) {
      throw error;
    }
  }

  static async getMenuItemsByCategory(categoryId: number, restaurantId?: number): Promise<MenuItem[]> {
    try {
      let query = db
        .select()
        .from(menuItems)
        .where(
          and(
            eq(menuItems.categoryId, categoryId),
            eq(menuItems.active, true)
          )
        );

      if (restaurantId) {
        query = query.where(
          and(
            eq(menuItems.categoryId, categoryId),
            eq(menuItems.active, true),
            eq(menuItems.restaurantId, restaurantId)
          )
        );
      }

      const menuItemsResult = await query.orderBy(asc(menuItems.name));

      return menuItemsResult;
    } catch (error) {
      throw error;
    }
  }
}

