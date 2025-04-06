# LoanSystem Backend

An Express+Node.js backend with Prisma for the LoanSystem application.

## Overview

The LoanSystem backend API supports three separate role-based dashboards:

1. **User Dashboard API**: Handles applications and user authentication
2. **Verifier Dashboard API**: Manages verification workflow
3. **Admin Dashboard API**: Supports approval decisions and administration

## Tech Stack

- Node.js with Express and TypeScript
- Prisma ORM for database access
- PostgreSQL/MySQL database
- JWT for authentication
- bcrypt for password hashing

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/loan-system-backend.git
   cd loan-system-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   
   Create a `.env` file:
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/loansystem"
   JWT_SECRET=your_jwt_secret_key
   PORT=5000
   ```

4. **Initialize database**
   ```bash
   npx prisma migrate dev --name init
   npx prisma generate
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```
   
   The server will start on `http://localhost:5000`

## API Endpoints

### Auth
- `POST /api/auth/register`: Register a new user
- `POST /api/auth/login`: User login
- `POST /api/auth/verifier/login`: Verifier login
- `POST /api/auth/admin/login`: Admin login

### User
- `POST /api/applications`: Submit a new loan application
- `GET /api/applications`: Get user's applications
- `GET /api/applications/:id`: Get application details

### Verifier
- `GET /api/verifier/applications`: Get pending applications
- `PUT /api/verifier/applications/:id/verify`: Verify an application
- `PUT /api/verifier/applications/:id/reject`: Reject an application

### Admin
- `PUT /api/admin/applications/:id/approve`: Approve an application
- `PUT /api/admin/applications/:id/reject`: Reject an application
- `GET /api/admin/metrics`: Get system metrics

## Main Dependencies

- express: ^4.18.2
- typescript: ^4.9.5
- @prisma/client: ^4.10.0
- jsonwebtoken: ^9.0.0
- bcrypt: ^5.1.0
- cors: ^2.8.5
- dotenv: ^16.0.3

## License

MIT License
