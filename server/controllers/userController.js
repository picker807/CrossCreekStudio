const sequenceGenerator = require('../routes/sequence');
const User = require('../models/user');

exports.getAllUsers = (req, res, next) => {
  User.find({})
    .then(users => {
      res.status(200).json(users);
    })
    .catch(err => {
      res.status(500).json({ error: err.message });
    });
};

exports.createUser = async (req, res, next) => {
  try {
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
      phone: req.body.phone,
      compositeKey: req.body.compositeKey
    });

    const createdUser = await user.save();
    res.status(201).json(createdUser);
  } catch (error) {
    console.error('Error saving user:', error);
    res.status(500).json({
      message: 'An error occurred while you were away',
      error: error.message,
      stack: error.stack
    });
  }
};

exports.updateUser = (req, res, next) => {
  //console.log('PUT request received');
  //console.log(req.body);
  User.findOne({ id: req.params.id })
    .then(user => {
      //console.log("user fetched in user route: ", user);
      if (!user) {
        return res.status(404).json({
          message: 'User not found'
        });
      }

      Object.assign(user, req.body);

      return user.save().then(updatedUser => {
        //console.log("user saved", updatedUser)
        res.status(200).json(updatedUser);
      });
    })
    .catch(error => {
      res.status(500).json({
        message: 'User not found.',
        error: { user: 'Location not found' }
      });
    });
};

exports.deleteUser = (req, res, next) => {
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
        error: { User: 'User not found' }
      });
    });
};