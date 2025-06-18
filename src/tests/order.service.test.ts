import { OrderService } from '../services/order.service';
import { db } from '../models/db';
import { orders, orderMenuItems, orderStatus, statusCatalog, menuItems } from '../models/schema';

// Mock the database
jest.mock('../models/db');
const mockDb = db as jest.Mocked<typeof db>;

describe('OrderService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createOrder', () => {
    it('should create order successfully with valid menu items', async () => {
      const orderData = {
        restaurantId: 1,
        deliveryAddressId: 1,
        items: [
          { menuItemId: 1, quantity: 2, comment: 'No onions' },
          { menuItemId: 2, quantity: 1 },
        ],
        comment: 'Please deliver quickly',
      };
      const userId = 1;

      const mockMenuItems = [
        { id: 1, name: 'Burger', price: '12.99', active: true },
        { id: 2, name: 'Fries', price: '4.99', active: true },
      ];

      const createdOrder = {
        id: 1,
        restaurantId: orderData.restaurantId,
        userId,
        deliveryAddressId: orderData.deliveryAddressId,
        price: '30.97', // (12.99 * 2) + (4.99 * 1)
        discount: '0.00',
        finalPrice: '30.97',
        comment: orderData.comment,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Mock menu item queries
      mockDb.select.mockImplementation(() => ({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockImplementation((id) => {
              const item = mockMenuItems.find(item => item.id === id);
              return Promise.resolve(item ? [item] : []);
            }),
          }),
        }),
      }) as any);

      // Mock order creation
      mockDb.insert.mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([createdOrder]),
        }),
      } as any);

      // Mock status catalog query
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([{ id: 1, name: 'Pending' }]),
          }),
        }),
      } as any);

      const result = await OrderService.createOrder(orderData, userId);

      expect(result).toEqual(createdOrder);
    });

    it('should throw error for non-existent menu item', async () => {
      const orderData = {
        restaurantId: 1,
        deliveryAddressId: 1,
        items: [
          { menuItemId: 999, quantity: 1 }, // Non-existent item
        ],
      };
      const userId = 1;

      // Mock menu item query returning empty array
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([]),
          }),
        }),
      } as any);

      await expect(OrderService.createOrder(orderData, userId))
        .rejects.toThrow('Menu item with ID 999 not found');
    });

    it('should throw error for inactive menu item', async () => {
      const orderData = {
        restaurantId: 1,
        deliveryAddressId: 1,
        items: [
          { menuItemId: 1, quantity: 1 },
        ],
      };
      const userId = 1;

      const inactiveMenuItem = {
        id: 1,
        name: 'Inactive Burger',
        price: '12.99',
        active: false,
      };

      // Mock menu item query returning inactive item
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([inactiveMenuItem]),
          }),
        }),
      } as any);

      await expect(OrderService.createOrder(orderData, userId))
        .rejects.toThrow('Menu item Inactive Burger is not available');
    });
  });

  describe('getOrders', () => {
    it('should return paginated orders for customer', async () => {
      const userId = 1;
      const role = 'customer';
      const pagination = { page: 1, limit: 10 };

      const mockOrders = [
        {
          id: 1,
          restaurantId: 1,
          userId,
          price: '25.99',
          restaurant: 'Test Restaurant',
          customerName: 'John Doe',
          customerEmail: 'john@example.com',
          createdAt: new Date(),
        },
      ];

      // Mock select query
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          leftJoin: jest.fn().mockReturnValue({
            leftJoin: jest.fn().mockReturnValue({
              where: jest.fn().mockReturnValue({
                orderBy: jest.fn().mockReturnValue({
                  limit: jest.fn().mockReturnValue({
                    offset: jest.fn().mockResolvedValue(mockOrders),
                  }),
                }),
              }),
            }),
          }),
        }),
      } as any);

      // Mock count query
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue(mockOrders),
        }),
      } as any);

      const result = await OrderService.getOrders(userId, role, pagination);

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('pagination');
      expect(result.data).toEqual(mockOrders);
    });
  });

  describe('getOrderById', () => {
    it('should return order with items and status history', async () => {
      const orderId = 1;
      const userId = 1;
      const role = 'customer';

      const mockOrder = {
        id: orderId,
        restaurantId: 1,
        userId,
        price: '25.99',
        restaurant: 'Test Restaurant',
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        createdAt: new Date(),
      };

      const mockOrderItems = [
        {
          id: 1,
          menuItemId: 1,
          quantity: 2,
          itemPrice: '12.99',
          menuItemName: 'Burger',
          menuItemDescription: 'Delicious burger',
        },
      ];

      const mockStatusHistory = [
        {
          id: 1,
          statusName: 'Pending',
          statusDescription: 'Order is pending',
          createdAt: new Date(),
        },
      ];

      // Mock order query
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          leftJoin: jest.fn().mockReturnValue({
            leftJoin: jest.fn().mockReturnValue({
              where: jest.fn().mockReturnValue({
                limit: jest.fn().mockResolvedValue([mockOrder]),
              }),
            }),
          }),
        }),
      } as any);

      // Mock order items query
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          leftJoin: jest.fn().mockReturnValue({
            where: jest.fn().mockResolvedValue(mockOrderItems),
          }),
        }),
      } as any);

      // Mock status history query
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          leftJoin: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              orderBy: jest.fn().mockResolvedValue(mockStatusHistory),
            }),
          }),
        }),
      } as any);

      const result = await OrderService.getOrderById(orderId, userId, role);

      expect(result).toEqual({
        ...mockOrder,
        items: mockOrderItems,
        statusHistory: mockStatusHistory,
      });
    });

    it('should return null for non-existent order', async () => {
      const orderId = 999;

      // Mock order query returning empty array
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          leftJoin: jest.fn().mockReturnValue({
            leftJoin: jest.fn().mockReturnValue({
              where: jest.fn().mockReturnValue({
                limit: jest.fn().mockResolvedValue([]),
              }),
            }),
          }),
        }),
      } as any);

      const result = await OrderService.getOrderById(orderId);

      expect(result).toBeNull();
    });

    it('should throw error when customer tries to access other user order', async () => {
      const orderId = 1;
      const userId = 2; // Different user
      const role = 'customer';

      const mockOrder = {
        id: orderId,
        userId: 1, // Order belongs to user 1
        restaurantId: 1,
        price: '25.99',
      };

      // Mock order query
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          leftJoin: jest.fn().mockReturnValue({
            leftJoin: jest.fn().mockReturnValue({
              where: jest.fn().mockReturnValue({
                limit: jest.fn().mockResolvedValue([mockOrder]),
              }),
            }),
          }),
        }),
      } as any);

      await expect(OrderService.getOrderById(orderId, userId, role))
        .rejects.toThrow('You do not have permission to view this order');
    });
  });

  describe('updateOrderStatus', () => {
    it('should update order status successfully', async () => {
      const orderId = 1;
      const statusName = 'Confirmed';

      const mockStatus = {
        id: 2,
        name: statusName,
        description: 'Order confirmed',
      };

      // Mock status catalog query
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([mockStatus]),
          }),
        }),
      } as any);

      // Mock status insertion
      mockDb.insert.mockReturnValue({
        values: jest.fn().mockResolvedValue(undefined),
      } as any);

      const result = await OrderService.updateOrderStatus(orderId, statusName);

      expect(result).toBe(true);
    });

    it('should throw error for invalid status', async () => {
      const orderId = 1;
      const statusName = 'InvalidStatus';

      // Mock status catalog query returning empty array
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([]),
          }),
        }),
      } as any);

      await expect(OrderService.updateOrderStatus(orderId, statusName))
        .rejects.toThrow(`Status '${statusName}' not found`);
    });

    it('should set actual delivery time when status is Delivered', async () => {
      const orderId = 1;
      const statusName = 'Delivered';

      const mockStatus = {
        id: 7,
        name: statusName,
        description: 'Order delivered',
      };

      // Mock status catalog query
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([mockStatus]),
          }),
        }),
      } as any);

      // Mock status insertion
      mockDb.insert.mockReturnValue({
        values: jest.fn().mockResolvedValue(undefined),
      } as any);

      // Mock order update
      mockDb.update.mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue(undefined),
        }),
      } as any);

      const result = await OrderService.updateOrderStatus(orderId, statusName);

      expect(result).toBe(true);
    });
  });

  describe('cancelOrder', () => {
    it('should cancel order successfully when user owns it', async () => {
      const orderId = 1;
      const userId = 1;
      const role = 'customer';

      const mockOrder = {
        id: orderId,
        userId,
        restaurantId: 1,
        driverId: null,
      };

      // Mock order query
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([mockOrder]),
          }),
        }),
      } as any);

      // Mock status catalog query for 'Cancelled'
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([{ id: 8, name: 'Cancelled' }]),
          }),
        }),
      } as any);

      // Mock status insertion
      mockDb.insert.mockReturnValue({
        values: jest.fn().mockResolvedValue(undefined),
      } as any);

      const result = await OrderService.cancelOrder(orderId, userId, role);

      expect(result).toBe(true);
    });

    it('should return false for non-existent order', async () => {
      const orderId = 999;
      const userId = 1;
      const role = 'customer';

      // Mock order query returning empty array
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([]),
          }),
        }),
      } as any);

      const result = await OrderService.cancelOrder(orderId, userId, role);

      expect(result).toBe(false);
    });

    it('should throw error when customer tries to cancel other user order', async () => {
      const orderId = 1;
      const userId = 2; // Different user
      const role = 'customer';

      const mockOrder = {
        id: orderId,
        userId: 1, // Order belongs to user 1
        restaurantId: 1,
      };

      // Mock order query
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([mockOrder]),
          }),
        }),
      } as any);

      await expect(OrderService.cancelOrder(orderId, userId, role))
        .rejects.toThrow('You do not have permission to cancel this order');
    });
  });
});

