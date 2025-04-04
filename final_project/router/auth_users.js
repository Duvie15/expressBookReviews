const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

//Function to check if a username is valid (not empty and is a string)
const isValid = (username) => {
  return typeof username === 'string' && username.trim().length > 0;
};

const authenticatedUser = (username,password)=>{ //returns boolean
// Find user in the array
let user = users.find(user => user.username === username && user.password === password);
return !!user; // Returns true if found, false otherwise
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const username = req.body.username;
      const password = req.body.password;
  
      // Check if username or password is missing
      if (!username || !password) {
          return res.status(404).json({ message: "Error logging in" });
      }
  
      // Authenticate user
      if (authenticatedUser(username, password)) {
          // Generate JWT access token
          let accessToken = jwt.sign({ username }, "access", { expiresIn: 60 * 60 });
  
          // Store access token and username in session
          req.session.authorization = {
              accessToken, username
          }
          return res.status(200).send("User successfully logged in");
      } else {
          return res.status(208).json({ message: "Invalid Login. Check username and password" });
      }
});

// Add a book review
// Add a new review for a specific book (by ISBN)
regd_users.post("/auth/review/:isbn", (req, res) => {
  const { review } = req.body;  // The review posted by the user
  const isbn = req.params.isbn;
  const username = req.session.authorization.username;  // Get the username from the session

  // Check if the review is empty
  if (!review || review.trim() === "") {
      return res.status(400).json({ message: "Review cannot be empty" });
  }

  // Check if the book exists
  const book = books[isbn];
  if (!book) {
      return res.status(404).json({ message: "Book not found" });
  }

  // Add a new review
  // Store the review as a key-value pair with the username as the key
  book.reviews[username] = review;
  return res.status(201).json({ message: "Review added successfully" });
});

//Modify a review for a specific book (by ISBN)
regd_users.put("/auth/review/:isbn", (req, res) => {
  const { review } = req.body;  // The updated review posted by the user
  const isbn = req.params.isbn;
  const username = req.session.authorization.username;  // Get the username from the session

  // Check if the review is empty
  if (!review || review.trim() === "") {
    return res.status(400).json({ message: "Review cannot be empty" });
  }

  // Check if the book exists
  const book = books[isbn];
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  // If the user has already reviewed the book, update the review
  if (book.reviews[username]) {
    // Update the review for that user
    book.reviews[username] = review;
    return res.status(200).json({ message: "Review updated successfully" });
  } else {
    // If the user hasn't reviewed the book yet, inform them they need to add a review first
    return res.status(400).json({ message: "User hasn't reviewed this book yet" });
  }
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization.username;  // Get the username from the session

  // Check if the book exists
  const book = books[isbn];
  if (!book) {
      return res.status(404).json({ message: "Book not found" });
  }

  // Check if the user has a review for the book
  if (book.reviews[username]) {
      // Delete the user's review
      delete book.reviews[username];
      return res.status(200).json({ message: "Review deleted successfully" });
  } else {
      return res.status(400).json({ message: "No review found for this user" });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
