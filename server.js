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

    try
    {
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