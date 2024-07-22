// import swaggerJSDoc from 'swagger-jsdoc';
// import path from 'path';
// import fs from 'fs'

// const currentDir = __dirname;
// console.log('Current directory:', currentDir);
// console.log('Current working directory:', process.cwd());
// console.log('Files in current directory:', fs.readdirSync(process.cwd()));
// console.log('Files in src directory:', fs.readdirSync(path.join(process.cwd(), 'src')));

// const tsFiles = fs.readdirSync(currentDir).filter(file => file.endsWith('.ts'));
// console.log('TS files found:', tsFiles);

// const options = {
//   definition: {
//     openapi: '3.1.0',
//     info: {
//       title: 'Book API',
//       version: '1.0.0',
//       description: 'API documentation for the Book API'
//     },
//     servers: [
//       {
//         url: 'https://qa-simple-book-api.vercel.app/api',
//         description: 'Production server'
//       },
//       {
//         url: 'http://localhost:3000/api',
//         description: 'Development server'
//       }
//     ]
//   },
//   apis: [`${__dirname}/*.ts`] // paths to files containing OpenAPI annotations
// };

// const specs = swaggerJSDoc(options);
// console.log('Generated Swagger spec:', JSON.stringify(specs, null, 2));

// export default specs;

import swaggerJSDoc from 'swagger-jsdoc';
import YAML from 'yamljs';
import path from 'path';

const swaggerDocument = YAML.load(path.join(__dirname, './swagger/books.yaml'));

const specs = swaggerJSDoc({
  swaggerDefinition: swaggerDocument,
  apis: [], // We don't need to specify API files as everything is in the YAML
});

export default specs;