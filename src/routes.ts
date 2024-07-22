import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { verifyToken } from './auth';
import { Book } from './types';
import dotenv from 'dotenv';
import fs from 'fs-extra';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const router = Router();
const secretKey = process.env.SECRET_KEY || 'defaultsecret';
const usernameAdmin = process.env.USERNAMEADMIN || 'defaultUser';
const passwordAdmin = process.env.PASSWORDADMIN || 'defaultPassword';
const dataFilePath = path.join(__dirname, 'books.json');

// Helper function to validate fields
const validateFields = (fields: object, validFields: string[]): string[] => {
  return Object.keys(fields).filter(field => !validFields.includes(field));
};

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     Book:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the book
 *         title:
 *           type: string
 *           description: Title of the book
 *         description:
 *           type: string
 *           description: Description of the book
 *         pages:
 *           type: integer
 *           nullable: true
 *           description: Number of pages in the book
 *       required:
 *         - id
 *         - title
 *         - description
 *         - pages
 */

const validFields = ['title', 'description', 'pages'];
// Helper function to validate JSON
const isValidJson = (str: string): boolean => {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
};

// Helper function to load books from file
const loadBooks = async (): Promise<{ [key: string]: Book }> => {
  try {
    await fs.ensureDir(path.dirname(dataFilePath));
    await fs.ensureFile(dataFilePath);

    const data = await fs.readFile(dataFilePath, 'utf8');

    if (!data.trim()) {
      console.log('No data found in file, initializing with empty object.');
      await saveBooks({});
      return {};
    }

    if (!isValidJson(data)) {
      console.error('Invalid JSON format in books.json, initializing with empty object.');
      await saveBooks({});
      return {};
    }

    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading books:', error);
    throw error;
  }
};


const saveBooks = async (books: { [key: string]: Book }) => {
  try {
    console.log('Saving books data:', books);
    await fs.writeFile(dataFilePath, JSON.stringify(books, null, 2));
  } catch (error) {
    console.error('Error saving books:', error);
    throw error;
  }
};


/**
 * @swagger
 * /login:
 *   post:
 *     summary: Login and get a JWT token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: The admin username
 *               password:
 *                 type: string
 *                 description: The admin password
 *             required:
 *               - username
 *               - password
 *     responses:
 *       200:
 *         description: Login successful, returns a JWT token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: The JWT token
 *       401:
 *         description: Unauthorized, invalid credentials
 *       500:
 *         description: Internal server error
 */

router.post('/login', (req: Request, res: Response) => {
  const { username: reqUsername, password: reqPassword } = req.body;
  if (reqUsername === usernameAdmin && reqPassword === passwordAdmin) {
    const token = jwt.sign({ username: reqUsername }, secretKey, { expiresIn: '1h' });
    res.json({ token });
  } else {
    res.status(401).send('Unauthorized');
  }
});

/**
 * @swagger
 * /books:
 *   get:
 *     summary: Retrieve a list of all books
 *     security:
 *       - bearerAuth: []
 *     tags: [Books]
 *     responses:
 *       200:
 *         description: A list of books
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Book'
 *       500:
 *         description: Internal server error
 */

router.get('/books', verifyToken, async (req: Request, res: Response) => {
  try {
    const books = await loadBooks();
    res.json(Object.values(books));
  } catch (error) {
    console.error('Error retrieving books:', error);
    res.status(500).send('Error retrieving books');
  }
});

/**
 * @swagger
 * /books/{id}:
 *   put:
 *     summary: Update a book
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The book ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Book'
 *     responses:
 *       200:
 *         description: Book updated successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Book not found
 *       500:
 *         description: Internal server error
 */
router.get('/books/:id', verifyToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const books = await loadBooks();
    const book = books[id];
    if (book) {
      res.json(book);
    } else {
      res.status(404).send('Book not found');
    }
  } catch (error) {
    console.error('Error retrieving book:', error);
    res.status(500).send('Error retrieving book');
  }
});

/**
 * @swagger
 * /books:
 *   post:
 *     summary: Create a new book
 *     security:
 *       - bearerAuth: []
 *     tags: [Books]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               pages:
 *                 type: integer
 *             required:
 *               - title
 *               - description
 *               - pages
 *     responses:
 *       201:
 *         description: Book created successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Internal server error
 */

router.post('/books', verifyToken, async (req: Request, res: Response) => {
  try {
    const { id, title, description = '', pages = null } = req.body;

    // Validate title
    if (!title || title.trim().length < 3) {
      return res.status(400).send('Title must not be empty, whitespace string, or less than 3 characters');
    }

    // Validate pages
    if (req.body.hasOwnProperty('pages')) {
      if (pages === undefined || pages < 1) {
        return res.status(400).send('Pages cannot be empty and must be at least 1');
      }
    }

    // Throw an error if an id is provided
    if (id) {
      return res.status(400).send('Book ID should not be provided');
    }

    // Validate fields
    const invalidFields = validateFields(req.body, validFields);
    if (invalidFields.length > 0) {
      return res.status(400).send(`Invalid fields provided: ${invalidFields.join(', ')}`);
    }

    const book: Book = { id: uuidv4(), title: title.trim(), description, pages };
    const books = await loadBooks();

    if (Object.values(books).some(existingBook => existingBook.title === book.title)) {
      return res.status(400).send('Book with this title already exists');
    }

    books[book.id] = book;
    await saveBooks(books);
    res.status(201).json(book);
  } catch (error) {
    console.error('Error saving book:', error);
    res.status(500).send('Error saving book');
  }
});

/**
 * @swagger
 * /books/{id}:
 *   put:
 *     summary: Replace a book
 *     security:
 *       - bearerAuth: []
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The book ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               pages:
 *                 type: integer
 *             required:
 *               - title
 *               - description
 *               - pages
 *     responses:
 *       200:
 *         description: Book replaced successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Book not found
 *       500:
 *         description: Internal server error
 */

router.put('/books/:id', verifyToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, pages } = req.body;

    // Ensure all fields are present
    if (title === undefined || description === undefined || pages === undefined) {
      return res.status(400).send('All book fields (title, description, pages) must be specified');
    }

    // Check if the request body contains id
    if (req.body.id) {
      return res.status(400).send('Book ID cannot be updated');
    }

    // Validate fields
    const invalidFields = validateFields(req.body, validFields);
    if (invalidFields.length > 0) {
      return res.status(400).send(`Invalid fields provided: ${invalidFields.join(', ')}`);
    }

    const books = await loadBooks();

    if (books[id]) {
      books[id] = { ...books[id], title, description, pages }; // Replace the book with new fields
      await saveBooks(books);
      res.json(books[id]);
    } else {
      res.status(404).send('Book not found');
    }
  } catch (error) {
    console.error('Error replacing book:', error);
    res.status(500).send('Error replacing book');
  }
});

/**
 * @swagger
 * /books/{id}:
 *   delete:
 *     summary: Delete a book
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The book ID
 *     responses:
 *       204:
 *         description: Book deleted successfully
 *       404:
 *         description: Book not found
 *       500:
 *         description: Internal server error
 */

router.delete('/books/:id', verifyToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const books = await loadBooks();
    if (books[id]) {
      delete books[id];
      await saveBooks(books);
      res.sendStatus(204);
    } else {
      res.status(404).send('Book not found');
    }
  } catch (error) {
    console.error('Error deleting book:', error);
    res.status(500).send('Error deleting book');
  }
});

/**
 * @swagger
 * /books:
 *   delete:
 *     summary: Delete all books
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: All books deleted successfully
 *       500:
 *         description: Internal server error
 */

router.delete('/books', verifyToken, async (req: Request, res: Response) => {
  try {
    await saveBooks({});
    res.sendStatus(204);
  } catch (error) {
    console.error('Error deleting all books:', error);
    res.status(500).send('Error deleting all books');
  }
});

/**
 * @swagger
 * /books-pages/paginate:
 *   get:
 *     summary: Paginate books
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: The page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: The number of books per page
 *     responses:
 *       200:
 *         description: A paginated list of books
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Book'
 *       500:
 *         description: Internal server error
 */


router.get('/books-pages/paginate', verifyToken, async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    console.log(`Page: ${page}, Limit: ${limit}`); // Log the received page and limit

    const books = Object.values(await loadBooks());
    console.log('Loaded books:', books); // Log the loaded books

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedBooks = books.slice(startIndex, endIndex);

    console.log('Paginated books:', paginatedBooks); // Log paginated books

    if (paginatedBooks.length === 0) {
      res.status(404).send('No books found');
      return;
    }

    res.json(paginatedBooks);
  } catch (error) {
    console.error('Error paginating books:', error);
    res.status(500).send('Error paginating books');
  }
});


/**
 * @swagger
 * /books/filter/title:
 *   get:
 *     summary: Filter books by title
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: title
 *         schema:
 *           type: string
 *         description: The title of the book
 *     responses:
 *       200:
 *         description: A list of books filtered by title
 *       500:
 *         description: Internal server error
 */

router.get('/books/filter/title', verifyToken, async (req: Request, res: Response) => {
  try {
    const { title } = req.query;
    const books = Object.values(await loadBooks());
    const filteredBooks = books.filter(book => book.title.includes(title as string));
    res.json(filteredBooks);
  } catch (error) {
    console.error('Error filtering books by title:', error);
    res.status(500).send('Error filtering books by title');
  }
});

/**
 * @swagger
 * /books/filter/description:
 *   get:
 *     summary: Filter books by description
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: description
 *         schema:
 *           type: string
 *         description: The description of the book
 *     responses:
 *       200:
 *         description: A list of books filtered by description
 *       500:
 *         description: Internal server error
 */

router.get('/books/filter/description', verifyToken, async (req: Request, res: Response) => {
  try {
    const { description } = req.query;
    const books = Object.values(await loadBooks());
    const filteredBooks = books.filter(book => book.description.includes(description as string));
    res.json(filteredBooks);
  } catch (error) {
    console.error('Error filtering books by description:', error);
    res.status(500).send('Error filtering books by description');
  }
});

/**
 * @swagger
 * /books/filter/pages:
 *   get:
 *     summary: Filter books by pages
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: pages
 *         schema:
 *           type: integer
 *         description: The number of pages in the book
 *     responses:
 *       200:
 *         description: A list of books filtered by pages
 *       500:
 *         description: Internal server error
 */

router.get('/books/filter/pages', verifyToken, async (req: Request, res: Response) => {
  try {
    const { pages } = req.query;
    const books = Object.values(await loadBooks());
    const filteredBooks = books.filter(book => book.pages === Number(pages));
    res.json(filteredBooks);
  } catch (error) {
    console.error('Error filtering books by pages:', error);
    res.status(500).send('Error filtering books by pages');
  }
});

/**
 * @swagger
 * /books/{id}:
 *   patch:
 *     summary: Partially update a book
 *     security:
 *       - bearerAuth: []
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The book ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               pages:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Book updated successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Book not found
 *       500:
 *         description: Internal server error
 */

router.patch('/books/:id', verifyToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if the request body contains id
    if (req.body.id) {
      return res.status(400).send('Book ID cannot be updated');
    }

    // Ensure at least one field is being updated
    const { title, description, pages } = req.body;
    if (title === undefined && description === undefined && pages === undefined) {
      return res.status(400).send('At least one book field (title, description, pages) must be specified');
    }

    // Validate fields
    const invalidFields = validateFields(req.body, validFields);
    if (invalidFields.length > 0) {
      return res.status(400).send(`Invalid fields provided: ${invalidFields.join(', ')}`);
    }

    const books = await loadBooks();

    if (books[id]) {
      books[id] = { ...books[id], ...req.body }; // Merge existing book with new fields
      await saveBooks(books);
      res.json(books[id]);
    } else {
      res.status(404).send('Book not found');
    }
  } catch (error) {
    console.error('Error patching book:', error);
    res.status(500).send('Error patching book');
  }
});

export default router;