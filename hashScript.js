const bcrypt = require('bcrypt');

const plainTextPassword = '1234'; // Replace with the actual password
const saltRounds = 10;

bcrypt.hash(plainTextPassword, saltRounds, (err, hash) => {
  if (err) {
    console.error('Error hashing password:', err);
  } else {
    console.log('Hashed password:', hash);
    // Manually update your database with this hashed password
  }
});
