import express from 'express';
import swaggerUi from 'swagger-ui-express';
import specs from './swagger';
import dotenv from 'dotenv';
import path from 'path';
import routes from './routes';

dotenv.config();
const CSS_URL =
  "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.3.0/swagger-ui.min.css";

const app = express();

app.use(express.json());

// Middleware to serve static files
app.use(express.static(path.join(__dirname, '../public')));

// Swagger UI route
// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Serve Swagger specification
// const options = { customCssUrl: 'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.3.0/swagger-ui.css' };
// const spec = JSON.parse(
//     fs.readFileSync(path.join(__dirname, './books.json'), 'utf8')
// );
// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, options));

// Serve Swagger specification separately
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(specs, { customCssUrl: CSS_URL })
);

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