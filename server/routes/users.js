const sequenceGenerator = require('./sequence');
const User = require('../models/user');
var express = require('express');
var router = express.Router();

router.get('/', (req, res, next) => {
  User.find({})
    .then(users => {
      res.status(200).json(users);
    })
    .catch(err => {
      res.status(500).json({ error: err.message });
    });
});

router.post('/', async (req, res, next) => {
  try{
    const maxUserId = await sequenceGenerator.nextId("users");

    const user = new User({
      id: maxUserId,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email
    });

    const createdUser = await user.save();
      res.status(201).json({
        message: 'User added successfully',
        user: createdUser
        });
  } catch(error) {
       res.status(500).json({
          message: 'An error occurred',
          error: error
        });
    }
});

router.put('/:id', (req, res, next) => {
  User.findOne({ id: req.params.id })
    .then(user => {
      if (!user) {
        return res.status(404).json({
          message: 'User not found'
        });
      }

      user.id = maxUserId;
      user.firstName = req.body.firstName;
      user.lastName = req.body.lastName;
      user.email = req.body.email;

      return user.save();
    })
    .then(result => {
      res.status(204).json({
        message: 'User updated successfully'
      });
    })
    .catch(error => {
      res.status(500).json({
        message: 'User not found.',
        error: { user: 'Location not found'}
      });
    });
});

router.delete("/:id", (req, res, next) => {
  User.findOne({ id: req.params.id })
    .then(user => {
      User.deleteOne({ id: req.params.id })
        .then(result => {
          res.status(204).json({
            message: "User deleted successfully"
          });
        })
        .catch(error => {
           res.status(500).json({
           message: 'An error occurred',
           error: error
         });
        })
    })
    .catch(error => {
      res.status(500).json({
        message: 'User not found.',
        error: { User: 'User not found'}
      });
    });
});

module.exports = router;