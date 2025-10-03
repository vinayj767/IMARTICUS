// Test Redis Connection and Caching
require('dotenv').config();
const Redis = require('ioredis');

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
});

async function testRedis() {
  try {
    console.log('🧪 Testing Redis Connection...\n');
    
    // Test 1: Ping
    console.log('Test 1: PING');
    const pong = await redis.ping();
    console.log('✅ PING response:', pong);
    
    // Test 2: Set a value
    console.log('\nTest 2: SET');
    await redis.set('test:key', 'Hello from Imarticus LMS!');
    console.log('✅ Value set successfully');
    
    // Test 3: Get the value
    console.log('\nTest 3: GET');
    const value = await redis.get('test:key');
    console.log('✅ Retrieved value:', value);
    
    // Test 4: Set with expiry (TTL)
    console.log('\nTest 4: SETEX (with 10 second expiry)');
    await redis.setex('test:expiring', 10, 'This expires in 10 seconds');
    const ttl = await redis.ttl('test:expiring');
    console.log('✅ Value set with TTL:', ttl, 'seconds');
    
    // Test 5: Store JSON (like cache)
    console.log('\nTest 5: Store JSON Object');
    const analyticsData = {
      totalStudents: 150,
      totalCourses: 25,
      totalRevenue: 50000,
      timestamp: new Date().toISOString()
    };
    await redis.setex('cache:analytics', 1800, JSON.stringify(analyticsData));
    const cached = await redis.get('cache:analytics');
    console.log('✅ Cached analytics:', JSON.parse(cached));
    
    // Test 6: Check memory usage
    console.log('\nTest 6: Memory Info');
    const info = await redis.info('memory');
    const usedMemory = info.match(/used_memory_human:(.+)/)?.[1];
    console.log('✅ Redis Memory Usage:', usedMemory);
    
    // Test 7: List all keys
    console.log('\nTest 7: All Keys');
    const keys = await redis.keys('*');
    console.log('✅ Total keys in Redis:', keys.length);
    console.log('   Keys:', keys);
    
    // Cleanup
    console.log('\n🧹 Cleaning up test keys...');
    await redis.del('test:key', 'test:expiring');
    console.log('✅ Test keys deleted\n');
    
    console.log('🎉 All Redis tests passed! Redis is working perfectly!\n');
    
    redis.disconnect();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Redis test failed:', error.message);
    redis.disconnect();
    process.exit(1);
  }
}

testRedis();
