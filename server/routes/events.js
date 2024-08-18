const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');

router.get('/', eventController.getAllEvents);
router.get('/:identifier', eventController.getOneEvent);
router.post('/', eventController.createEvent);
router.post('/:id/register', eventController.addUserToEvent);
router.put('/:id', eventController.updateEvent);
router.delete('/:id', eventController.deleteEvent);

module.exports = router;