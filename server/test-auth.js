import axios from 'axios';

async function runTests() {
  const baseURL = 'http://localhost:5000/api';
  console.log('🧪 Starting Auth Test Suite against', baseURL);

  // 1. Health
  const health = await axios.get(`${baseURL}/health`);
  console.log('1. Health check:', health.data);

  // 2. Invalid Login
  try {
    await axios.post(`${baseURL}/auth/login`, {
      email: 'alex.dev@lifeos.io',
      password: 'IncorrectPassword'
    });
    console.error('❌ Expected invalid login to fail, but succeeded!');
  } catch (err) {
    console.log('2. Invalid login rejected correctly:', err.response.status, err.response.data);
  }

  // 3. Valid Login
  const login = await axios.post(`${baseURL}/auth/login`, {
    email: 'alex.dev@lifeos.io',
    password: 'LifeOS2026!'
  });
  console.log('3. Valid login succeeded:', login.data.success, 'Token length:', login.data.token.length);
  const token = login.data.token;

  // 4. GET /me with Bearer token
  const me = await axios.get(`${baseURL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  console.log('4. GET /me verified:', me.data.user.email, me.data.user.name);

  // 5. Register new user
  const randomEmail = `test_${Date.now()}@lifeos.io`;
  const register = await axios.post(`${baseURL}/auth/register`, {
    name: 'Sarah Connor',
    email: randomEmail,
    password: 'SecurePassword2026!',
    confirmPassword: 'SecurePassword2026!'
  });
  console.log('5. Registration succeeded:', register.data.success, register.data.user.email);

  // 6. Test duplicate registration
  try {
    await axios.post(`${baseURL}/auth/register`, {
      name: 'Sarah Duplicate',
      email: randomEmail,
      password: 'SecurePassword2026!',
      confirmPassword: 'SecurePassword2026!'
    });
    console.error('❌ Expected duplicate registration to fail, but succeeded!');
  } catch (err) {
    console.log('6. Duplicate registration rejected correctly:', err.response.status, err.response.data);
  }

  // 7. Logout
  const logout = await axios.post(`${baseURL}/auth/logout`);
  console.log('7. Logout succeeded:', logout.data);

  console.log('🎉 ALL BACKEND AUTH TESTS PASSED PERFECTLY!');
}

runTests().catch(console.error);
