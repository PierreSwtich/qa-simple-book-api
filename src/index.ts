import express from 'express';
import swaggerUi from 'swagger-ui-express';
import specs from './swagger';
import dotenv from 'dotenv';
import path from 'path';
import routes from './routes';

dotenv.config();

const app = express();

app.use(express.json());

// Middleware to serve static files
app.use(express.static(path.join(__dirname, '../public')));

// Swagger UI route
// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Serve Swagger specification
app.get('/api-docs/swagger.json', (req, res) => {
  res.json(specs);
});

// Serve custom Swagger UI
app.get('/api-docs', (req, res) => {
  res.sendFile(path.join(__dirname, 'swagger-ui.html'));
});

// Serve Swagger specification separately
app.get('/api-docs/swagger.json', (req, res) => {
  res.json(specs);
});

// API routes
app.use('/api', routes);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
  console.log(`Swagger UI available at http://localhost:${port}/api-docs`);
  console.log(`API served on http://localhost:${port}/api/books`);
  console.log(`Static HTML available at http://localhost:${port}/`)
});