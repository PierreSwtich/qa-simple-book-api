import express from 'express';
import swaggerUi from 'swagger-ui-express';
import specs from './swagger';
import dotenv from 'dotenv';
import routes from './routes';
import path from 'path';

dotenv.config();

const app = express();

app.use(express.json());

// Serve Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

app.use('/api', routes);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
  console.log(`API running on http://localhost:${port}/api/books`);
  console.log(`Swagger UI available at http://localhost:${port}/api-docs`);
  console.log(`Static HTML available at http://localhost:${port}/`)
});