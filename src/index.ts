import express from 'express';
import swaggerUi from 'swagger-ui-express';
import specs from './swagger';
import dotenv from 'dotenv';
import path from 'path';
import routes from './routes/routes';

dotenv.config();

const CSS_URL =
  "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.3.0/swagger-ui.min.css";

const app = express();

app.use(express.json());

// Middleware to serve static files
app.use(express.static(path.join(__dirname, '../public')));

// Swagger UI route
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(specs, { customCssUrl: CSS_URL })
);

app.get('/v1/swagger.json', (req, res) => {
  // console.log('Swagger specs:', JSON.stringify(specs, null, 2))
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
  console.log(`Static HTML available at http://localhost:${port}/`)
});