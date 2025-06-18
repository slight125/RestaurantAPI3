import { db } from '../models/db';
import { 
  orders, 
  orderMenuItems, 
  orderStatus, 
  statusCatalog, 
  menuItems, 
  restaurants, 
  addresses,
  users,
  drivers
} from '../models/schema';
import { eq, and, desc, asc } from 'drizzle-orm';
import { CreateOrderRequest, Order, PaginationQuery, PaginatedResponse } from '../types';

export class OrderService {
  static async createOrder(orderData: CreateOrderRequest, userId: number): Promise<Order> {
    try {
      // Calculate total price
      let totalPrice = 0;
      const orderItems = [];

      for (const item of orderData.items) {
        const menuItem = await db
          .select()
          .from(menuItems)
          .where(eq(menuItems.id, item.menuItemId))
          .limit(1);

        if (menuItem.length === 0) {
          throw new Error(`Menu item with ID ${item.menuItemId} not found`);
        }

        if (!menuItem[0].active) {
          throw new Error(`Menu item ${menuItem[0].name} is not available`);
        }

        const itemPrice = parseFloat(menuItem[0].price);
        const itemTotal = itemPrice * item.quantity;
        totalPrice += itemTotal;

        orderItems.push({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          itemPrice: itemPrice.toString(),
          comment: item.comment,
        });
      }

      // Create order
      const newOrder = await db
        .insert(orders)
        .values({
          restaurantId: orderData.restaurantId,
          userId: userId,
          deliveryAddressId: orderData.deliveryAddressId,
          price: totalPrice.toString(),
          discount: '0.00',
          finalPrice: totalPrice.toString(),
          comment: orderData.comment,
          estimatedDeliveryTime: new Date(Date.now() + 45 * 60 * 1000), // 45 minutes from now
        })
        .returning();

      const order = newOrder[0];

      // Create order menu items
      for (const item of orderItems) {
        await db.insert(orderMenuItems).values({
          orderId: order.id,
          ...item,
        });
      }

      // Set initial order status to 'Pending'
      const pendingStatus = await db
        .select()
        .from(statusCatalog)
        .where(eq(statusCatalog.name, 'Pending'))
        .limit(1);

      if (pendingStatus.length > 0) {
        await db.insert(orderStatus).values({
          orderId: order.id,
          statusCatalogId: pendingStatus[0].id,
        });
      }

      return order;
    } catch (error) {
      throw error;
    }
  }

  static async getOrders(userId?: number, role?: string, pagination: PaginationQuery = {}): Promise<PaginatedResponse<any>> {
    try {
      const page = pagination.page || 1;
      const limit = pagination.limit || 10;
      const offset = (page - 1) * limit;

      let query = db
        .select({
          id: orders.id,
          restaurantId: orders.restaurantId,
          userId: orders.userId,
          driverId: orders.driverId,
          deliveryAddressId: orders.deliveryAddressId,
          estimatedDeliveryTime: orders.estimatedDeliveryTime,
          actualDeliveryTime: orders.actualDeliveryTime,
          price: orders.price,
          discount: orders.discount,
          finalPrice: orders.finalPrice,
          comment: orders.comment,
          createdAt: orders.createdAt,
          updatedAt: orders.updatedAt,
          restaurant: restaurants.name,
          customerName: users.name,
          customerEmail: users.email,
        })
        .from(orders)
        .leftJoin(restaurants, eq(orders.restaurantId, restaurants.id))
        .leftJoin(users, eq(orders.userId, users.id));

      // Filter based on user role
      if (role === 'customer' && userId) {
        query = query.where(eq(orders.userId, userId));
      } else if (role === 'driver' && userId) {
        query = query.where(eq(orders.driverId, userId));
      }

      const ordersResult = await query
        .orderBy(desc(orders.createdAt))
        .limit(limit)
        .offset(offset);

      // Get total count
      let countQuery = db.select({ count: orders.id }).from(orders);
      
      if (role === 'customer' && userId) {
        countQuery = countQuery.where(eq(orders.userId, userId));
      } else if (role === 'driver' && userId) {
        countQuery = countQuery.where(eq(orders.driverId, userId));
      }

      const totalResult = await countQuery;
      const total = totalResult.length;
      const totalPages = Math.ceil(total / limit);

      return {
        data: ordersResult,
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

  static async getOrderById(orderId: number, userId?: number, role?: string): Promise<any | null> {
    try {
      let query = db
        .select({
          id: orders.id,
          restaurantId: orders.restaurantId,
          userId: orders.userId,
          driverId: orders.driverId,
          deliveryAddressId: orders.deliveryAddressId,
          estimatedDeliveryTime: orders.estimatedDeliveryTime,
          actualDeliveryTime: orders.actualDeliveryTime,
          price: orders.price,
          discount: orders.discount,
          finalPrice: orders.finalPrice,
          comment: orders.comment,
          createdAt: orders.createdAt,
          updatedAt: orders.updatedAt,
          restaurant: restaurants.name,
          customerName: users.name,
          customerEmail: users.email,
        })
        .from(orders)
        .leftJoin(restaurants, eq(orders.restaurantId, restaurants.id))
        .leftJoin(users, eq(orders.userId, users.id))
        .where(eq(orders.id, orderId));

      const orderResult = await query.limit(1);

      if (orderResult.length === 0) {
        return null;
      }

      const order = orderResult[0];

      // Check permissions
      if (role === 'customer' && userId && order.userId !== userId) {
        throw new Error('You do not have permission to view this order');
      }

      if (role === 'driver' && userId && order.driverId !== userId) {
        throw new Error('You do not have permission to view this order');
      }

      // Get order items
      const orderItemsResult = await db
        .select({
          id: orderMenuItems.id,
          menuItemId: orderMenuItems.menuItemId,
          quantity: orderMenuItems.quantity,
          itemPrice: orderMenuItems.itemPrice,
          comment: orderMenuItems.comment,
          menuItemName: menuItems.name,
          menuItemDescription: menuItems.description,
        })
        .from(orderMenuItems)
        .leftJoin(menuItems, eq(orderMenuItems.menuItemId, menuItems.id))
        .where(eq(orderMenuItems.orderId, orderId));

      // Get order status history
      const statusHistory = await db
        .select({
          id: orderStatus.id,
          statusName: statusCatalog.name,
          statusDescription: statusCatalog.description,
          createdAt: orderStatus.createdAt,
        })
        .from(orderStatus)
        .leftJoin(statusCatalog, eq(orderStatus.statusCatalogId, statusCatalog.id))
        .where(eq(orderStatus.orderId, orderId))
        .orderBy(desc(orderStatus.createdAt));

      return {
        ...order,
        items: orderItemsResult,
        statusHistory,
      };
    } catch (error) {
      throw error;
    }
  }

  static async updateOrderStatus(orderId: number, statusName: string, userId?: number): Promise<boolean> {
    try {
      // Get status catalog entry
      const status = await db
        .select()
        .from(statusCatalog)
        .where(eq(statusCatalog.name, statusName))
        .limit(1);

      if (status.length === 0) {
        throw new Error(`Status '${statusName}' not found`);
      }

      // Add new status entry
      await db.insert(orderStatus).values({
        orderId: orderId,
        statusCatalogId: status[0].id,
      });

      // If status is 'Delivered', set actual delivery time
      if (statusName === 'Delivered') {
        await db
          .update(orders)
          .set({
            actualDeliveryTime: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(orders.id, orderId));
      }

      return true;
    } catch (error) {
      throw error;
    }
  }

  static async assignDriver(orderId: number, driverId: number): Promise<boolean> {
    try {
      // Check if driver exists and is available
      const driver = await db
        .select()
        .from(drivers)
        .where(
          and(
            eq(drivers.userId, driverId),
            eq(drivers.online, true),
            eq(drivers.delivering, false)
          )
        )
        .limit(1);

      if (driver.length === 0) {
        throw new Error('Driver not found or not available');
      }

      // Assign driver to order
      await db
        .update(orders)
        .set({
          driverId: driver[0].id,
          updatedAt: new Date(),
        })
        .where(eq(orders.id, orderId));

      // Update driver status
      await db
        .update(drivers)
        .set({
          delivering: true,
          updatedAt: new Date(),
        })
        .where(eq(drivers.id, driver[0].id));

      // Update order status to 'Picked Up'
      await this.updateOrderStatus(orderId, 'Picked Up');

      return true;
    } catch (error) {
      throw error;
    }
  }

  static async cancelOrder(orderId: number, userId: number, role: string): Promise<boolean> {
    try {
      // Get order to check permissions
      const order = await db
        .select()
        .from(orders)
        .where(eq(orders.id, orderId))
        .limit(1);

      if (order.length === 0) {
        return false;
      }

      // Check permissions
      if (role === 'customer' && order[0].userId !== userId) {
        throw new Error('You do not have permission to cancel this order');
      }

      // Update order status to 'Cancelled'
      await this.updateOrderStatus(orderId, 'Cancelled');

      // If driver was assigned, make them available again
      if (order[0].driverId) {
        await db
          .update(drivers)
          .set({
            delivering: false,
            updatedAt: new Date(),
          })
          .where(eq(drivers.id, order[0].driverId));
      }

      return true;
    } catch (error) {
      throw error;
    }
  }
}

