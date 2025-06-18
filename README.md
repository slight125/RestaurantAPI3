# Restaurant Management System API

A comprehensive RESTful API for managing restaurants, menu items, orders, and user authentication built with Express.js, TypeScript, and Drizzle ORM.

## Features

- **User Authentication & Authorization**: JWT-based authentication with role-based access control
- **Restaurant Management**: CRUD operations for restaurants with owner permissions
- **Menu Management**: Complete menu item management with categories
- **Order Processing**: Full order lifecycle management with status tracking
- **Email Services**: Welcome emails and password reset functionality
- **Input Validation**: Comprehensive validation using Zod
- **Database Relations**: Properly implemented relationships between all entities
- **Testing**: Comprehensive test suite for all services
- **Clean Architecture**: Router-Controller-Service pattern for maintainable code

## Technology Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Zod
- **Email**: Nodemailer
- **Testing**: Jest with Supertest
- **Security**: Helmet, CORS
- **Logging**: Morgan

## Project Structure

```
src/
├── controllers/          # Request/response handling
├── services/            # Business logic and database operations
├── routes/              # API route definitions
├── middleware/          # Custom middleware (auth, validation, error handling)
├── models/              # Database schema and connection
├── utils/               # Utility functions and helpers
├── types/               # TypeScript type definitions
├── config/              # Configuration files
└── tests/               # Test files
```

## Database Schema

The API implements a comprehensive restaurant management system with the following entities:

### Core Entities
- **Users**: Customer, driver, restaurant owner, and admin accounts
- **Restaurants**: Restaurant information and location data
- **Menu Items**: Food items with categories and pricing
- **Orders**: Order management with item tracking
- **Addresses**: Delivery and restaurant addresses
- **Cities/States**: Location hierarchy

### Relationships
- Users can have multiple addresses and orders
- Restaurants belong to cities and have menu items
- Orders contain multiple menu items and track status changes
- Drivers can be assigned to orders for delivery
- Restaurant owners can manage their restaurants

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL database
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd restaurant-management-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   # Database Configuration
   DATABASE_URL=postgresql://username:password@localhost:5432/restaurant_db
   
   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRES_IN=7d
   
   # Email Configuration (Gmail example)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   
   # Application Configuration
   PORT=3000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:3000
   ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
   ```

4. **Database Setup**
   ```bash
   # Generate database migrations
   npm run db:generate
   
   # Run migrations
   npm run db:migrate
   
   # Seed database (optional)
   npm run db:seed
   ```

5. **Start the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm run build
   npm start
   ```

## API Documentation

### Base URL
```
http://localhost:3000/api
```

### Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### User Roles

- **customer**: Can place orders, manage profile
- **driver**: Can view assigned orders, update delivery status
- **restaurant_owner**: Can manage restaurants and menu items
- **admin**: Full system access

### API Endpoints

#### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Register new user | No |
| POST | `/auth/login` | User login | No |
| GET | `/auth/profile` | Get user profile | Yes |
| PUT | `/auth/profile` | Update user profile | Yes |
| POST | `/auth/verify-email` | Verify email address | No |
| POST | `/auth/request-password-reset` | Request password reset | No |
| POST | `/auth/reset-password` | Reset password | No |

#### Restaurant Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/restaurants` | Get all restaurants | No |
| GET | `/restaurants/:id` | Get restaurant by ID | No |
| POST | `/restaurants` | Create restaurant | Yes (Owner/Admin) |
| PUT | `/restaurants/:id` | Update restaurant | Yes (Owner/Admin) |
| DELETE | `/restaurants/:id` | Delete restaurant | Yes (Owner/Admin) |
| GET | `/restaurants/owner/my-restaurants` | Get owner's restaurants | Yes (Owner) |
| GET | `/restaurants/:id/menu` | Get restaurant menu | No |

#### Menu Item Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/menu-items` | Get all menu items | No |
| GET | `/menu-items/:id` | Get menu item by ID | No |
| POST | `/menu-items` | Create menu item | Yes (Owner/Admin) |
| PUT | `/menu-items/:id` | Update menu item | Yes (Owner/Admin) |
| DELETE | `/menu-items/:id` | Delete menu item | Yes (Owner/Admin) |
| GET | `/menu-items/category/:categoryId` | Get items by category | No |

#### Order Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/orders` | Get user's orders | Yes |
| GET | `/orders/:id` | Get order by ID | Yes |
| POST | `/orders` | Create new order | Yes (Customer) |
| PUT | `/orders/:id/status` | Update order status | Yes (Owner/Driver/Admin) |
| PUT | `/orders/:id/assign-driver` | Assign driver to order | Yes (Admin) |
| PUT | `/orders/:id/cancel` | Cancel order | Yes |

### Request/Response Examples

#### Register User
```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password123",
  "contactPhone": "+1234567890",
  "role": "customer"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "customer",
      "emailVerified": false
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "User registered successfully. Please check your email for verification code."
}
```

#### Create Order
```bash
POST /api/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "restaurantId": 1,
  "deliveryAddressId": 1,
  "items": [
    {
      "menuItemId": 1,
      "quantity": 2,
      "comment": "No onions please"
    },
    {
      "menuItemId": 2,
      "quantity": 1
    }
  ],
  "comment": "Please deliver quickly"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "restaurantId": 1,
    "userId": 1,
    "deliveryAddressId": 1,
    "price": "30.97",
    "discount": "0.00",
    "finalPrice": "30.97",
    "comment": "Please deliver quickly",
    "createdAt": "2024-01-15T10:30:00Z"
  },
  "message": "Order created successfully"
}
```

### Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "error": "Error message",
  "details": "Additional error details (optional)"
}
```

Common HTTP status codes:
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

## Testing

Run the test suite:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Email Configuration

The API supports email functionality for:
- Welcome emails upon registration
- Password reset emails
- Order confirmation emails

### Gmail Configuration Example

1. Enable 2-factor authentication on your Gmail account
2. Generate an app-specific password
3. Use these settings in your `.env` file:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

## Deployment

### Environment Variables for Production

```env
NODE_ENV=production
DATABASE_URL=your-production-database-url
JWT_SECRET=your-production-jwt-secret
SMTP_HOST=your-smtp-host
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password
FRONTEND_URL=https://your-frontend-domain.com
ALLOWED_ORIGINS=https://your-frontend-domain.com
```

### Docker Deployment (Optional)

Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions, please contact the development team or create an issue in the repository.

