# 🔧 Redis Setup Guide for Rate Limiting

This guide will help you set up Redis for the rate limiting functionality in your healthcare management system.

## 📋 Overview

The rate limiting system uses Redis to store rate limit counters and prevent abuse. We've implemented a fallback system that works without Redis for development, but for production, Redis is recommended.

## 🚀 Setup Options

### Option 1: Upstash Redis (Recommended - Cloud)

Upstash provides a serverless Redis service that's perfect for rate limiting.

#### Step 1: Create Upstash Account
1. Go to [https://upstash.com](https://upstash.com)
2. Sign up for a free account
3. Create a new Redis database

#### Step 2: Get Credentials
After creating your database, you'll get:
- **REST URL**: `https://your-database-name.upstash.io`
- **REST Token**: `your-rest-token-here`

#### Step 3: Update Environment Variables
Add these to your `.env` file:

```bash
# Upstash Redis for Rate Limiting
UPSTASH_REDIS_REST_URL=https://your-database-name.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_rest_token_here
```

#### Step 4: Test Connection
Start your application and check the console for:
```
✅ Redis connected successfully
```

### Option 2: Local Redis with Docker

If you prefer to run Redis locally, we've added it to your Docker setup.

#### Step 1: Start Redis Container
```bash
# Start Redis with Docker Compose
docker-compose up redis -d

# Or start all services
docker-compose up -d
```

#### Step 2: Update Environment Variables
Add these to your `.env` file:

```bash
# Local Redis for Rate Limiting
UPSTASH_REDIS_REST_URL=http://localhost:6379
UPSTASH_REDIS_REST_TOKEN=healthcare_redis_pass
```

#### Step 3: Verify Redis is Running
```bash
# Check if Redis container is running
docker ps | grep redis

# Test Redis connection
docker exec -it healthcare-redis redis-cli ping
```

### Option 3: Fallback Mode (Development Only)

If you don't want to set up Redis right now, the system will automatically use an in-memory fallback rate limiter.

**Note**: This is only suitable for development. In production, use Redis for proper rate limiting.

## 🔧 Configuration

### Rate Limiting Rules

The system implements the following rate limits:

| Endpoint | Limit | Window | Purpose |
|----------|-------|--------|---------|
| Registration | 3 requests | 1 hour | Prevent spam registrations |
| Email Verification | 5 requests | 15 minutes | Prevent email bombing |
| Form Submission | 10 requests | 5 minutes | Prevent form abuse |
| Suspicious Activity | 1 request | 1 hour | Block suspicious behavior |

### Environment Variables

```bash
# Required for Redis
UPSTASH_REDIS_REST_URL=your_redis_url
UPSTASH_REDIS_REST_TOKEN=your_redis_token

# Optional: Customize rate limits
RATE_LIMIT_REGISTRATION_MAX=3
RATE_LIMIT_REGISTRATION_WINDOW=3600000  # 1 hour in milliseconds

RATE_LIMIT_EMAIL_MAX=5
RATE_LIMIT_EMAIL_WINDOW=900000  # 15 minutes in milliseconds

RATE_LIMIT_FORM_MAX=10
RATE_LIMIT_FORM_WINDOW=300000  # 5 minutes in milliseconds

RATE_LIMIT_SUSPICIOUS_MAX=1
RATE_LIMIT_SUSPICIOUS_WINDOW=3600000  # 1 hour in milliseconds
```

## 🧪 Testing Rate Limiting

### Test Registration Rate Limiting
```bash
# Test normal registration (should work)
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"firstName":"John","lastName":"Doe","email":"test@example.com","phone":"1234567890","password":"TestPassword123!"}'

# Test rate limit (try 4 times quickly - 4th should fail)
for i in {1..4}; do
  curl -X POST http://localhost:3000/api/auth/register \
    -H "Content-Type: application/json" \
    -d '{"firstName":"John","lastName":"Doe","email":"test'$i'@example.com","phone":"123456789'$i'","password":"TestPassword123!"}'
  echo "Request $i completed"
done
```

### Test CSRF Protection
```bash
# Get CSRF token
curl -X GET http://localhost:3000/api/auth/csrf-token

# Test registration with CSRF token
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: your_csrf_token_here" \
  -d '{"firstName":"John","lastName":"Doe","email":"test@example.com","phone":"1234567890","password":"TestPassword123!"}'
```

## 🔍 Monitoring

### Check Rate Limit Status
```bash
# Check current rate limit status
curl -X GET http://localhost:3000/api/auth/rate-limit-status
```

### View Rate Limit Logs
Check your application logs for rate limiting events:
- `REGISTRATION_RATE_LIMIT_EXCEEDED`
- `EMAIL_VERIFICATION_RATE_LIMIT_EXCEEDED`
- `FORM_SUBMISSION_RATE_LIMIT_EXCEEDED`
- `SUSPICIOUS_ACTIVITY_RATE_LIMIT_EXCEEDED`

### Redis Monitoring (if using local Redis)
```bash
# Monitor Redis commands
docker exec -it healthcare-redis redis-cli monitor

# Check Redis memory usage
docker exec -it healthcare-redis redis-cli info memory

# List all keys
docker exec -it healthcare-redis redis-cli keys "*"
```

## 🚨 Troubleshooting

### Common Issues

#### 1. Redis Connection Failed
```
⚠️ Redis not available, using fallback rate limiter
```

**Solution**: Check your environment variables and Redis connection.

#### 2. Rate Limit Not Working
**Solution**: Verify Redis is running and accessible.

#### 3. CSRF Token Errors
**Solution**: Ensure CSRF token is included in requests and not expired.

### Debug Mode

Enable debug logging by setting:
```bash
DEBUG_RATE_LIMITING=true
```

This will log detailed rate limiting information to the console.

## 📊 Production Considerations

### Redis Configuration
- Use Redis with persistence enabled
- Set up Redis clustering for high availability
- Monitor Redis memory usage
- Set up Redis backups

### Rate Limiting Tuning
- Adjust rate limits based on your traffic patterns
- Monitor rate limiting effectiveness
- Consider different limits for different user types
- Implement IP whitelisting for trusted sources

### Security
- Use strong Redis passwords
- Enable Redis AUTH
- Use TLS for Redis connections
- Monitor Redis access logs

## 🎯 Next Steps

1. **Choose your Redis setup** (Upstash recommended)
2. **Update environment variables**
3. **Test the rate limiting functionality**
4. **Monitor the system in production**
5. **Tune rate limits based on usage patterns**

## 📚 Additional Resources

- [Upstash Redis Documentation](https://docs.upstash.com/)
- [Redis Rate Limiting Patterns](https://redis.io/docs/manual/patterns/distributed-locks/)
- [Next.js Rate Limiting Best Practices](https://nextjs.org/docs/advanced-features/security-headers)




