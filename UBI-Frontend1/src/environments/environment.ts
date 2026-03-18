export const environment = {
  production: false,
  development: true,
  apiUrl: 'http://localhost:8080/api',
  appName: 'DriveIQ',
  demoCredentials: {
    admin: {
      email: 'bhavana@gmail.com',
      password: 'Bhavana@12',
      role: 'ADMIN'
    }
  },
  availableRoles: ['CUSTOMER', 'CLAIMS_OFFICER']
};
