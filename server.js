const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const { ObjectId } = require('mongodb');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const url = 'mongodb+srv://server:LargeProjectServer@cluster0.3ygv0.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const client = new MongoClient(url);

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );
    res.setHeader(
        'Access-Control-Allow-Methods',
        'GET, POST, PATCH, DELETE, OPTIONS'
    );
    next();
});

app.listen(5000); // start Node + Express server on port 5000


app.post('/api/register', async (req, res, next) =>
{
// incoming: username, password, firstName, lastName, phoneNum, email
// outgoing: id, firstName, lastName, error
    const { username, password, displayName, email } = req.body;
    let id = '';
    let un = '';
    let error = '';
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    try
    {
        if (!emailPattern.test(email))
        {
            error = 'Invalid email format';
            return res.status(400).json({ id, Username: un, error });
        }

        await client.connect();
        const db = client.db('POOSD-Large-Project');

        // Check if the user already exists (by email or username)
        const existingUser = await db.collection('User').findOne({$or: [{ Username: username }, { Email: email }]});
        if (existingUser)
        {
            error = 'Username or email already exists';
            return res.status(400).json({ id,  Username: un, error });
        }

        // Create a new user
        const newUser =
        {
            Username : username,
            Password: password,
            Email: email,
            Verified: false,
            DisplayName: displayName,
        };

        // Save user to database
        await db.collection('User').insertOne(newUser);

        const user = await db.collection('User').find({ Username: username }).toArray();

        if (user.length > 0) {
            id = user[0]._id.toString();
            un = user[0].Username;
        }

        const ret = {id: id, Username: un, error: ''};
        res.status(200).json(ret);
    } catch (err)
    {
        console.error(err);
        error = 'An error has occurred\nUnable to register user';
        res.status(500).json({ id, Username: un, error });
    }
});

app.post('/api/login', async (req, res, next) =>
{
// incoming: login, password
// outgoing: id, firstName, lastName, error
    let id = '';
    let un = '';
    let dn = '';
    let em = '';
    let error = '';
    const {username, password} = req.body;
    try {
        await client.connect();
        const db = client.db('POOSD-Large-Project');

        const user = await db.collection('User').find({Username: username, Password: password,}).toArray();
        if (user.length > 0) {
            id = user[0]._id.toString();
            un = user[0].Username;
            dn = user[0].DisplayName;
            em = user[0].Email;
            res.status(200).json({ id : id, Username: un, DisplayName : dn, Email : em, error: '' });
        } else {
            error = 'Invalid username or password';
            res.status(400).json({ id: id, Username: un, DisplayName : dn, Email : em, error });
        }
    } catch (err)
    {
        console.error(err);
        error = 'An error has occurred\nUnable to login';
        res.status(500).json({ id : id, Username: un, DisplayName : dn, Email : em, error });
    }
});

app.post('/api/getPublicSets', async (req, res, next) => 
{
  // incoming: nameSearch, topicSearch
  // outgoing: results[], error
  var error = '';

  const { nameSearch = '', topicSearch = '' } = req.body; // Default to empty strings if not provided
  
  try 
  { 
    await client.connect();

    const db = client.db("POOSD-Large-Project");

    const results = await db.collection('CardSet').find(
    {
        Published: true,
        Name: { $regex: new RegExp(nameSearch + '.*', 'i') },
        Topic: { $regex: new RegExp(topicSearch + '.*', 'i') }
    },
      {
        projection: { Name: 1, Topic: 1, _id: 1 } // Return only necessary fields
      }
    ).toArray();  

    const _ret = results.map(result => (
    {
      Name: result.Name,
      Topic: result.Topic,
      _id: result._id
    }));
  
    const ret = { results: _ret, error: error };
    res.status(200).json(ret);
    
  } catch (err) 
  {
    console.error("Error retrieving data:", err);
    res.status(500).json({ results: [], error: "Server Error" })
  }

});

app.post('/api/createCardSet', async (req, res) =>
{
  // incoming: Name, Topic, UserId, Published
  // outgoing: success, error
  
  // Extract fields from the request body
  const { Name, Topic, UserId, Published} = req.body;
  var SetID = 1;

  // Validate required fields
  if (!Name || !Topic || !UserId) 
  {
      return res.status(400).json({ success: false, error: "Missing required fields" });
  }
  var userId
  var ObjectId = require('mongodb').ObjectId;
  userId = new ObjectId(UserId)

  try
  {
      await client.connect();
      const db = client.db("POOSD-Large-Project"); // Replace with your database name
        
      // Create the new card set object
      const newCardSet = 
      {
          Name,
          SetID, 
          UserID : userId,
          Topic,
          Published
      };

      // Insert the new card set into the CardSet collection
      const result = await db.collection('CardSet').insertOne(newCardSet);

      res.status(201).json({ success: true, id: result.insertedId,});
  } catch (error) {
      console.error("Error creating card set:", error);
      res.status(500).json({ success: false, error: "Failed to create card set" });
  } 
});

app.post('/api/updateCardSet', async (req, res) =>
{
  // Incoming id, Name, Topic
  // Outgoing success, error

  const { id, Name, Topic } = req.body; // Expecting id of the card set and optional fields to update

  // Validate required fields
  if (!id)
  {
      return res.status(400).json({ success: false, error: "CardSet ID is required" });
  }

  // Prepare the update object
  const updateFields = {};
  if (Name && Name.trim() !== '') {
      updateFields.Name = Name.trim(); // Trim and add to update object if not empty
  }
  if (Topic && Topic.trim() !== '') {
      updateFields.Topic = Topic.trim(); // Trim and add to update object if not empty
  }

  // If there are no fields to update, return an error
  if (Object.keys(updateFields).length === 0)
  {
      return res.status(400).json({ success: false, error: "No fields to update" });
  }

  try {
      await client.connect();
      const db = client.db("POOSD-Large-Project");
      
      var ObjectId = require('mongodb').ObjectId;


      // Update the card set
      const result = await db.collection('CardSet').updateOne(
          { _id: new ObjectId(id) }, // Find by ID
          { $set: updateFields } // Update fields
      );

      if (result.modifiedCount === 0) {
          return res.status(404).json({ success: false, error: "CardSet not found or no changes made" });
      }

      res.status(200).json({ success: true, message: "CardSet updated successfully" });
  } catch (error) {
      console.error("Error updating card set:", error);
      res.status(500).json({ success: false, error: "Failed to update card set" });
  } finally {
      await client.close();
  }
});

app.post('/api/deleteCardSet', async (req, res) => 
{
  const { id } = req.body; // Expecting id of the CardSet to delete


  // Validate required fields
  if (!id)
  {
      return res.status(400).json({ success: false, error: "CardSet ID is required" });
  }

  var ObjectId = require('mongodb').ObjectId;
  _id = new ObjectId(id);

  try 
  {
    await client.connect();
    const db = client.db("POOSD-Large-Project"); // Replace with your database name
    
    // First, find the CardSet to get the SetID
    const cardSet = await db.collection('CardSet').findOne({ _id});

    if (!cardSet)
    {
        return res.status(404).json({ success: false, error: "CardSet not found" });
    }


    // Delete all cards associated with this CardSet using SetID
    const deleteCardsResult = await db.collection('Cards').deleteMany({ SetID: _id });

    // Delete the CardSet itself
    const deleteCardSetResult = await db.collection('CardSet').deleteOne({ _id });

    if (deleteCardSetResult.deletedCount === 0) 
    {
        return res.status(404).json({ success: false, error: "Failed to delete CardSet" });
    }

    // Return a response with the number of cards deleted and confirmation of CardSet deletion
    res.status(200).json(
    {
        success: true,
        message: "CardSet deleted successfully",
        cardsDeleted: deleteCardsResult.deletedCount
    });
    } catch (error)
    {
      console.error("Error deleting card set:", error);
      res.status(500).json({ success: false, error: "Failed to delete card set" });
    }
});

app.delete('/api/deleteUser', async (req, res) => {
    const { userId } = req.body;

    try {
        const userObjectId = new ObjectId(userId);

        // Start a MongoDB session
        const session = await client.startSession();

        // Begin transaction
        await session.withTransaction(async () => {
            // Delete all card sets owned by the user
            await db.collection('CardSet').deleteMany({ UserId: userObjectId }, { session });

            // Delete the user from the User collection
            await db.collection('User').deleteOne({ _id: userObjectId }, { session });
        });

        // Return success response
        res.status(200).json({ success: true });

    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to delete user" });
    }
});

// app.post('/api/getUserSets', async (req, res) => {
//     const { userId } = req.body;
//     console.log("Recieved UserID:", userId);

//     const db = client.db("POOSD-Large-Project");

//     if (!userId) {
//         console.error("User ID is missing in request body.");
//         return res.status(400).json({ success: false, message: 'User ID is required' });
//     }

//     try {
//         const userObjectId = new ObjectId(userId);

//         // Query for documents with the given UserID ObjectId
//         const userSets = await db.collection('CardSet').find({ UserID: userObjectId }).toArray();

//         if (!userSets || userSets.length === 0) {
//             console.error("No sets found for the given UserID.");
//             return res.status(200).json({ success: false, sets: userSets });
//         }

//         res.status(200).json({ success: true, sets: userSets });
//     } catch (error) {
//         console.error("Error retrieving user sets:", error);
//         res.status(500).json({ success: false, message: 'Failed to fetch user sets' });
//     }
// });

app.post('/api/getUserSets', async (req, res) => {
    const { userId } = req.body;
    // console.log("Received UserID:", userId);
  
    if (!userId) {
      console.error("User ID is missing in request body.");
      return res.status(400).json({ success: false, message: 'User ID is required', sets: [] });
    }
  
    try {
      // Check if MongoDB client is connected
      if (!client.topology || !client.topology.isConnected()) {
        console.error("MongoDB client is not connected.");
        return res.status(500).json({ success: false, message: 'Database not connected' });
      }
  
      const db = client.db("POOSD-Large-Project");
      const userObjectId = new ObjectId(userId);
  
      // Query for documents with the given UserID ObjectId
      const userSets = await db.collection('CardSet').find({ UserID: userObjectId }).toArray();
  
      if (!userSets || userSets.length === 0) {
        console.error("No sets found for the given UserID.");
        return res.status(200).json({ success: false, sets: [] });
      }
  
      res.status(200).json({ success: true, sets: userSets });
    } catch (error) {
      console.error("Error retrieving user sets:", error);
      res.status(500).json({ success: false, message: 'Failed to fetch user sets', sets: [] });
    }
  });

