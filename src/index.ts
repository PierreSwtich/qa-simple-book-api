import express from 'express';
import swaggerUi from 'swagger-ui-express';
import specs from './swagger';
import dotenv from 'dotenv';
import path from 'path';
import routes from './routes';
import { initializeDatabase } from './database';  // Import the initializeDatabase function

dotenv.config();
const CSS_URL = "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.3.0/swagger-ui.min.css";

const customCss = `
  .opblock-summary-description {
    padding-left: 10px;
  }
  .opblock-summary-path {
    display: inline !important;
  }
`;

const customOptions = {
  customCss: customCss,
  customCssUrl: CSS_URL,
  customSiteTitle: "Book API Documentation",
  swaggerOptions: {
    deepLinking: true,
    displayOperationId: false,
  }
};

const app = express();

app.use(express.json());

// Middleware to log requests
app.use((req, res, next) => {
  console.log(`Request URL: ${req.url}`);
  next();
});

// Middleware to serve static files
app.use(express.static(path.join(__dirname, '../public')));

// Swagger UI route
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(specs, customOptions)
);

app.get('/api-docs/swagger.json', (req, res) => {
  console.log('Swagger specs:', JSON.stringify(specs, null, 2));  // Log the specs to check content
  res.json(specs);
});

// API routes
app.use('/api', routes);

const port = process.env.PORT || 3000;
initializeDatabase().then(() => {
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
    console.log(`Swagger UI available at http://localhost:${port}/api-docs`);
    console.log(`API served on http://localhost:${port}/api/books`);
    console.log(`Static HTML available at http://localhost:${port}/`);
    console.log(`Current working directory: ${process.cwd()}`);
    console.log(`Routes file path: ${path.join(process.cwd(), 'src', 'routes.ts')}`);
  });
});