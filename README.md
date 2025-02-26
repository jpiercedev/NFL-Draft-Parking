# Parking Reservations Application

An internal application for managing parking reservations, QR code scanning, and automated email notifications.

## Features

- Automated reservation creation from Webflow store purchases
- QR Code generation and scanning
- Real-time analytics dashboard
- Reservation management system
- Automated email notifications via SendGrid
- Secure authentication system

## Tech Stack

- Frontend: React, Redux, Tailwind CSS
- Backend: Node.js, Express
- Database: PostgreSQL
- APIs: Webflow, SendGrid
- Authentication: JWT

## Prerequisites

- Node.js >= 16
- PostgreSQL >= 14
- SendGrid API key
- Webflow API key

## Environment Setup

1. Clone the repository
2. Copy `.env.example` to `.env` in both client and server directories
3. Fill in the required environment variables

### Server Setup

```bash
cd server
npm install
npm run dev
```

### Client Setup

```bash
cd client
npm install
npm run dev
```

## Environment Variables

### Server (.env)
```
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/parking_app
JWT_SECRET=your_jwt_secret
SENDGRID_API_KEY=your_sendgrid_api_key
WEBFLOW_API_KEY=your_webflow_api_key
```

### Client (.env)
```
VITE_API_URL=http://localhost:3000
```

## API Documentation

The API documentation is available at `/api-docs` when running the server locally.

## Contributing

1. Create a new branch for your feature
2. Make your changes
3. Submit a pull request

## License

This project is private and for internal use only.
