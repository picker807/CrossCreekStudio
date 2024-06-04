const sequenceGenerator = require('./sequence');
const Event = require('../models/event');
var express = require('express');
var router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const events = await Event.find({}).populate('attendees').populate('images').exec();
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
  const maxEventId = await sequenceGenerator.nextId("events");
  const event = new Event({
    ...req.body,
    id: maxEventId.toString()
  });
  try {
    const newEvent = await event.save();
    res.status(201).json(newEvent);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update event
router.put('/:id', async (req, res) => {
  try {
    const updatedEvent = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedEvent) return res.status(404).json({ message: 'Event not found' });
    res.json(updatedEvent);
  } catch (err) {
    res.status(400).json({ message: err.message });
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