const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Internship Management API', // Replace with your app title
      version: '1.0.0',
      description: 'API documentation for the internship management system',
    },
    servers: [
      {
        url: 'http://localhost:3000/api/internship', // Replace with your server URL
        description: 'Local server',
      },
    ],
  },
  apis: ['./routes/*.js'], // Path to your route files
};

const swaggerSpec = swaggerJsdoc(options);

const setupSwagger = (app) => {
    console.log(JSON.stringify(swaggerSpec, null, 2));

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log('Swagger docs available at http://localhost:3000/api-docs');
};

module.exports = setupSwagger;
