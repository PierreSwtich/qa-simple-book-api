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

// CDN CSS for Swagger UI
const CSS_URL = "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.0.1/swagger-ui.min.css";
const BUNDLE_JS = "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.0.1/swagger-ui-bundle.min.js";
const STANDALONE_PRESET_JS_URL = "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.0.1/swagger-ui-standalone-preset.min.js";

// Swagger UI route
// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Set up Swagger UI with CDN CSS
const customJs = `
<script src="${BUNDLE_JS}"></script>
<script src="${STANDALONE_PRESET_JS_URL}"></script>
<script>
window.onload = function() {
  const ui = SwaggerUIBundle({
    url: "/api-docs/swagger.json",
    dom_id: '#swagger-ui',
    presets: [
      SwaggerUIBundle.presets.apis,
      SwaggerUIStandalonePreset
    ],
    layout: "StandaloneLayout"
  });
  window.ui = ui;
}
</script>`;

app.use('/api-docs', swaggerUi.serve);
app.get('/api-docs', swaggerUi.setup(specs, {
  customCssUrl: CSS_URL,
  customJs: customJs,
  swaggerOptions: {
    url: '/api-docs/swagger.json'
  }
}));

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