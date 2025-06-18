const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();
const PORT = parseInt(process.env.PORT || '3000');

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
}));

// Logging middleware
app.use(morgan('combined'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Restaurant Management API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    features: [
      'User Authentication & Authorization',
      'Restaurant Management',
      'Menu Management', 
      'Order Processing',
      'Email Services',
      'Input Validation',
      'Clean Architecture'
    ]
  });
});

// API routes placeholder
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Restaurant Management API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    endpoints: {
      authentication: [
        'POST /api/auth/register',
        'POST /api/auth/login',
        'GET /api/auth/profile',
        'PUT /api/auth/profile',
        'POST /api/auth/verify-email',
        'POST /api/auth/request-password-reset',
        'POST /api/auth/reset-password'
      ],
      restaurants: [
        'GET /api/restaurants',
        'GET /api/restaurants/:id',
        'POST /api/restaurants',
        'PUT /api/restaurants/:id',
        'DELETE /api/restaurants/:id',
        'GET /api/restaurants/owner/my-restaurants',
        'GET /api/restaurants/:id/menu'
      ],
      menuItems: [
        'GET /api/menu-items',
        'GET /api/menu-items/:id',
        'POST /api/menu-items',
        'PUT /api/menu-items/:id',
        'DELETE /api/menu-items/:id',
        'GET /api/menu-items/category/:categoryId'
      ],
      orders: [
        'GET /api/orders',
        'GET /api/orders/:id',
        'POST /api/orders',
        'PUT /api/orders/:id/status',
        'PUT /api/orders/:id/assign-driver',
        'PUT /api/orders/:id/cancel'
      ]
    }
  });
});

// Sample data endpoints for demonstration
app.get('/api/restaurants', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: 1,
        name: 'Amazing Pizza Place',
        streetAddress: '123 Main Street',
        zipCode: '12345',
        city: 'New York',
        state: 'New York',
        phone: '+1234567890',
        email: 'info@amazingpizza.com',
        description: 'The best pizza in town!',
        active: true
      },
      {
        id: 2,
        name: 'Burger Paradise',
        streetAddress: '456 Oak Avenue',
        zipCode: '67890',
        city: 'Los Angeles',
        state: 'California',
        phone: '+1987654321',
        email: 'contact@burgerparadise.com',
        description: 'Gourmet burgers and more!',
        active: true
      }
    ],
    pagination: {
      page: 1,
      limit: 10,
      total: 2,
      totalPages: 1
    }
  });
});

app.get('/api/restaurants/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const restaurants = [
    {
      id: 1,
      name: 'Amazing Pizza Place',
      streetAddress: '123 Main Street',
      zipCode: '12345',
      city: 'New York',
      state: 'New York',
      phone: '+1234567890',
      email: 'info@amazingpizza.com',
      description: 'The best pizza in town!',
      active: true
    },
    {
      id: 2,
      name: 'Burger Paradise',
      streetAddress: '456 Oak Avenue',
      zipCode: '67890',
      city: 'Los Angeles',
      state: 'California',
      phone: '+1987654321',
      email: 'contact@burgerparadise.com',
      description: 'Gourmet burgers and more!',
      active: true
    }
  ];
  
  const restaurant = restaurants.find(r => r.id === id);
  if (restaurant) {
    res.json({
      success: true,
      data: restaurant
    });
  } else {
    res.status(404).json({
      success: false,
      error: 'Restaurant not found'
    });
  }
});

app.get('/api/restaurants/:id/menu', (req, res) => {
  const id = parseInt(req.params.id);
  const menus = {
    1: [
      {
        id: 1,
        name: 'Margherita Pizza',
        description: 'Classic pizza with tomato sauce, mozzarella, and basil',
        price: '14.99',
        category: 'Pizza',
        active: true
      },
      {
        id: 2,
        name: 'Pepperoni Pizza',
        description: 'Pizza with tomato sauce, mozzarella, and pepperoni',
        price: '16.99',
        category: 'Pizza',
        active: true
      }
    ],
    2: [
      {
        id: 3,
        name: 'Classic Burger',
        description: 'Beef patty with lettuce, tomato, and cheese',
        price: '12.99',
        category: 'Burgers',
        active: true
      },
      {
        id: 4,
        name: 'Chicken Burger',
        description: 'Grilled chicken breast with lettuce and mayo',
        price: '11.99',
        category: 'Burgers',
        active: true
      }
    ]
  };
  
  const menu = menus[id] || [];
  res.json({
    success: true,
    data: menu
  });
});

// Error handling middleware
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    message: 'The requested endpoint does not exist'
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: 'Something went wrong on the server'
  });
});

// Start server
if (require.main === module) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📱 Health check: http://localhost:${PORT}/health`);
    console.log(`🔗 API base URL: http://localhost:${PORT}/api`);
    console.log(`📖 API Documentation: http://localhost:${PORT}/api/health`);
  });
}

module.exports = app;

