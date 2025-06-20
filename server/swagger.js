const path = require('path');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'DONKI API',
      version: '1.0.0',
      description: 'Documentation of API with Swagger',
    },
    servers: [
      {
        url: 'http://localhost:3000/api',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: [path.join(__dirname, 'routes', '*.js')], 
};

const swaggerJSDoc = require('swagger-jsdoc');
const swaggerSpec = swaggerJSDoc(options);
module.exports = swaggerSpec;