import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { verifyToken } from './auth';
// import { Book } from './types';
import dotenv from 'dotenv';
import fs from 'fs-extra';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Book } from './database'
import { Op } from 'sequelize';

dotenv.config();


const router = Router();
const secretKey = process.env.SECRET_KEY || 'defaultsecret';
const usernameAdmin = process.env.USERNAMEADMIN || 'defaultUser';
const passwordAdmin = process.env.PASSWORDADMIN || 'defaultPassword';
const dataFilePath = path.join(__dirname, 'books.json');

router.post('/login', (req: Request, res: Response) => {
  const { username: reqUsername, password: reqPassword } = req.body;
  if (reqUsername === usernameAdmin && reqPassword === passwordAdmin) {
    const token = jwt.sign({ username: reqUsername }, secretKey, { expiresIn: '1h' });
    res.json({ token });
  } else {
    res.status(401).send('Unauthorized');
  }
});

router.get('/books', verifyToken, async (req: Request, res: Response) => {
  try {
    const books = await Book.findAll();
    res.json(books);
  } catch (error) {
    console.error('Error retrieving books:', error);
    res.status(500).send('Error retrieving books');
  }
});


router.get('/books/:id', verifyToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const book = await Book.findByPk(id);
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


router.post('/books', verifyToken, async (req: Request, res: Response) => {
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

    const book = await Book.create({ title: title.trim(), description, pages });
    res.status(201).json(book);
  } catch (error) {
    console.error('Error saving book:', error);
    res.status(500).send('Error saving book');
  }
});


router.put('/books/:id', verifyToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, pages } = req.body;
    if (!title || !description) {
      return res.status(400).send('Title and description are required');
    }

    const book = await Book.findByPk(id);
    if (book) {
      book.title = title;
      book.description = description;
      book.pages = pages;
      await book.save();
      res.json(book);
    } else {
      res.status(404).send('Book not found');
    }
  } catch (error) {
    console.error('Error updating book:', error);
    res.status(500).send('Error updating book');
  }
});


router.delete('/books/:id', verifyToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const book = await Book.findByPk(id);
    if (book) {
      await book.destroy();
      res.sendStatus(204);
    } else {
      res.status(404).send('Book not found');
    }
  } catch (error) {
    console.error('Error deleting book:', error);
    res.status(500).send('Error deleting book');
  }
});


router.delete('/books', verifyToken, async (req: Request, res: Response) => {
  try {
    await Book.destroy({ where: {}, truncate: true });
    res.sendStatus(204);
  } catch (error) {
    console.error('Error deleting all books:', error);
    res.status(500).send('Error deleting all books');
  }
});



router.get('/books-pages/paginate', verifyToken, async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const books = await Book.findAndCountAll({
      limit: Number(limit),
      offset: (Number(page) - 1) * Number(limit),
    });
    res.json({
      totalItems: books.count,
      totalPages: Math.ceil(books.count / Number(limit)),
      currentPage: Number(page),
      books: books.rows
    });
  } catch (error) {
    console.error('Error paginating books:', error);
    res.status(500).send('Error paginating books');
  }
});



router.get('/books/filter/title', verifyToken, async (req: Request, res: Response) => {
  try {
    const { title } = req.query;
    const books = await Book.findAll({
      where: {
        title: {
          [Op.like]: `%${title}%`
        }
      }
    });
    res.json(books);
  } catch (error) {
    console.error('Error filtering books by title:', error);
    res.status(500).send('Error filtering books by title');
  }
});


router.get('/books/filter/description', verifyToken, async (req: Request, res: Response) => {
  try {
    const { description } = req.query;
    const books = await Book.findAll({
      where: {
        description: {
          [Op.like]: `%${description}%`
        }
      }
    });
    res.json(books);
  } catch (error) {
    console.error('Error filtering books by description:', error);
    res.status(500).send('Error filtering books by description');
  }
});


router.patch('/books/:id', verifyToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const book = await Book.findByPk(id);
    if (book) {
      Object.assign(book, updates);
      await book.save();
      res.json(book);
    } else {
      res.status(404).send('Book not found');
    }
  } catch (error) {
    console.error('Error updating book:', error);
    res.status(500).send('Error updating book');
  }
});

export default router;