import swaggerJSDoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.1.0',
    info: {
      title: 'Book API',
      version: '1.0.0',
      description: 'API documentation for the Book API'
    },
    servers: [
      {
        url: 'https://qa-simple-book-api.vercel.app/api',
        description: 'Production server'
      },
      {
        url: 'http://localhost:3000/api',
        description: 'Development server'
      }
    ]
  },
  apis: ['./src/routes.ts'], // paths to files containing OpenAPI annotations
};

const specs = swaggerJSDoc(options);

export default specs;