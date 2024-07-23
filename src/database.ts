import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import { sql } from '@vercel/postgres';

// Define the attributes of the Book model
interface BookAttributes {
  id: string;
  title: string;
  description?: string;
  pages: number;
}

// Define creation attributes
interface BookCreationAttributes extends Optional<BookAttributes, 'id'> {}

// Define the Book model
class Book extends Model<BookAttributes, BookCreationAttributes> implements BookAttributes {
  public id!: string;
  public title!: string;
  public description!: string;
  public pages!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

const sequelize = new Sequelize(process.env.POSTGRES_URL!, {
  dialect: 'postgres',
  protocol: 'postgres',
  dialectModule: sql, // Use @vercel/postgres for the dialect
  logging: false, // Disable logging; default: console.log
});

// Initialize the Book model
Book.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    pages: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'Book',
  }
);

const initializeDatabase = async () => {
  await sequelize.sync({ force: true });
};

export { sequelize, Book, initializeDatabase };

// Create the Books table if it doesn't exist
const createTable = async () => {
  await sql`
    CREATE TABLE IF NOT EXISTS Books (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title VARCHAR NOT NULL,
      description TEXT,
      pages INT NOT NULL,
      createdAt TIMESTAMPTZ DEFAULT now(),
      updatedAt TIMESTAMPTZ DEFAULT now()
    );
  `;
};

// Insert a new book
const insertBook = async (title: string, description: string, pages: number) => {
  const result = await sql`
    INSERT INTO Books (title, description, pages)
    VALUES (${title}, ${description}, ${pages})
    RETURNING *;
  `;
  return result.rows[0];
};

// Get all books
const getBooks = async () => {
  const result = await sql`SELECT * FROM Books;`;
  return result.rows;
};

// Get a book by ID
const getBookById = async (id: string) => {
  const result = await sql`SELECT * FROM Books WHERE id = ${id};`;
  return result.rows[0];
};

// Update a book by ID
const updateBookById = async (id: string, title: string, description: string, pages: number) => {
  const result = await sql`
    UPDATE Books
    SET title = ${title}, description = ${description}, pages = ${pages}, updatedAt = now()
    WHERE id = ${id}
    RETURNING *;
  `;
  return result.rows[0];
};

// Delete a book by ID
const deleteBookById = async (id: string) => {
  const result = await sql`DELETE FROM Books WHERE id = ${id} RETURNING *;`;
  return result.rows[0];
};

// Delete all books
const deleteAllBooks = async () => {
  await sql`DELETE FROM Books;`;
};

// Get paginated books
const getPaginatedBooks = async (page: number, limit: number) => {
  const offset = (page - 1) * limit;
  const result = await sql`SELECT * FROM Books LIMIT ${limit} OFFSET ${offset};`;
  return result.rows;
};

// Filter books by title
const filterBooksByTitle = async (title: string) => {
  const result = await sql`SELECT * FROM Books WHERE title ILIKE ${'%' + title + '%'};`;
  return result.rows;
};

// Filter books by description
const filterBooksByDescription = async (description: string) => {
  const result = await sql`SELECT * FROM Books WHERE description ILIKE ${'%' + description + '%'};`;
  return result.rows;
};

// Filter books by pages
const filterBooksByPages = async (pages: number) => {
  const result = await sql`SELECT * FROM Books WHERE pages = ${pages};`;
  return result.rows;
};

export {
  createTable,
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
};
