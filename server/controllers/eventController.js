const sequenceGenerator = require('../routes/sequence');
const Event = require('../models/event');
//var express = require('express');
//var router = express.Router();
const User = require('../models/user');
const Gallery = require('../models/gallery');
//const mongoose = require('mongoose');


exports.getAllEvents = async (req, res) => {
  try {
    const events = await Event.find({}).populate('attendees').populate('images').exec();
    res.status(200).json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get event by ID or Slug
exports.getOneEvent = async (req, res) => {
  try {
    const identifier = req.params.identifier;
    const event = await Event.findOne({ $or: [{ id: identifier }, { slug: identifier }] })
      .populate('attendees')
      .populate('images')
      .exec();
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.status(200).json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create new event
exports.createEvent = async (req, res) => {
  try {
    const maxEventId = await sequenceGenerator.nextId("events");
    // Convert attendees and images to ObjectIds
    if (req.body.attendees) {
      const userIds = await Promise.all(
        req.body.attendees.map(async user => {
          const foundUser = await User.findOne({ _id: user._id });
          return foundUser ? foundUser._id : null;
        })
      );
      req.body.attendees = userIds.filter(id => id !== null);
    }

    // Convert images to ObjectIds
    if (req.body.images) {
      const galleryIds = await Promise.all(
        req.body.images.map(async gallery => {
          const foundGallery = await Gallery.findOne({ id: gallery.id });
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

    const populatedEvent = await Event.findById(newEvent._id)
      .populate('attendees')
      .populate('images')
      .exec();
    res.status(201).json(populatedEvent);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// update and add a user to an event
exports.addUserToEvent = async (req, res) => {
  try {
    // Check if the user already exists
    let user = await User.findOne({ compositeKey: req.body.compositeKey });

    if (!user) {
      // Create a new user
      user = new User({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        compositeKey: req.body.compositeKey
      });
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
};

// Update event using findOne
exports.updateEvent = async (req, res) => {
  try {
    const existingEvent = await Event.findOne({ id: req.params.id.trim() });

    if (!existingEvent) {
      return res.status(404).json({ message: 'Event not found' });
    }

    //console.log('Existing attendees:', existingEvent.attendees);

    // Process new attendees
    if (req.body.attendees && Array.isArray(req.body.attendees)) {
      const updatedAttendees = await Promise.all(req.body.attendees.map(async (attendee) => {
        if (attendee.compositeKey) {
          let user = await User.findOne({ compositeKey: attendee.compositeKey });
          if (!user) {
            user = new User({
              id: await sequenceGenerator.nextId("users"),
              firstName: attendee.firstName,
              lastName: attendee.lastName,
              email: attendee.email,
              phone: attendee.phone,
              compositeKey: attendee.compositeKey
            });
            await user.save();
          }
          return user._id;
        }
        //return null;
      }));

      existingEvent.attendees = updatedAttendees;
    }

    // Update other fields
    if (req.body.images) {
      req.body.images = await Gallery.find({ id: { $in: req.body.images } })
        .then(images => images.map(image => image._id));
    }

    // Update the event with the new data (excluding attendees)
    const { attendees, ...updateData } = req.body;
    Object.assign(existingEvent, updateData);

    // Save the updated event
    const savedEvent = await existingEvent.save();

    // Populate the attendees and images fields
    const populatedEvent = await Event.findById(savedEvent._id)
      .populate('attendees')
      .populate('images')
      .exec();

    //console.log('Saved and populated event:', populatedEvent);
    res.json(populatedEvent);
  } catch (err) {
    console.error('Error updating event:', err);
    res.status(400).json({ message: err.message });
  }
};

// Delete event
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findOneAndDelete({id: req.params.id});
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json({ message: 'Event deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};