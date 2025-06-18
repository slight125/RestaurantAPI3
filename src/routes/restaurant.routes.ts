import { Router } from 'express';
import { RestaurantController } from '../controllers/restaurant.controller';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import {
  createRestaurantSchema,
  updateRestaurantSchema,
  idParamSchema,
  paginationSchema
} from '../utils/validation';

const router = Router();

// Public routes
router.get('/', validateRequest(paginationSchema), RestaurantController.getRestaurants);
router.get('/:id', validateRequest(idParamSchema), RestaurantController.getRestaurantById);
router.get('/:id/menu', validateRequest(idParamSchema), RestaurantController.getRestaurantMenu);

// Protected routes - Restaurant owners only
router.post('/', 
  authenticateToken, 
  authorizeRoles('restaurant_owner', 'admin'), 
  validateRequest(createRestaurantSchema), 
  RestaurantController.createRestaurant
);

router.put('/:id', 
  authenticateToken, 
  authorizeRoles('restaurant_owner', 'admin'), 
  validateRequest({ ...idParamSchema, ...updateRestaurantSchema }), 
  RestaurantController.updateRestaurant
);

router.delete('/:id', 
  authenticateToken, 
  authorizeRoles('restaurant_owner', 'admin'), 
  validateRequest(idParamSchema), 
  RestaurantController.deleteRestaurant
);

router.get('/owner/my-restaurants', 
  authenticateToken, 
  authorizeRoles('restaurant_owner', 'admin'), 
  RestaurantController.getMyRestaurants
);

export default router;

