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

    if (isNaN(Number(maxUserId))) {
      return res.status(500).json({
        message: 'Failed to generate a valid user ID',
        error: 'Invalid user ID'
      });
    }

    const user = new User({
      id: maxUserId,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      phone: req.body.phone
    });

    const createdUser = await user.save();
      res.status(201).json(createdUser );
  } catch (error) {
    console.error('Error saving user:', error);
    res.status(500).json({
      message: 'An error occurred while you were away',
      error: error.message, 
      stack: error.stack 
    });
    }
});

router.put('/:id', (req, res, next) => {
  //console.log(req.params.id);
  User.findOne({ id: req.params.id })
    .then(user => {
      //console.log("user fetched in user route: ", user);
      if (!user) {
        return res.status(404).json({
          message: 'User not found'
        });
      }

      //user.id = maxUserId;
      user.firstName = req.body.firstName;
      user.lastName = req.body.lastName;
      //user.email = req.body.email;

      return user.save().then(updatedUser => {
        res.status(200).json(updatedUser);
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