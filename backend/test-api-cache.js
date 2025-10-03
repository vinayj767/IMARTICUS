// Test API Caching Performance
const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

// Test credentials (admin account)
const ADMIN_EMAIL = 'admin@imarticus.com';
const ADMIN_PASSWORD = 'admin123';

let authToken = '';

async function login() {
  try {
    console.log('🔐 Logging in as admin...');
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });
    
    authToken = response.data.token;
    console.log('✅ Login successful!\n');
    return true;
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data?.message || error.message);
    return false;
  }
}

async function testAnalyticsEndpoint() {
  try {
    console.log('📊 Testing Analytics Endpoint with Redis Caching...\n');
    
    // First request (CACHE MISS - will be slow)
    console.log('🔍 Request 1: CACHE MISS (fetching from database)');
    const start1 = Date.now();
    const response1 = await axios.get(`${API_URL}/admin/analytics`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    const time1 = Date.now() - start1;
    console.log(`⏱️  Response Time: ${time1}ms`);
    console.log(`📈 Data: ${response1.data.data.totalStudents} students, ${response1.data.data.totalCourses} courses`);
    
    // Second request (CACHE HIT - will be FAST!)
    console.log('\n🔍 Request 2: CACHE HIT (fetching from Redis)');
    const start2 = Date.now();
    const response2 = await axios.get(`${API_URL}/admin/analytics`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    const time2 = Date.now() - start2;
    console.log(`⏱️  Response Time: ${time2}ms ⚡`);
    console.log(`📈 Data: ${response2.data.data.totalStudents} students, ${response2.data.data.totalCourses} courses`);
    
    // Third request (CACHE HIT - should be even faster)
    console.log('\n🔍 Request 3: CACHE HIT (fetching from Redis)');
    const start3 = Date.now();
    const response3 = await axios.get(`${API_URL}/admin/analytics`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    const time3 = Date.now() - start3;
    console.log(`⏱️  Response Time: ${time3}ms ⚡`);
    
    // Calculate performance improvement
    const improvement = ((time1 - time2) / time1 * 100).toFixed(1);
    const speedup = (time1 / time2).toFixed(1);
    
    console.log('\n📊 Performance Summary:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📍 Request 1 (No Cache):  ${time1}ms`);
    console.log(`⚡ Request 2 (Cached):    ${time2}ms`);
    console.log(`⚡ Request 3 (Cached):    ${time3}ms`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`🚀 Speed Improvement:    ${improvement}% faster`);
    console.log(`🔥 Speedup Factor:       ${speedup}x`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    if (time2 < time1 / 2) {
      console.log('✅ Redis caching is working PERFECTLY! 🎉');
    } else {
      console.log('⚠️  Cache might not be working optimally');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.message || error.message);
  }
}

async function testStudentProgress() {
  try {
    console.log('\n\n👨‍🎓 Testing Student Progress Endpoint with Redis Caching...\n');
    
    // First request (CACHE MISS)
    console.log('🔍 Request 1: CACHE MISS');
    const start1 = Date.now();
    const response1 = await axios.get(`${API_URL}/admin/student-progress`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    const time1 = Date.now() - start1;
    console.log(`⏱️  Response Time: ${time1}ms`);
    console.log(`👥 Students: ${response1.data.students?.length || 0}`);
    
    // Second request (CACHE HIT)
    console.log('\n🔍 Request 2: CACHE HIT');
    const start2 = Date.now();
    const response2 = await axios.get(`${API_URL}/admin/student-progress`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    const time2 = Date.now() - start2;
    console.log(`⏱️  Response Time: ${time2}ms ⚡`);
    console.log(`👥 Students: ${response2.data.students?.length || 0}`);
    
    const improvement = ((time1 - time2) / time1 * 100).toFixed(1);
    console.log(`\n🚀 Performance Improvement: ${improvement}% faster with cache!\n`);
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.message || error.message);
  }
}

async function runTests() {
  console.log('\n╔════════════════════════════════════════════════╗');
  console.log('║   Redis Cache Performance Testing Suite       ║');
  console.log('╚════════════════════════════════════════════════╝\n');
  
  const loggedIn = await login();
  if (!loggedIn) {
    console.log('❌ Cannot proceed without authentication');
    process.exit(1);
  }
  
  await testAnalyticsEndpoint();
  await testStudentProgress();
  
  console.log('\n✅ All tests completed!\n');
  process.exit(0);
}

runTests();
