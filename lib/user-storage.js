// lib/user-storage.js
// Shared in-memory user storage for testing
const users = new Map();

// Initialize with test users only if not already present
function initializeTestUsers() {
  if (users.size === 0) {
    users.set('test@churchflow.com', {
      id: '1',
      email: 'test@churchflow.com',
      name: 'Test User',
      role: 'ADMIN',
      password: 'TestPassword123!'
    });

    users.set('admin@churchflow.com', {
      id: '2',
      email: 'admin@churchflow.com',
      name: 'Admin User',
      role: 'ADMIN',
      password: 'AdminPassword123!'
    });

    users.set('member@churchflow.com', {
      id: '3',
      email: 'member@churchflow.com',
      name: 'Member User',
      role: 'MEMBER',
      password: 'MemberPassword123!'
    });
  }
}

function getUserByEmail(email) {
  initializeTestUsers();
  return users.get(email);
}

function createUser(userData) {
  initializeTestUsers();
  const newUser = {
    id: Date.now().toString(),
    email: userData.email,
    name: userData.fullName,
    role: userData.role || 'MEMBER',
    password: userData.password
  };
  users.set(userData.email, newUser);
  return newUser;
}

function userExists(email) {
  initializeTestUsers();
  return users.has(email);
}

function getAllUsers() {
  initializeTestUsers();
  return Array.from(users.values());
}

export { getUserByEmail, createUser, userExists, getAllUsers };


