const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Function to check if a username already exists
const doesExist = (username) => {
  return users.some(user => user.username === username);
};

public_users.post("/register", (req,res) => {
  const { username, password } = req.body;

    //Error: Missing username or password
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required." });
    }

    //Error: User already exists
    if (doesExist(username)) {
        return res.status(409).json({ message: "User already exists!" });
    }

    //Register the new user
    users.push({ username, password });
    return res.status(201).json({ message: "User successfully registered. Now you can log in." });
});

// Get the book list available in the shop
public_users.get('/', async (req, res) => {
  try {
      const response = await axios.get('http://localhost:5000/');
      res.status(200).json(response.data);
  } catch (error) {
      res.status(500).json({ message: "Error fetching book list" });
  }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async (req, res) => {
  const isbn = req.params.isbn;
  try {
      const response = await axios.get(`http://localhost:5000/isbn/${isbn}`);
      res.status(200).json(response.data);
  } catch (error) {
      res.status(404).json({ message: "Book not found" });
  }
});
  
// Get book details based on author
public_users.get('/author/:author', async (req, res) => {
  const author = req.params.author.toLowerCase();
  try {
      const response = await axios.get(`http://localhost:5000/author/${author}`);
      res.status(200).json(response.data);
  } catch (error) {
      res.status(404).json({ message: "No books found by this author" });
  }
});

// Get all books based on title
public_users.get('/title/:title', async (req, res) => {
  const title = req.params.title.toLowerCase();
  try {
      const response = await axios.get(`http://localhost:5000/title/${title}`);
      res.status(200).json(response.data);
  } catch (error) {
      res.status(404).json({ message: "No books found with this title" });
  }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book && book.reviews) {
    res.json(book.reviews);
  } else {
    res.status(404).json({ message: "No reviews found for this book" });
  }
});

module.exports.general = public_users;
