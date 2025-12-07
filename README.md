# Vehicle Rental Management API

**Live URL**: https://vehicle-orcin.vercel.app/

## Features

- User authentication with JWT (Admin/Customer roles)
- Vehicle CRUD operations with availability tracking
- Booking management with automatic price calculation
- Role-based access control for all endpoints
- Transaction-safe operations with PostgreSQL

## Technology Stack

- **Backend**: Node.js, Express.js, TypeScript
- **Database**: PostgreSQL (Neon)
- **Authentication**: JWT, bcryptjs
- **Deployment**: Vercel

## Setup & Usage

### Prerequisites
- Node.js
- PostgreSQL database

### Installation

1. Clone and install dependencies:
```bash
git clone https://github.com/imran18026/Vehicle-Rental.git
cd Vehicle-Rental
npm install
```

2. Create `.env` file:
```env
CONNECTION_STR=your_postgresql_connection_string
PORT=5000
JWT_SECRET=your_jwt_secret_key
```

3. Run the application:
```bash
# Development
npm run dev

# Production
npm run build
npm start
```

The API will be available at `https://vehicle-orcin.vercel.app/`

### API Endpoints

**Auth**: `/api/v1/auth/signup`, `/api/v1/auth/signin`
**Vehicles**: `/api/v1/vehicles` (GET, POST, PUT, DELETE)
**Users**: `/api/v1/users` (GET, PUT, DELETE)
**Bookings**: `/api/v1/bookings` (GET, POST, PUT)

All protected routes require: `Authorization: Bearer <token>`
