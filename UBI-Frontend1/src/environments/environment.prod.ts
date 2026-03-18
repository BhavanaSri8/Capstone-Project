export const environment = {
    production: true,
    development: false,
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
