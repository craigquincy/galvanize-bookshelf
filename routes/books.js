'use strict';

const express = require('express');

// eslint-disable-next-line new-cap
const router = express.Router();

const knex = require('../knex');

const bodyParser = require('body-parser');
const inflector = require('json-inflector');
const { camelizeKeys, decamelizeKeys } = require('humps');


router.use(bodyParser.json());

router.use(inflector());


let books = []

router.get('/books', function(req, res, next) {

  knex('books')
    .orderBy('title')
    .then((books) => {
      res.json(books);
    })
    .catch((err) => {
      next(err);
    });
});

router.get('/books/:id', function(req, res, next) {
  var id = Number.parseInt(req.params.id);

  if (Number.isNaN(id) || id < 0) {
    return res.sendStatus(404);
  }

  knex('books')
  .where('id', id)
  .first()
  .then((book) => {
    if (!book) {
      return next();
    }
    res.json(book);
  })
  .catch((err) => {
    next(err);
  });
});

router.post('/books', function(req, res, next) {
  let insertBook = {
    title: req.body.title,
    author: req.body.author,
    cover_url: req.body.cover_url,
    genre: req.body.genre,
    description: req.body.description,
  }

  console.log("inserting", insertBook)

  knex('books')
    .insert(decamelizeKeys(insertBook), '*')
    .then((rows) => {
      const book = camelizeKeys(rows[0]);

      res.send(book);
    })
    .catch((err) => {
      next(err);
    });


  // const { title, author, genre, description, coverUrl } = req.body;

  // knex('books')
  //   .returning('*')
  //   .insert(book, '*')
  //   .then((books) => {
  //     res.json(books[0]);
  //   })
  //   .catch((err) => {
  //     next(err);
  //   });
});

router.patch('/books/:id', (req, res, next) => {
  knex('books')
    .where('id', req.params.id)
    .first()
    .then((book) => {
      if (!book) {
        return next();
      }

      return knex('books')
        .where('id', req.body.book_id)
        .first();
    })
    .then((book) => {
      if (!book) {
        const err = new Error('book_id does not exist');

        err.status = 400;

        throw err;
      }

      return knex('books')
        .update({
          book_id: req.body.book_id,
          title: req.body.title,
          likes: req.body.likes
        }, '*')
        .where('id', req.params.id);
    })
    .then((books) => {
      res.json(books[0]);
    })
    .catch((err) => {
      next(err);
    });
});

router.delete('/books/:id', (req, res, next) => {
  let book;

  knex('books')
    .where('id', req.params.id)
    .first()
    .then((row) => {
      if (!row) {
        return next();
      }

      book = row;

      return knex('books')
        .del()
        .where('id', req.params.id);
    })
    .then(() => {
      delete book.id;
      res.json(book);
    })
    .catch((err) => {
      next(err);
    });
});



module.exports = router;
