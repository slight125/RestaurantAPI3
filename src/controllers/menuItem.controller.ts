import { Request, Response } from 'express';
import { MenuItemService } from '../services/menuItem.service';
import { ApiResponse, CreateMenuItemRequest, PaginationQuery } from '../types';
import { asyncHandler } from '../middleware/error';
import { AuthenticatedRequest } from '../middleware/auth';

export class MenuItemController {
  static createMenuItem = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      const response: ApiResponse = {
        success: false,
        error: 'User not authenticated'
      };
      return res.status(401).json(response);
    }

    const menuItemData: CreateMenuItemRequest = req.body;
    
    const menuItem = await MenuItemService.createMenuItem(menuItemData, req.user.id);
    
    const response: ApiResponse<typeof menuItem> = {
      success: true,
      data: menuItem,
      message: 'Menu item created successfully'
    };
    
    res.status(201).json(response);
  });

  static getMenuItems = asyncHandler(async (req: Request, res: Response) => {
    const restaurantId = req.query.restaurantId ? parseInt(req.query.restaurantId as string) : undefined;
    const pagination: PaginationQuery = {
      page: req.query.page ? parseInt(req.query.page as string) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
    };
    
    const result = await MenuItemService.getMenuItems(restaurantId, pagination);
    
    const response: ApiResponse<typeof result> = {
      success: true,
      data: result
    };
    
    res.status(200).json(response);
  });

  static getMenuItemById = asyncHandler(async (req: Request, res: Response) => {
    const menuItemId = parseInt(req.params.id);
    
    const menuItem = await MenuItemService.getMenuItemById(menuItemId);
    
    if (!menuItem) {
      const response: ApiResponse = {
        success: false,
        error: 'Menu item not found'
      };
      return res.status(404).json(response);
    }
    
    const response: ApiResponse<typeof menuItem> = {
      success: true,
      data: menuItem
    };
    
    res.status(200).json(response);
  });

  static updateMenuItem = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      const response: ApiResponse = {
        success: false,
        error: 'User not authenticated'
      };
      return res.status(401).json(response);
    }

    const menuItemId = parseInt(req.params.id);
    const updateData = req.body;
    
    // Convert price to string if provided
    if (updateData.price) {
      updateData.price = updateData.price.toString();
    }
    
    const updatedMenuItem = await MenuItemService.updateMenuItem(menuItemId, updateData, req.user.id);
    
    if (!updatedMenuItem) {
      const response: ApiResponse = {
        success: false,
        error: 'Menu item not found or you do not have permission to update it'
      };
      return res.status(404).json(response);
    }
    
    const response: ApiResponse<typeof updatedMenuItem> = {
      success: true,
      data: updatedMenuItem,
      message: 'Menu item updated successfully'
    };
    
    res.status(200).json(response);
  });

  static deleteMenuItem = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      const response: ApiResponse = {
        success: false,
        error: 'User not authenticated'
      };
      return res.status(401).json(response);
    }

    const menuItemId = parseInt(req.params.id);
    
    const isDeleted = await MenuItemService.deleteMenuItem(menuItemId, req.user.id);
    
    if (!isDeleted) {
      const response: ApiResponse = {
        success: false,
        error: 'Menu item not found or you do not have permission to delete it'
      };
      return res.status(404).json(response);
    }
    
    const response: ApiResponse = {
      success: true,
      message: 'Menu item deleted successfully'
    };
    
    res.status(200).json(response);
  });

  static getMenuItemsByCategory = asyncHandler(async (req: Request, res: Response) => {
    const categoryId = parseInt(req.params.categoryId);
    const restaurantId = req.query.restaurantId ? parseInt(req.query.restaurantId as string) : undefined;
    
    const menuItems = await MenuItemService.getMenuItemsByCategory(categoryId, restaurantId);
    
    const response: ApiResponse<typeof menuItems> = {
      success: true,
      data: menuItems
    };
    
    res.status(200).json(response);
  });
}

