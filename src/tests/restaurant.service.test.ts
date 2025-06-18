import { RestaurantService } from '../services/restaurant.service';
import { db } from '../models/db';
import { restaurants, restaurantOwners, cities, states } from '../models/schema';

// Mock the database
jest.mock('../models/db');
const mockDb = db as jest.Mocked<typeof db>;

describe('RestaurantService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createRestaurant', () => {
    it('should create a restaurant successfully', async () => {
      const restaurantData = {
        name: 'Test Restaurant',
        streetAddress: '123 Main St',
        zipCode: '12345',
        cityId: 1,
        phone: '555-1234',
        email: 'test@restaurant.com',
        description: 'A test restaurant',
      };
      const ownerId = 1;

      const createdRestaurant = {
        id: 1,
        ...restaurantData,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Mock restaurant creation
      mockDb.insert.mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([createdRestaurant]),
        }),
      } as any);

      // Mock owner assignment
      mockDb.insert.mockReturnValue({
        values: jest.fn().mockResolvedValue(undefined),
      } as any);

      const result = await RestaurantService.createRestaurant(restaurantData, ownerId);

      expect(result).toEqual(createdRestaurant);
    });
  });

  describe('getRestaurants', () => {
    it('should return paginated restaurants with city and state info', async () => {
      const mockRestaurants = [
        {
          id: 1,
          name: 'Restaurant 1',
          streetAddress: '123 Main St',
          zipCode: '12345',
          cityId: 1,
          active: true,
          city: 'New York',
          state: 'New York',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          name: 'Restaurant 2',
          streetAddress: '456 Oak Ave',
          zipCode: '67890',
          cityId: 2,
          active: true,
          city: 'Los Angeles',
          state: 'California',
          createdAt: new Date(),
          updatedAt: new Date(),
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
                    offset: jest.fn().mockResolvedValue(mockRestaurants),
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
          where: jest.fn().mockResolvedValue(mockRestaurants),
        }),
      } as any);

      const result = await RestaurantService.getRestaurants({ page: 1, limit: 10 });

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('pagination');
      expect(result.data).toEqual(mockRestaurants);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(10);
    });
  });

  describe('getRestaurantById', () => {
    it('should return restaurant with city and state info', async () => {
      const restaurantId = 1;
      const mockRestaurant = {
        id: restaurantId,
        name: 'Test Restaurant',
        streetAddress: '123 Main St',
        zipCode: '12345',
        cityId: 1,
        active: true,
        city: 'New York',
        state: 'New York',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Mock select query
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          leftJoin: jest.fn().mockReturnValue({
            leftJoin: jest.fn().mockReturnValue({
              where: jest.fn().mockReturnValue({
                limit: jest.fn().mockResolvedValue([mockRestaurant]),
              }),
            }),
          }),
        }),
      } as any);

      const result = await RestaurantService.getRestaurantById(restaurantId);

      expect(result).toEqual(mockRestaurant);
    });

    it('should return null if restaurant not found', async () => {
      const restaurantId = 999;

      // Mock select query returning empty array
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

      const result = await RestaurantService.getRestaurantById(restaurantId);

      expect(result).toBeNull();
    });
  });

  describe('updateRestaurant', () => {
    it('should update restaurant successfully when user owns it', async () => {
      const restaurantId = 1;
      const userId = 1;
      const updateData = { name: 'Updated Restaurant Name' };

      const updatedRestaurant = {
        id: restaurantId,
        name: updateData.name,
        streetAddress: '123 Main St',
        zipCode: '12345',
        cityId: 1,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Mock ownership check
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([{ userId, restaurantId }]),
          }),
        }),
      } as any);

      // Mock update operation
      mockDb.update.mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([updatedRestaurant]),
          }),
        }),
      } as any);

      const result = await RestaurantService.updateRestaurant(restaurantId, updateData, userId);

      expect(result).toEqual(updatedRestaurant);
    });

    it('should throw error when user does not own restaurant', async () => {
      const restaurantId = 1;
      const userId = 2; // Different user
      const updateData = { name: 'Updated Restaurant Name' };

      // Mock ownership check returning empty array
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([]),
          }),
        }),
      } as any);

      await expect(RestaurantService.updateRestaurant(restaurantId, updateData, userId))
        .rejects.toThrow('You do not have permission to update this restaurant');
    });
  });

  describe('deleteRestaurant', () => {
    it('should soft delete restaurant successfully when user owns it', async () => {
      const restaurantId = 1;
      const userId = 1;

      // Mock ownership check
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([{ userId, restaurantId }]),
          }),
        }),
      } as any);

      // Mock update operation (soft delete)
      mockDb.update.mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([{ id: restaurantId, active: false }]),
          }),
        }),
      } as any);

      const result = await RestaurantService.deleteRestaurant(restaurantId, userId);

      expect(result).toBe(true);
    });

    it('should throw error when user does not own restaurant', async () => {
      const restaurantId = 1;
      const userId = 2; // Different user

      // Mock ownership check returning empty array
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([]),
          }),
        }),
      } as any);

      await expect(RestaurantService.deleteRestaurant(restaurantId, userId))
        .rejects.toThrow('You do not have permission to delete this restaurant');
    });
  });

  describe('getRestaurantsByOwner', () => {
    it('should return restaurants owned by user', async () => {
      const ownerId = 1;
      const mockRestaurants = [
        {
          id: 1,
          name: 'Restaurant 1',
          streetAddress: '123 Main St',
          zipCode: '12345',
          cityId: 1,
          active: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          name: 'Restaurant 2',
          streetAddress: '456 Oak Ave',
          zipCode: '67890',
          cityId: 2,
          active: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      // Mock select query with join
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          innerJoin: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              orderBy: jest.fn().mockResolvedValue(mockRestaurants),
            }),
          }),
        }),
      } as any);

      const result = await RestaurantService.getRestaurantsByOwner(ownerId);

      expect(result).toEqual(mockRestaurants);
    });
  });

  describe('getRestaurantMenu', () => {
    it('should return menu items for restaurant', async () => {
      const restaurantId = 1;
      const mockMenuItems = [
        {
          id: 1,
          name: 'Burger',
          description: 'Delicious burger',
          price: '12.99',
          category: 'Main Courses',
          categoryId: 1,
          active: true,
        },
        {
          id: 2,
          name: 'Fries',
          description: 'Crispy fries',
          price: '4.99',
          category: 'Appetizers',
          categoryId: 2,
          active: true,
        },
      ];

      // Mock select query with joins
      mockDb.select.mockReturnValue({
        from: jest.fn().mockReturnValue({
          innerJoin: jest.fn().mockReturnValue({
            where: jest.fn().mockReturnValue({
              orderBy: jest.fn().mockResolvedValue(mockMenuItems),
            }),
          }),
        }),
      } as any);

      const result = await RestaurantService.getRestaurantMenu(restaurantId);

      expect(result).toEqual(mockMenuItems);
    });
  });
});

