import { ApolloServer } from "@apollo/server"
import { GraphQLError } from 'graphql'
import { startStandaloneServer } from '@apollo/server/standalone';
import { v1 as uuid } from "uuid"
import { log } from "console";
const books = [
  {
    id : uuid(),
    title: 'The Awakening',
    author: 'Kate Chopin',
    year: 1986,
    edition: 'second'
  },
  {
    id : uuid(),
    title: 'City of Glass',
    author: 'Paul Auster',
    year: 1953,
    edition: 'first'

  },
  {
    id : uuid(),
    title: 'the Hunger games',
    author: 'Suzanne Collins',
    year: 2020,
    edition: "third"
  },
  {
    id : uuid(),
    title: 'the hunger games catching fire',
    author: 'Suzanne Collins',
    edition: "third"
  },
];

const typeDefs = `#graphql
# This "Book" type defines the queryable fields for every book in our data source.
  enum YesNo {
    YES
    NO
  }
  type Addition {
    edition : String!
    year : Int!
  }  
  type Editorial {
    complete : String!
  } 
  type Book {
    id : String
    title : String!
    author : String!
    year : Int
    addition : Addition!
    editorial : Editorial!
    edition : String!
  }
  type Query {
    allBooks (year : YesNo):[Book]!
    bookCount : Int!
    findBook(title : String!) : Book
  }
  type Mutation {
    addBook(
      title:String!,
      author:String!,
      year:Int!,
      edition:String!,
    ) : Book
    editYear(
      title:String!
      year:Int!
    ): Book
    updateBook (
      title:String!,
      newTitle:String!
      author:String!,
      year:Int!,
      edition:String!,
    ) : Book
  }
`

const resolvers = {
  Query: {
    allBooks: (root, args) => {
      if (!args.year) return books;
      return books.filter(book => args.year === "YES" ? book.year : !book.year)
    },
    bookCount: () => books.length,
    findBook: (root, { title }) => books.find(book => book.title === title)
  },
  Mutation: {
    addBook: (root, args) => {
      if (books.find(book => book.title === args.title)) {
        throw new GraphQLError('Name must be unique', {
          extensions: {
            code: 'BAD_USER_INPUT',
            argumentName: 'name',
          },
        });
      } else {
        const book = {
          id: uuid(),
          ...args
        }
        books.push(book);
        console.log("success");
        
        return book;
      }
    },
    editYear: ( args) => {
      const bookIndex = books.findIndex(book => book.title === args.title);
      if (bookIndex === -1) return null;
      let book = books[bookIndex];
      let updateBook = { ...book, year: args.year }
      books[bookIndex] = updateBook;
      return updateBook
    },
    updateBook: (args) => {
      const bookIndex = books.findIndex(book => book.title === args.title);
      if (bookIndex === -1) return null;
      const updateBook = {  ...args, title: args.newTitle}
      books[bookIndex] = updateBook
      return updateBook;
    }
  },
  // para agregar una operacion a cada libro lo podemos hacer usando el nombre del tipado
  // Y ejecutar toda la logica en esa linea
  Book: {
    addition: (root) => { 
      return { edition: root.edition, year: root.year } 
    },
    editorial: (root) => ({ complete: `${root.edition} ${root.year}` })
  }
}
// intanciar servidos pasandole los relsover y tipos 
const server = new ApolloServer({
  typeDefs,
  resolvers,
})

// levantar servidores 
const { url } = await startStandaloneServer(server, {
  listen: { port: 4000 },
});

console.log(`🚀  Server ready at: ${url}`);