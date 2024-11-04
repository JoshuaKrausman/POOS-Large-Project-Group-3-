const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { MongoClient } = require('mongodb');

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
    let error = '';
    const {username, password} = req.body;
    try {
        await client.connect();
        const db = client.db('POOSD-Large-Project');

        const user = await db.collection('User').find({Username: username, Password: password}).toArray();
        if (user.length > 0) {
            id = user[0]._id.toString();
            un = user[0].Username;
            res.status(200).json({ id, Username: un, error: '' });
        } else {
            error = 'Invalid username or password';
            res.status(400).json({ id, Username: un, error });
        }
    } catch (err)
    {
        console.error(err);
        error = 'An error has occurred\nUnable to login';
        res.status(500).json({ id, Username: un, error });
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
          UserId : userId,
          Topic,
          Published
      };

      // Insert the new card set into the CardSet collection
      const result = await db.collection('CardSet').insertOne(newCardSet);

      res.status(201).json({ success: true, id: result.insertedId,});
  } catch (error) {
      console.error("Error creating card set:", error);
      res.status(500).json({ success: false, error: "Failed to create card set" });
  } finally {
      await client.close();
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
    } finally 
    {
      await client.close();
    }
});

app.delete('/api/deleteUser', async (req, res) => {
    const { userId } = req.body;

    try {
        if (!userId) {
            return errorResponse(res, 400, 'User ID is required');
        }

        const { client, db } = await getDb();

        try {
            const session = client.startSession();
            await session.withTransaction(async () => {
                const userObjectId = new ObjectId(userId);

                // Delete all card sets owned by the user
                const cardSets = await db.collection('CardSet')
                    .find({ UserId: userObjectId }, { session })
                    .toArray();

                // Delete all cards from the user's card sets
                for (const cardSet of cardSets) {
                    await db.collection('Cards').deleteMany(
                        { SetID: cardSet._id },
                        { session }
                    );
                }

                // Delete all card sets
                await db.collection('CardSet').deleteMany(
                    { UserId: userObjectId },
                    { session }
                );

                // Delete the user
                const { deletedCount } = await db.collection('User').deleteOne(
                    { _id: userObjectId },
                    { session }
                );

                if (deletedCount === 0) {
                    throw new Error('User not found');
                }

                res.status(200).json({
                    success: true,
                    message: 'User and all associated data deleted successfully'
                });
            });
        } finally {
            await client.close();
        }
    } catch (err) {
        console.error('Error deleting user:', err);
        if (err.message === 'User not found') {
            errorResponse(res, 404, 'User not found');
        } else {
            errorResponse(res, 500, 'Failed to delete user');
        }
    }
});

app.post('/api/getUserSets', async (req, res) => {
    const { userId } = req.body;

    try {
        if (!userId) {
            return errorResponse(res, 400, 'User ID is required');
        }

        const { client, db } = await getDb();

        try {
            const userObjectId = new ObjectId(userId);
            
            // Adds pagination support
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;

            // Gets total count for pagination
            const totalSets = await db.collection('CardSet')
                .countDocuments({ UserId: userObjectId });

            // Gets sets with pagination
            const sets = await db.collection('CardSet')
                .find({ UserId: userObjectId })
                .sort({ CreatedAt: -1 }) 
                .skip(skip)
                .limit(limit)
                .project({
                    Name: 1,
                    Topic: 1,
                    Published: 1,
                    CreatedAt: 1,
                    UpdatedAt: 1
                })
                .toArray();

            if (sets.length === 0 && page === 1) {
                return res.status(200).json({
                    success: true,
                    message: 'No sets found for this user',
                    data: [],
                    pagination: {
                        currentPage: page,
                        totalPages: 0,
                        totalSets: 0,
                        hasMore: false
                    }
                });
            }

            res.status(200).json({
                success: true,
                data: sets,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(totalSets / limit),
                    totalSets,
                    hasMore: skip + sets.length < totalSets
                }
            });
        } finally {
            await client.close();
        }
    } catch (err) {
        console.error('Error fetching user sets:', err);
        errorResponse(res, 500, 'Failed to fetch user sets');
    }
});
