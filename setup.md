# Healthcare Management System - Local Setup Guide

## Prerequisites
- Docker and Docker Compose installed
- Node.js (v18 or higher)
- npm or yarn package manager

## Setup Instructions

### 1. Database Setup with Docker

Start the PostgreSQL database and pgAdmin:

```bash
# Start the database services
docker-compose up -d

# Check if services are running
docker-compose ps
```

This will start:
- PostgreSQL database on `localhost:5432`
- pgAdmin (database admin UI) on `http://localhost:8080`

### 2. Environment Variables

Create a `.env.local` file in the root directory and copy the contents from `env.example`:

```bash
cp env.example .env.local
```

**Important**: You need to set up Clerk authentication:

1. Go to [clerk.com](https://clerk.com) and create a new application
2. Get your publishable key and secret key
3. Update the `.env.local` file with your actual Clerk keys:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`

### 3. Install Dependencies

```bash
npm install
```

### 4. Database Migration and Seeding

Run Prisma migrations to set up the database schema:

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Seed the database with sample data
npx prisma db seed
```

### 5. Start the Application

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Database Access

### pgAdmin Access
- URL: `http://localhost:8080`
- Email: `admin@healthcare.com`
- Password: `admin123`

To connect to the database in pgAdmin:
- Host: `postgres` (or `localhost` if connecting from outside Docker)
- Port: `5432` (internal Docker port) or `5433` (external port from host)
- Database: `healthcare_db`
- Username: `healthcare_user`
- Password: `healthcare_pass`

### Direct Database Connection
You can also connect directly using any PostgreSQL client:
```
Host: localhost
Port: 5433
Database: healthcare_db
Username: healthcare_user
Password: healthcare_pass
```

## Troubleshooting

### Database Connection Issues
1. Ensure Docker services are running: `docker-compose ps`
2. Check database health: `docker-compose logs postgres`
3. Restart services: `docker-compose restart`

### Clerk Authentication Issues
1. Verify your Clerk keys in `.env.local`
2. Check that your Clerk application is properly configured
3. Ensure the redirect URLs match your local development setup

### Migration Issues
1. Reset the database: `npx prisma migrate reset`
2. Apply migrations: `npx prisma migrate dev`
3. Re-seed data: `npx prisma db seed`

## Stopping Services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (this will delete all data)
docker-compose down -v
```

## Next Steps

After setup, you can:
1. Access the healthcare system at `http://localhost:3000`
2. Sign up/in using Clerk authentication
3. Explore different user roles (Admin, Doctor, Patient, etc.)
4. Test appointment booking, medical records, and other features
