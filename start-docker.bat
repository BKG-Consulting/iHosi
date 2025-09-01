@echo off
echo Starting Docker Desktop...
echo Please make sure Docker Desktop is running before proceeding.
echo.
echo If Docker Desktop is not installed, please install it from:
echo https://www.docker.com/products/docker-desktop/
echo.
echo Once Docker Desktop is running, execute the following commands:
echo.
echo 1. Start the database services:
echo    docker-compose up -d
echo.
echo 2. Check if services are running:
echo    docker-compose ps
echo.
echo 3. Wait for database to be ready (about 30 seconds)
echo.
echo 4. Install dependencies:
echo    npm install
echo.
echo 5. Generate Prisma client:
echo    npx prisma generate
echo.
echo 6. Run database migrations:
echo    npx prisma migrate dev
echo.
echo 7. Seed the database:
echo    npx prisma db seed
echo.
echo 8. Start the application:
echo    npm run dev
echo.
pause
