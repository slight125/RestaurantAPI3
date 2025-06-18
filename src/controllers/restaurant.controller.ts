import { Request, Response } from 'express';
import { RestaurantService } from '../services/restaurant.service';
import { ApiResponse, CreateRestaurantRequest, PaginationQuery } from '../types';
import { asyncHandler } from '../middleware/error';
import { AuthenticatedRequest } from '../middleware/auth';

export class RestaurantController {
  static createRestaurant = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      const response: ApiResponse = {
        success: false,
        error: 'User not authenticated'
      };
      return res.status(401).json(response);
    }

    const restaurantData: CreateRestaurantRequest = req.body;
    
    const restaurant = await RestaurantService.createRestaurant(restaurantData, req.user.id);
    
    const response: ApiResponse<typeof restaurant> = {
      success: true,
      data: restaurant,
      message: 'Restaurant created successfully'
    };
    
    res.status(201).json(response);
  });

  static getRestaurants = asyncHandler(async (req: Request, res: Response) => {
    const pagination: PaginationQuery = {
      page: req.query.page ? parseInt(req.query.page as string) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
    };
    
    const result = await RestaurantService.getRestaurants(pagination);
    
    const response: ApiResponse<typeof result> = {
      success: true,
      data: result
    };
    
    res.status(200).json(response);
  });

  static getRestaurantById = asyncHandler(async (req: Request, res: Response) => {
    const restaurantId = parseInt(req.params.id);
    
    const restaurant = await RestaurantService.getRestaurantById(restaurantId);
    
    if (!restaurant) {
      const response: ApiResponse = {
        success: false,
        error: 'Restaurant not found'
      };
      return res.status(404).json(response);
    }
    
    const response: ApiResponse<typeof restaurant> = {
      success: true,
      data: restaurant
    };
    
    res.status(200).json(response);
  });

  static updateRestaurant = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      const response: ApiResponse = {
        success: false,
        error: 'User not authenticated'
      };
      return res.status(401).json(response);
    }

    const restaurantId = parseInt(req.params.id);
    const updateData = req.body;
    
    const updatedRestaurant = await RestaurantService.updateRestaurant(restaurantId, updateData, req.user.id);
    
    if (!updatedRestaurant) {
      const response: ApiResponse = {
        success: false,
        error: 'Restaurant not found or you do not have permission to update it'
      };
      return res.status(404).json(response);
    }
    
    const response: ApiResponse<typeof updatedRestaurant> = {
      success: true,
      data: updatedRestaurant,
      message: 'Restaurant updated successfully'
    };
    
    res.status(200).json(response);
  });

  static deleteRestaurant = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      const response: ApiResponse = {
        success: false,
        error: 'User not authenticated'
      };
      return res.status(401).json(response);
    }

    const restaurantId = parseInt(req.params.id);
    
    const isDeleted = await RestaurantService.deleteRestaurant(restaurantId, req.user.id);
    
    if (!isDeleted) {
      const response: ApiResponse = {
        success: false,
        error: 'Restaurant not found or you do not have permission to delete it'
      };
      return res.status(404).json(response);
    }
    
    const response: ApiResponse = {
      success: true,
      message: 'Restaurant deleted successfully'
    };
    
    res.status(200).json(response);
  });

  static getMyRestaurants = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      const response: ApiResponse = {
        success: false,
        error: 'User not authenticated'
      };
      return res.status(401).json(response);
    }

    const restaurants = await RestaurantService.getRestaurantsByOwner(req.user.id);
    
    const response: ApiResponse<typeof restaurants> = {
      success: true,
      data: restaurants
    };
    
    res.status(200).json(response);
  });

  static getRestaurantMenu = asyncHandler(async (req: Request, res: Response) => {
    const restaurantId = parseInt(req.params.id);
    
    const menu = await RestaurantService.getRestaurantMenu(restaurantId);
    
    const response: ApiResponse<typeof menu> = {
      success: true,
      data: menu
    };
    
    res.status(200).json(response);
  });
}

