# Events.Echo Backend API

A comprehensive backend API for Events.Echo, a modern event management platform built with Express.js, MongoDB, and JWT authentication.

## 🚀 Features

- **User Authentication & Authorization**: JWT-based auth with role-based access control
- **Event Management**: Complete CRUD operations for events with analytics
- **Mock Payment System**: Simulated payment processing (replaces Stripe)
- **Ticket Management**: Issue, transfer, cancel, and validate tickets
- **Seat Management**: Real-time seat availability and reservation system
- **Organizer Dashboard**: Analytics, staff management, sponsors, and vendors
- **RESTful API**: Well-structured endpoints with validation and error handling

## 🛠 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: express-validator
- **Security**: Helmet, CORS, bcryptjs
- **Logging**: Morgan
- **Environment**: dotenv

## 📁 Project Structure

```
backend/
├── config/
│   └── db.js                 # Database connection
├── controllers/              # Route controllers
│   ├── authController.js
│   ├── eventController.js
│   ├── paymentController.js
│   ├── ticketController.js
│   ├── seatmapController.js
│   ├── reservationController.js
│   └── organizerController.js
├── middleware/               # Custom middleware
│   ├── authMiddleware.js
│   ├── roleMiddleware.js
│   └── errorHandler.js
├── models/                   # MongoDB models
│   ├── Attendee.js
│   ├── Organizer.js
│   ├── Event.js
│   ├── Ticket.js
│   ├── Payment.js
│   ├── Venue.js
│   ├── Staff.js
│   ├── Sponsor.js
│   └── Vendor.js
├── routes/                   # API routes
│   ├── authRoutes.js
│   ├── eventRoutes.js
│   ├── paymentRoutes.js
│   ├── ticketRoutes.js
│   ├── seatmapRoutes.js
│   ├── reservationRoutes.js
│   └── organizerRoutes.js
├── server.js                 # Main server file
├── package.json
├── .env                      # Environment variables
└── README.md
```

## 🔧 Installation & Setup

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local installation or cloud instance)
- npm or yarn

### Installation

1. **Clone the repository** (if applicable) or navigate to the backend directory:
   ```bash
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Setup**:
   - Copy `.env` file and update the values:
   ```bash
   cp .env .env.local
   ```
   - Update MongoDB URI and JWT secrets

4. **Start MongoDB** (if running locally):
   ```bash
   # On macOS with Homebrew
   brew services start mongodb/brew/mongodb-community

   # On Ubuntu/Debian
   sudo systemctl start mongod

   # On Windows
   net start MongoDB
   ```

5. **Start the server**:
   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

The server will start on `http://localhost:5000`

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api/v1
```

### Authentication

#### Register User
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "attendee" // or "organizer"
}
```

#### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### Events

#### Get All Events
```http
GET /api/v1/events?page=1&limit=10&category=music&status=active
```

#### Create Event (Organizer only)
```http
POST /api/v1/events
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Summer Music Festival",
  "description": "A fantastic music festival",
  "date": "2024-07-15T18:00:00Z",
  "venue": "Central Park",
  "category": "music",
  "capacity": 1000,
  "pricing": [
    { "category": "standard", "price": 50 },
    { "category": "vip", "price": 100 }
  ]
}
```

### Payments

#### Process Mock Payment
```http
POST /api/v1/payments/mock
Authorization: Bearer <token>
Content-Type: application/json

{
  "attendeeId": "60d5ecb74b24c72b8c8b4567",
  "ticketId": "60d5ecb74b24c72b8c8b4568",
  "amount": 50,
  "mode": "card"
}
```

### Tickets

#### Issue Ticket
```http
POST /api/v1/tickets/issue
Authorization: Bearer <token>
Content-Type: application/json

{
  "attendeeId": "60d5ecb74b24c72b8c8b4567",
  "eventId": "60d5ecb74b24c72b8c8b4569",
  "seatNo": 25,
  "category": "standard",
  "price": 50
}
```

### Seatmap

#### Get Seatmap
```http
GET /api/v1/seatmap/:eventId
```

#### Reserve Seat
```http
POST /api/v1/seatmap/reserve
Authorization: Bearer <token>
Content-Type: application/json

{
  "eventId": "60d5ecb74b24c72b8c8b4569",
  "seatNo": 25,
  "attendeeId": "60d5ecb74b24c72b8c8b4567"
}
```

### Organizer Dashboard

#### Get Dashboard Data
```http
GET /api/v1/organizer/dashboard
Authorization: Bearer <token>
```

#### Get Organizer Events
```http
GET /api/v1/organizer/events?page=1&limit=10&status=active
Authorization: Bearer <token>
```

## 🔐 Authentication & Authorization

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

### User Roles

- **attendee**: Can browse events, purchase tickets, manage their bookings
- **organizer**: Can create/manage events, view analytics, manage staff/sponsors
- **admin**: Full access to all features
- **staff**: Limited access for event staff (ticket validation, etc.)

## 🗄 Database Models

### Core Models

- **Attendee**: Event attendees with profile information
- **Organizer**: Event organizers with company details
- **Event**: Event details, pricing, capacity, analytics
- **Ticket**: Issued tickets with seat assignments
- **Payment**: Payment records with transaction details
- **Venue**: Event venue information
- **Staff**: Organizer's staff members
- **Sponsor**: Event sponsors
- **Vendor**: Event vendors/service providers

## 🧪 Testing the API

### Health Check
```bash
curl http://localhost:5000/health
```

### Register a User
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "role": "attendee"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

## 🚀 Deployment

### Environment Variables for Production

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/events_echo
JWT_SECRET=your_production_jwt_secret
JWT_REFRESH_SECRET=your_production_refresh_secret
FRONTEND_URL=https://your-frontend-domain.com
```

### Build & Deploy

```bash
# Install dependencies
npm ci --only=production

# Start server
npm start
```

## 📝 Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "errors": ["Detailed error messages"] // for validation errors
}
```

Common HTTP status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation errors)
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Internal Server Error

## 🔒 Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing configuration
- **bcryptjs**: Password hashing
- **JWT**: Secure token-based authentication
- **Input validation**: express-validator for all inputs
- **Rate limiting**: Configurable rate limiting (ready for implementation)

## 📊 Monitoring & Logging

- **Morgan**: HTTP request logging
- **Error handling**: Centralized error handling middleware
- **Health checks**: `/health` endpoint for monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For support or questions, please contact the development team or create an issue in the repository.