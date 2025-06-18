import { Router } from 'express';
import { MenuItemController } from '../controllers/menuItem.controller';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import {
  createMenuItemSchema,
  updateMenuItemSchema,
  idParamSchema,
  paginationSchema
} from '../utils/validation';

const router = Router();

// Public routes
router.get('/', validateRequest(paginationSchema), MenuItemController.getMenuItems);
router.get('/:id', validateRequest(idParamSchema), MenuItemController.getMenuItemById);
router.get('/category/:categoryId', MenuItemController.getMenuItemsByCategory);

// Protected routes - Restaurant owners only
router.post('/', 
  authenticateToken, 
  authorizeRoles('restaurant_owner', 'admin'), 
  validateRequest(createMenuItemSchema), 
  MenuItemController.createMenuItem
);

router.put('/:id', 
  authenticateToken, 
  authorizeRoles('restaurant_owner', 'admin'), 
  validateRequest({ ...idParamSchema, ...updateMenuItemSchema }), 
  MenuItemController.updateMenuItem
);

router.delete('/:id', 
  authenticateToken, 
  authorizeRoles('restaurant_owner', 'admin'), 
  validateRequest(idParamSchema), 
  MenuItemController.deleteMenuItem
);

export default router;

