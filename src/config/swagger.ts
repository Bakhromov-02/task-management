import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Task Management API TEST',
      version: '1.0.0',
      description: 'A task management system',
    },
    servers: [
      {
        // url: process.env.NODE_ENV === 'production' 
        //   ? 'https://your-domain.com/api' 
        //   : `http://localhost:${process.env.PORT || 8000}/api`,
        url: '/api/',
        description: process.env.NODE_ENV === 'production' ? 'Production' : 'Development'
      }
    ]
  },
  apis: [
    './src/swagger/*.yaml'
  ]
};

export const swaggerSpec = swaggerJsdoc(options);