const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
const User = require('../../models/User');
const auth = require('../../middleware/auth');

const jwt_secret = process.env.JWT_SECRET;
const admin_signup_key = process.env.ADMIN_SIGNUP_KEY

// @route    POST api/users
// @desc     Register user
// @access   Public
router.post(
  '/register',
  [
    check('name', 'Name is required')
      .not()
      .isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check(
      'password',
      'Please enter a password with 8 or more characters'
    ).isLength({ min: 8 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(401).json({ errors: errors.array() });
    }
    const { name, email, password } = req.body;

    try {
      let user = await User.findOne({ email });
      if (user) {
        return res
          .status(400)
          .json({ errors: [{ message: 'User already exists' }] });
      }

      const salt = await bcrypt.genSalt(10);

      let hashedPassword = await bcrypt.hash(password, salt);
      let role = 0; // for normal users, role is 0
      let point = 100;

      // check if it is a Admin signup
      if (req.header('admin-signup-key')) {
        // check adminSignupKey
        if (req.header('admin-signup-key') === admin_signup_key) {
          role = 1; // for admin, role is 1
        }
      }

      user = new User({
        name: name,
        email: email,
        password: hashedPassword,
        role: role,
        point
      });

      await user.save();
      const payload = {
        user: {
          id: user.id,
          role: user.role
        }
      };

      jwt.sign(
        payload,
        jwt_secret,
        { expiresIn: 3600 },
        (err, token) => {
          if (err) throw err;
          res.status(201).json({ token });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// @route    POST api/users/login
// @desc     Authenticate user and get token
// @access   Public
router.post(
  '/login',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please is required').exists()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      let user = await User.findOne({ email });

      if (!user) {
        return res
          .status(400)
          .json({ errors: [{ message: 'Invalid credentials' }] });
      }

      const passwordMatched = await bcrypt.compare(password, user.password);

      if (!passwordMatched) {
        return res
          .status(400)
          .json({ errors: [{ message: 'Invalid credentials' }] });
      }
      const payload = {
        user: {
          id: user.id,
          role: user.role
        }
      };

      jwt.sign(
        payload,
        jwt_secret,
        { expiresIn: 360000 },
        (err, token) => {
          if (err) throw err;
          res.status(200).json({ token });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

router.get('/profile', auth, async (req, res) => {
  try {
    // Check if user exists
    const user = await User.findById(req.user.id).select('-password -_id').lean();
    if (!user) {
      return res.status(400).json({
        errors: [{ message: 'This user does not exists' }]
      });
    }
    res.status(200).json(user)
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
})

router.get('/secret', auth, (req, res) => {
  res.status(200).send('success')
})
module.exports = router;
