import express from 'express';
import swaggerUi from 'swagger-ui-express';
import specs from './swagger';
import dotenv from 'dotenv';
import path from 'path';
import routes from './routes';

dotenv.config();

console.log('Environment:', process.env.NODE_ENV);
console.log('Current working directory:', process.cwd());
console.log('__dirname:', __dirname);

const CSS_URL =
  "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.3.0/swagger-ui.min.css";

  const customCss = `
  .swagger-ui .opblock-summary-path {
    white-space: nowrap !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
    display: inline-block !important;
    vertical-align: middle !important;
  }
  .swagger-ui .opblock-summary-path a {
    text-decoration: none !important;
    color: inherit !important;
  }
  .swagger-ui .opblock-summary-description {
    text-align: left !important;
    white-space: nowrap !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
    display: inline-block !important;
    vertical-align: middle !important;
  }
  .swagger-ui .opblock-summary {
    display: flex !important;
    justify-content: space-between !important;
    align-items: center !important;
  }
  .swagger-ui .opblock-summary-method, 
  .swagger-ui .opblock-summary-description, 
  .swagger-ui .opblock-summary-operation-id {
    display: inline-block !important;
    vertical-align: middle !important;
  }
  .swagger-ui .info .title {
    font-size: 24px !important;
    font-weight: bold !important;
    color: #333 !important;
    display: block !important;
    text-align: center !important;
    margin-bottom: 20px !important;
  }
`;

const customOptions = {
  customCss: customCss,
  customCssUrl: CSS_URL,
  customSiteTitle: "Book API Documentation",
  swaggerOptions: {
    deepLinking: true,
    displayOperationId: true,
  }
};

const app = express();

app.use(express.json());

// Middleware to serve static files
app.use(express.static(path.join(__dirname, '../public')));

app.use('/custom-swagger.css', express.static(path.join(__dirname, '../public/custom-swagger.css')));

// Swagger UI route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, customOptions));
// app.use(
//   "/api-docs",
//   swaggerUi.serve,
//   swaggerUi.setup(specs, { 
//     customCssUrl: CSS_URL,
//     customSiteTitle: "Book API Documentation"
//   })
// );

app.get('/v1/swagger.json', (req, res) => {
  res.json(specs);
});

// API routes
app.use('/api', routes);

console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`Current working directory: ${process.cwd()}`);
console.log(`API routes file path: ${path.join(process.cwd(), 'src', 'routes.ts')}`);


const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
  console.log(`Swagger UI available at http://localhost:${port}/api-docs`);
  console.log(`API served on http://localhost:${port}/api/books`);
  console.log(`Static HTML available at http://localhost:${port}/`);
});