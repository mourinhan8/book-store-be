const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const auth = require('../../middleware/auth');
const Purchase = require('../../models/Purchase');
const Book = require('../../models/Book');
const User = require('../../models/User');

// @route  GET api/purchases
// @desc   Get all purchase list of the user
// @access Private
router.get('/', auth, async (req, res) => {
  try {
    // Check if user exists
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(400).json({
        errors: [{ message: 'This user does not exists' }]
      });
    }

    const purchases = await Purchase.find({ user: req.user.id })
      .populate('user', ['_id', 'name', 'email'])
      .populate('books.id', ['_id', 'title', 'author']);

    if (purchases.length === 0) {
      return res.status(200).json({
        message: 'No purchase found for this user'
      });
    }

    res.status(200).json(purchases);
  } catch (err) {
    console.log(err.message);
    res.status(500).send('Server Error');
  }
});

// @route  GET api/purchases/:purchaseId
// @desc   Get a purchase for the user
// @access Private
router.get('/:purchaseId', auth, async (req, res) => {
  try {
    // Check if user exists
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(400).json({
        errors: [{ message: 'This user does not exists' }]
      });
    }

    let purchaseId = req.params.purchaseId;

    const purchase = await Purchase.findOne({
      _id: purchaseId,
      user: req.user.id
    })
      .populate('user', ['_id', 'name', 'email'])
      .populate('books.id', ['_id', 'title', 'author']);

    if (!purchase) {
      return res.status(400).json({
        errors: [{ message: 'Could not find any purchase' }]
      });
    }
    res.status(200).json(purchase);
  } catch (err) {
    console.log(err.message);
    res.status(500).send('Server Error');
  }
});

// @router  POST api/purchases
// @desc    Make a purchase
// @access  Private
router.post(
  '/',
  auth,
  [check('books', 'Book list must be array').isArray()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if user exists
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(400).json({
        errors: [{ message: 'This user does not exists' }]
      });
    }

    const books = req.body.books;
    console.log(books)
    if (books.length === 0) {
      return res.status(400).json({
        errors: [{ message: "Books can't be empty" }]
      })
    }
    let totalValue = 0;
    let booksData = [];
    const userPoint = user.point;

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      for (let item in books) {
        const { id, quantity } = books[item];
        let book = await Book.findOne({ _id: id, status: { $ne: 0 } });
        if (!book) {
          throw new Error('Book not exist')
        }
        const stock = book.stock;
        // check if book is in stock or not
        if (book.stock < quantity) {
          throw new Error('Sorry, the book is out of stock')
        }
        const price = book.price;
        booksData.push({
          id,
          quantity,
          price
        })
        totalValue += price * quantity;
        // Decrease book stock by 1
        await book.updateOne({
          $set: {
            stock: stock - 1
          }
        }, { session });
      }
      if (totalValue > user.point) {
        throw new Error("Sorry, you don't have enough point")
      }
      // sub user point
      await user.updateOne({
        $set: {
          point: userPoint - totalValue
        }
      }, {
        session
      })
      const newPurchase = new Purchase({
        user: req.user.id,
        books: booksData,
        totalValue
      });

      await newPurchase.save({ session });
      
      await session.commitTransaction();
      await session.endSession();

      res.status(200).json(newPurchase);
    } catch (err) {
      await session.abortTransaction();
      await session.endSession();
      console.error(err.message);
      err.message ? res.status(400).send({ message: err.message }) : res.status(500).send('Server Error');
    }
  }
);

// @route  DELETE api/purchases/:purchaseId
// @desc   Cancel a purchase
// @access Private
router.delete('/:purchaseId', auth, async (req, res) => {
  try {
    // Check if user exists
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(400).json({
        errors: [{ message: 'This user does not exists' }]
      });
    }

    let purchaseId = req.params.purchaseId;

    const purchase = await Purchase.findOne({
      _id: purchaseId,
      user: req.user.id
    });

    if (!purchase) {
      return res.status(400).json({
        errors: [{ message: 'Could not find any purchase to delete' }]
      });
    }
    const booksData = purchase.books;
    const totalValue = purchase.totalValue;
    const userPoint = user.point;
    const session = await mongoose.startSession();
    session.startTransaction();
    // Increase stock by 1
    for (let item in booksData) {
      const itemData = booksData[item]
      const book = await Book.findOne({ _id: itemData.id, status: { $ne: 0 } });
      if (!book) {
        throw new Error('Book not exist')
      }
      const stock = book.stock;
      await book.updateOne({
        $set: {
          stock: stock + itemData.quantity
        }
      }, {
        session
      });
    }
    await user.updateOne({
      $set: {
        point: userPoint + totalValue
      }
    }, {
      session
    })


    await purchase.updateOne({
      $set: {
        status: 0
      }
    }, {
      session
    });
    await session.commitTransaction();
    await session.endSession();
    res.status(200).json({ message: 'Successfully deleted the purchase' });
  } catch (err) {
    await session.abortTransaction();
    await session.endSession();
    console.log(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
