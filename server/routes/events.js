const sequenceGenerator = require('./sequence');
const Event = require('../models/event');
var express = require('express');
var router = express.Router();
const User = require('../models/user');
const Gallery = require('../models/gallery');
const mongoose = require('mongoose');

router.get('/', async (req, res, next) => {
  try {
    const events = await Event.find({}).populate('attendees').populate('images').exec();
    console.log(events);
    res.status(200).json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Get event by ID
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('attendees').populate('images').exec();
    res.status(200).json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Create new event
router.post('/', async (req, res) => {
  try {
    const maxEventId = await sequenceGenerator.nextId("events");
    // Convert attendees and images to ObjectIds
    if (req.body.attendees) {
      const userIds = await Promise.all(
        req.body.attendees.map(async user => {
          const foundUser = await User.findOne({ id: user.id }); // Adjust the query as necessary
          return foundUser ? foundUser._id : null;
        })
      );
      req.body.attendees = userIds.filter(id => id !== null);
    }

    // Convert images to ObjectIds
    if (req.body.images) {
      const galleryIds = await Promise.all(
        req.body.images.map(async gallery => {
          const foundGallery = await Gallery.findOne({ id: gallery.id }); // Adjust the query as necessary
          return foundGallery ? foundGallery._id : null;
        })
      );
      req.body.images = galleryIds.filter(id => id !== null);
    }
    const event = new Event({
      ...req.body,
      id: maxEventId.toString()
    });

    const newEvent = await event.save();
    //.populate('attendees').populate('images').exec()
    res.status(201).json(newEvent);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// update and add a user to an event
router.post('/:id/register', async (req, res) => {
  try {
    // Check if the user already exists
    let user = await User.findOne({ email: req.body.email });

    if (!user) {
      // Create a new user
      user = new User({
        id: req.body.id,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email
      });
      await user.save();
    } else {
      // Update the existing user
      user.firstName = req.body.firstName;
      user.lastName = req.body.lastName;
      await user.save();
    }

    // Add the user to the event attendees
    const event = await Event.findById(req.params.id);
    event.attendees.push(user._id);
    await event.save();

    res.json({ message: 'User registered for the event' });
  } catch (err) {
    res.status(500).json({ 
      message: "Registering for event failed",
      error: error.message });
  }
});


// Update event using findOneAndUpdate
router.put('/:id', async (req, res) => {
  try {
    // Convert attendees and images to ObjectIds
    if (req.body.attendees) {
      const userIds = await Promise.all(
        req.body.attendees.map(async user => {
          const foundUser = await User.findOne({ id: user.id }); // Adjust the query as necessary
          return foundUser ? foundUser._id : null;
        })
      );
      req.body.attendees = userIds.filter(id => id !== null);
    }

    // Convert images to ObjectIds
    if (req.body.images) {
      const galleryIds = await Promise.all(
        req.body.images.map(async gallery => {
          const foundGallery = await Gallery.findOne({ id: gallery.id }); // Adjust the query as necessary
          return foundGallery ? foundGallery._id : null;
        })
      );
      req.body.images = galleryIds.filter(id => id !== null);
    }

    console.log("rquest body: ", req.body);
    const updatedEvent = await Event.findOneAndUpdate(
      { id: req.params.id.trim() },
      req.body,
      { new: true, runValidators: true }
    ).populate('attendees').populate('images').exec();

    if (!updatedEvent) return res.status(404).json({ message: 'Event not found' });

    res.json(updatedEvent);
  } catch (err) {
    res.status(400).json({ 
      message: err.message });
  }
});

// Delete event
router.delete('/:id', async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json({ message: 'Event deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;