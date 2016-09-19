'use strict';

const express = require('express');
const boom = require('boom');
const knex = require('../knex');

// eslint-disable-next-line new-cap
const router = express.Router();

const {
  camelizeKeys,
  decamelizeKeys
} = require('humps');

router.get('/books', function(req, res, next) {

  knex('books')
    .orderBy('title')
    .then((books) => {
      res.json(camelizeKeys(books));
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
        throw boom.create(404, 'Not Found');
      }
      res.json(camelizeKeys(book));
    })
    .catch((err) => {
      next(err);
    });
});

router.post('/books', function(req, res, next) {
  const {
    title,
    author,
    genre,
    description,
    coverUrl
  } = req.body;

  const insertBook = {
    title,
    author,
    genre,
    description,
    coverUrl
  };

  knex('books')
    .returning('*')
    .insert(decamelizeKeys(insertBook))
    .then((rows) => {
      const book = camelizeKeys(rows[0]);

      res.send(book);
    })
    .catch((err) => {
      next(err);
    });

});

router.patch('/books/:id', (req, res, next) => {

  const id = Number.parseInt(req.params.id);

  if (Number.isNaN(id)) {
    return next();
  }

  knex('books')
    .where('id', id)
    .first()
    .then((book) => {
      if (!book) {
        throw boom.create(404, 'Not Found');
      }
      const {
        title,
        author,
        genre,
        description,
        coverUrl
      } = req.body;
      const updateBook = {};

      if (title) {
        updateBook.title = title;
      }

      if (author) {
        updateBook.author = author;
      }

      if (genre) {
        updateBook.genre = genre;
      }

      if (description) {
        updateBook.description = description;
      }

      if (coverUrl) {
        updateBook.coverUrl = coverUrl;
      }

      return knex('books')
        .update(decamelizeKeys(updateBook), '*')
        .where('id', id);
    })
    .then((rows) => {
      const book = camelizeKeys(rows[0]);

      res.send(book);
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
      res.json(camelizeKeys(book));
    })
    .catch((err) => {
      next(err);
    });
});

module.exports = router;
