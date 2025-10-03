// Redis Cache Configuration
const Redis = require('ioredis');

const REDIS_CONFIG = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  retryStrategy: (times) => {
    if (times > 3) {
      console.log('⚠️  Redis connection failed after 3 retries. Running without cache.');
      return null; // Stop retrying
    }
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 1,
  enableReadyCheck: false,
  lazyConnect: true
};

let redisClient = null;
let isRedisAvailable = false;

// Initialize Redis Connection
const connectRedis = async () => {
  try {
    redisClient = new Redis(REDIS_CONFIG);
    
    redisClient.on('connect', () => {
      console.log('✅ Redis Connected Successfully');
      isRedisAvailable = true;
    });
    
    redisClient.on('error', (err) => {
      if (err.code === 'ECONNREFUSED') {
        console.log('⚠️  Redis not available at ' + REDIS_CONFIG.host + ':' + REDIS_CONFIG.port);
        isRedisAvailable = false;
      } else {
        console.error('❌ Redis Error:', err.message);
      }
    });
    
    redisClient.on('ready', () => {
      console.log('🚀 Redis Client Ready');
      isRedisAvailable = true;
    });
    
    redisClient.on('close', () => {
      isRedisAvailable = false;
    });
    
    // Try to connect
    await redisClient.connect().catch(err => {
      console.log('⚠️  Redis connection skipped. Running without cache.');
      isRedisAvailable = false;
    });
    
    return redisClient;
  } catch (error) {
    console.log('⚠️  Redis initialization failed. Running without cache.');
    isRedisAvailable = false;
    return null;
  }
};

// Get Redis Client
const getRedisClient = () => {
  return isRedisAvailable ? redisClient : null;
};

// Cache Middleware
const cacheMiddleware = (duration = 1800) => {
  return async (req, res, next) => {
    // Skip cache if Redis not available
    if (!isRedisAvailable || !redisClient) {
      console.log('⏭️  Cache skipped - Redis not available');
      return next();
    }

    const key = `cache:${req.originalUrl}`;

    try {
      // Try to get cached data
      const cachedData = await redisClient.get(key);
      
      if (cachedData) {
        console.log(`✅ Cache HIT for: ${key}`);
        return res.json(JSON.parse(cachedData));
      }
      
      console.log(`❌ Cache MISS for: ${key}`);
      
      // Store original res.json
      const originalJson = res.json.bind(res);
      
      // Override res.json to cache response
      res.json = function(data) {
        if (data.success && isRedisAvailable) {
          redisClient.setex(key, duration, JSON.stringify(data))
            .catch(err => console.log('Cache set error:', err.message));
        }
        return originalJson(data);
      };
      
      next();
    } catch (error) {
      console.log('Cache middleware error:', error.message);
      next();
    }
  };
};

// Clear Cache by Pattern
const clearCache = async (pattern = '*') => {
  try {
    if (!isRedisAvailable || !redisClient) return;
    
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(...keys);
      console.log(`🗑️ Cleared ${keys.length} cache entries`);
    }
  } catch (error) {
    console.log('Error clearing cache:', error.message);
  }
};

module.exports = {
  connectRedis,
  getRedisClient,
  cacheMiddleware,
  clearCache
};
