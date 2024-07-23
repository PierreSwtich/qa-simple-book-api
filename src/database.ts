import { Sequelize, DataTypes, Model, Optional } from 'sequelize';

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
