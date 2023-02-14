// backend/routes/api/users.js
const express = require('express')
const { setTokenCookie, requireAuth } = require('../../utils/auth');
const { User } = require('../../db/models');
const router = express.Router();
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const validateSignup = [
  check('email')
    .exists({ checkFalsy: true })
    .isEmail()
    .withMessage('Please provide a valid email.'),
  check('username')
    .exists({ checkFalsy: true })
    .isLength({ min: 4 })
    .withMessage('Please provide a username with at least 4 characters.'),
  check('username')
    .not()
    .isEmail()
    .withMessage('Username cannot be an email.'),
  check('password')
    .exists({ checkFalsy: true })
    .isLength({ min: 6 })
    .withMessage('Password must be 6 characters or more.'),
  handleValidationErrors
];

// Sign up
router.post(
  '/',
  validateSignup,
  async (req, res) => {
    const { email, password,firstName,lastName, username} = req.body;

    try {
      const existingEmail = await User.findOne({
        where: { email: email }
      });
      const existingUsername = await User.findOne({
        where: {username: username}
      })

      if (existingEmail) {
        return res.status(403).json({
          message: "User already exists",
          statusCode: 403,
          errors: {
            email: "User with that email already exists"
          }
        });
      }

      if (existingUsername) {
        return res.status(403).json({
          message: "User already exists",
          statusCode: 403,
          errors: {
            username: "User with that username already exists"
          }
        });
      }

    const user = await User.signup({ email, username,firstName,lastName, password});

    await setTokenCookie(res, user);

    return res.json({
      user,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      statusCode: 500,
      errors: error
    });
  }
}
);

module.exports = router;