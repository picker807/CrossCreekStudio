const { MongoClient, ObjectId } = require('mongodb');
const fs = require('fs');

// Load the JSON data
const data = JSON.parse(fs.readFileSync('db.json', 'utf8'));

// MongoDB connection string
const uri = 'mongodb+srv://pic18006:iOwK3kgww7JsSJM9@cluster0.dfamm76.mongodb.net/';

// Function to fetch existing data and update events
async function convertData() {
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  try {
    await client.connect();
    const db = client.db('CrossCreekCreates');

    // Fetch existing users and galleries data
    const users = await db.collection('users').find().toArray();
    const galleries = await db.collection('galleries').find().toArray();

    // Create maps to store the ObjectIDs for users and galleries
    const userIdMap = {};
    const galleryIdMap = {};

    // Populate the maps with the ObjectIDs
    users.forEach(user => {
      userIdMap[user.id] = user._id;
    });

    galleries.forEach(gallery => {
      galleryIdMap[gallery.id] = gallery._id;
    });

    // Convert events and update user and gallery references
    const events = data.events.map(event => {
      return {
        ...event,
        _id: new ObjectId(),
        attendees: event.attendees.map(attendee => userIdMap[attendee.id]),
        images: event.images.map(image => galleryIdMap[image.id])
      };
    });

    // Insert the converted events data into the database
    const eventsResult = await db.collection('events').insertMany(events);

    // Log the results to verify insertion
    //console.log('Events inserted:', eventsResult.insertedCount);

    //console.log('Data conversion and insertion complete.');
  } catch (err) {
    console.error('Error converting data:', err);
  } finally {
    await client.close();
  }
}

convertData();