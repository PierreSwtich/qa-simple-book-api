import { Router, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { verifyToken } from './auth';
import dotenv from 'dotenv';
import path from 'path';
import { Book } from './database'
import { Op } from 'sequelize';
import {
  insertBook,
  getBooks,
  getBookById,
  updateBookById,
  deleteBookById,
  deleteAllBooks,
  getPaginatedBooks,
  filterBooksByTitle,
  filterBooksByDescription,
  filterBooksByPages
} from './database';

dotenv.config();


const router = Router();

const secretKey = process.env.SECRET_KEY || 'defaultsecret';
const usernameAdmin = process.env.USERNAMEADMIN || 'defaultUser';
const passwordAdmin = process.env.PASSWORDADMIN || 'defaultPassword';

router.post('/login', (req: Request, res: Response) => {
  const { username: reqUsername, password: reqPassword } = req.body;
  if (reqUsername === usernameAdmin && reqPassword === passwordAdmin) {
    const token = jwt.sign({ username: reqUsername }, secretKey, { expiresIn: '1h' });
    res.json({ token });
  } else {
    res.status(401).send('Unauthorized');
  }
});

// POST /books - Create a new book
router.post('/books', verifyToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, description, pages } = req.body;

    // Validation
    if (!title || typeof title !== 'string' || title.trim().length < 3) {
      return res.status(400).send('Title must be at least 3 characters long.');
    }
    if (pages === undefined || typeof pages !== 'number' || pages < 1) {
      return res.status(400).send('Pages must be a number and at least 1.');
    }
    if (description !== undefined && typeof description !== 'string') {
      return res.status(400).send('Description must be a string.');
    }

    const book = await insertBook(title.trim(), description, pages);
    res.status(201).json(book);
  } catch (error) {
    console.error('Error saving book:', error);
    next(error); // Pass the error to the error handling middleware
  }
});

// GET /books - Retrieve all books
router.get('/books', verifyToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const books = await getBooks();
    res.json(books);
  } catch (error) {
    console.error('Error retrieving books:', error);
    next(error); // Pass the error to the error handling middleware
  }
});

// GET /books/:id - Retrieve a specific book by its ID
router.get('/books/:id', verifyToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const book = await getBookById(id);
    if (book) {
      res.json(book);
    } else {
      res.status(404).send('Book not found');
    }
  } catch (error) {
    console.error('Error retrieving book:', error);
    next(error); // Pass the error to the error handling middleware
  }
});

// PUT /books/:id - Update a book by its ID
router.put('/books/:id', verifyToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { title, description, pages } = req.body;

    // Ensure all fields are present
    if (title === undefined || description === undefined || pages === undefined) {
      return res.status(400).send('All book fields (title, description, pages) must be specified');
    }

    // Validation
    if (typeof title !== 'string' || title.trim().length < 3) {
      return res.status(400).send('Title must be at least 3 characters long.');
    }
    if (typeof pages !== 'number' || pages < 1) {
      return res.status(400).send('Pages must be a number and at least 1.');
    }
    if (typeof description !== 'string') {
      return res.status(400).send('Description must be a string.');
    }

    const book = await updateBookById(id, title.trim(), description, pages);
    if (book) {
      res.json(book);
    } else {
      res.status(404).send('Book not found');
    }
  } catch (error) {
    console.error('Error updating book:', error);
    next(error); // Pass the error to the error handling middleware
  }
});

// PATCH /books/:id - Partially update a book by its ID
router.patch('/books/:id', verifyToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { title, description, pages } = req.body;

    // Fetch the current book details
    const existingBook = await getBookById(id);
    if (!existingBook) {
      return res.status(404).send('Book not found');
    }

    // Update only provided fields
    const updatedTitle = title !== undefined ? title.trim() : existingBook.title;
    const updatedDescription = description !== undefined ? description : existingBook.description;
    const updatedPages = pages !== undefined ? pages : existingBook.pages;

    // Validation
    if (updatedTitle !== existingBook.title && (typeof updatedTitle !== 'string' || updatedTitle.length < 3)) {
      return res.status(400).send('Title must be at least 3 characters long.');
    }
    if (updatedPages !== existingBook.pages && (typeof updatedPages !== 'number' || updatedPages < 1)) {
      return res.status(400).send('Pages must be a number and at least 1.');
    }
    if (updatedDescription !== existingBook.description && typeof updatedDescription !== 'string') {
      return res.status(400).send('Description must be a string.');
    }

    const book = await updateBookById(id, updatedTitle, updatedDescription, updatedPages);
    res.json(book);
  } catch (error) {
    console.error('Error updating book:', error);
    next(error); // Pass the error to the error handling middleware
  }
});

// DELETE /books/:id - Delete a book by its ID
router.delete('/books/:id', verifyToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const book = await deleteBookById(id);
    if (book) {
      res.sendStatus(204);
    } else {
      res.status(404).send('Book not found');
    }
  } catch (error) {
    console.error('Error deleting book:', error);
    next(error); // Pass the error to the error handling middleware
  }
});

// DELETE /books - Delete all books
router.delete('/books', verifyToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await deleteAllBooks();
    res.sendStatus(204);
  } catch (error) {
    console.error('Error deleting all books:', error);
    next(error); // Pass the error to the error handling middleware
  }
});

// GET /books-pages/paginate - Paginate books
router.get('/books-pages/paginate', verifyToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const paginatedBooks = await getPaginatedBooks(Number(page), Number(limit));
    res.json(paginatedBooks);
  } catch (error) {
    console.error('Error paginating books:', error);
    next(error); // Pass the error to the error handling middleware
  }
});

// GET /books/filter/title - Filter books by title
router.get('/books/filter/title', verifyToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title } = req.query;
    const filteredBooks = await filterBooksByTitle(title as string);
    res.json(filteredBooks);
  } catch (error) {
    console.error('Error filtering books by title:', error);
    next(error); // Pass the error to the error handling middleware
  }
});

// GET /books/filter/description - Filter books by description
router.get('/books/filter/description', verifyToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { description } = req.query;
    const filteredBooks = await filterBooksByDescription(description as string);
    res.json(filteredBooks);
  } catch (error) {
    console.error('Error filtering books by description:', error);
    next(error); // Pass the error to the error handling middleware
  }
});

// GET /books/filter/pages - Filter books by pages
router.get('/books/filter/pages', verifyToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { pages } = req.query;
    const filteredBooks = await filterBooksByPages(Number(pages));
    res.json(filteredBooks);
  } catch (error) {
    console.error('Error filtering books by pages:', error);
    next(error); // Pass the error to the error handling middleware
  }
});

export default router;