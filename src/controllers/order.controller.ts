import { Request, Response } from 'express';
import { OrderService } from '../services/order.service';
import { ApiResponse, CreateOrderRequest, PaginationQuery } from '../types';
import { asyncHandler } from '../middleware/error';
import { AuthenticatedRequest } from '../middleware/auth';

export class OrderController {
  static createOrder = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      const response: ApiResponse = {
        success: false,
        error: 'User not authenticated'
      };
      return res.status(401).json(response);
    }

    const orderData: CreateOrderRequest = req.body;
    
    const order = await OrderService.createOrder(orderData, req.user.id);
    
    const response: ApiResponse<typeof order> = {
      success: true,
      data: order,
      message: 'Order created successfully'
    };
    
    res.status(201).json(response);
  });

  static getOrders = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const pagination: PaginationQuery = {
      page: req.query.page ? parseInt(req.query.page as string) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
    };
    
    const result = await OrderService.getOrders(req.user?.id, req.user?.role, pagination);
    
    const response: ApiResponse<typeof result> = {
      success: true,
      data: result
    };
    
    res.status(200).json(response);
  });

  static getOrderById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const orderId = parseInt(req.params.id);
    
    const order = await OrderService.getOrderById(orderId, req.user?.id, req.user?.role);
    
    if (!order) {
      const response: ApiResponse = {
        success: false,
        error: 'Order not found'
      };
      return res.status(404).json(response);
    }
    
    const response: ApiResponse<typeof order> = {
      success: true,
      data: order
    };
    
    res.status(200).json(response);
  });

  static updateOrderStatus = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      const response: ApiResponse = {
        success: false,
        error: 'User not authenticated'
      };
      return res.status(401).json(response);
    }

    const orderId = parseInt(req.params.id);
    const { status } = req.body;
    
    const isUpdated = await OrderService.updateOrderStatus(orderId, status, req.user.id);
    
    if (!isUpdated) {
      const response: ApiResponse = {
        success: false,
        error: 'Failed to update order status'
      };
      return res.status(400).json(response);
    }
    
    const response: ApiResponse = {
      success: true,
      message: 'Order status updated successfully'
    };
    
    res.status(200).json(response);
  });

  static assignDriver = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      const response: ApiResponse = {
        success: false,
        error: 'User not authenticated'
      };
      return res.status(401).json(response);
    }

    const orderId = parseInt(req.params.id);
    const { driverId } = req.body;
    
    const isAssigned = await OrderService.assignDriver(orderId, driverId);
    
    if (!isAssigned) {
      const response: ApiResponse = {
        success: false,
        error: 'Failed to assign driver to order'
      };
      return res.status(400).json(response);
    }
    
    const response: ApiResponse = {
      success: true,
      message: 'Driver assigned to order successfully'
    };
    
    res.status(200).json(response);
  });

  static cancelOrder = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      const response: ApiResponse = {
        success: false,
        error: 'User not authenticated'
      };
      return res.status(401).json(response);
    }

    const orderId = parseInt(req.params.id);
    
    const isCancelled = await OrderService.cancelOrder(orderId, req.user.id, req.user.role);
    
    if (!isCancelled) {
      const response: ApiResponse = {
        success: false,
        error: 'Order not found or cannot be cancelled'
      };
      return res.status(404).json(response);
    }
    
    const response: ApiResponse = {
      success: true,
      message: 'Order cancelled successfully'
    };
    
    res.status(200).json(response);
  });
}

