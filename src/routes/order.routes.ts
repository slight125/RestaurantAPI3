import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';
import { authenticateToken, authorizeRoles, optionalAuth } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import {
  createOrderSchema,
  idParamSchema,
  paginationSchema
} from '../utils/validation';

const router = Router();

// Protected routes - Customers can create and view their orders
router.post('/', 
  authenticateToken, 
  authorizeRoles('customer', 'admin'), 
  validateRequest(createOrderSchema), 
  OrderController.createOrder
);

router.get('/', 
  optionalAuth, 
  validateRequest(paginationSchema), 
  OrderController.getOrders
);

router.get('/:id', 
  optionalAuth, 
  validateRequest(idParamSchema), 
  OrderController.getOrderById
);

// Admin and restaurant owner routes
router.put('/:id/status', 
  authenticateToken, 
  authorizeRoles('restaurant_owner', 'admin'), 
  validateRequest(idParamSchema), 
  OrderController.updateOrderStatus
);

router.put('/:id/assign-driver', 
  authenticateToken, 
  authorizeRoles('restaurant_owner', 'admin'), 
  validateRequest(idParamSchema), 
  OrderController.assignDriver
);

// Customer and admin can cancel orders
router.put('/:id/cancel', 
  authenticateToken, 
  authorizeRoles('customer', 'admin'), 
  validateRequest(idParamSchema), 
  OrderController.cancelOrder
);

export default router;

