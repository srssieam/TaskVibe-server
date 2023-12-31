const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const PORT = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json())




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.xjpiwvy.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();

        const allTaskList = client.db("task-vibe").collection("task-list")


        // get user specific TaskList
        app.get('/v1/api/taskList', async (req, res) => {
            const email = req.query.email
            const query = {userEmail : email}
            const result = await allTaskList.find(query).sort({ _id: -1 }).toArray()
            res.send(result)
        })
       
        app.post('/v1/api/taskList', async (req, res) => {
            const newTask = req.body;
            const result = await allTaskList.insertOne(newTask);
            res.send(result);
        })

        // delete task
        app.delete('/v1/api/taskList/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id : new ObjectId(id) };
            const result = await allTaskList.deleteOne(query);
            res.send(result);
        })
        app.patch('/v1/api/taskList', async (req, res) => {
            const id = req.query.id;
            const updatedStatus = req.query.status
            
            const filter = { _id:new ObjectId(id) };
            const updatedDoc = {
                $set: {
                    status: updatedStatus
                }
            }
            const result = await allTaskList.updateOne(filter, updatedDoc)
            res.send(result);
        })

        

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('TaskVibe server is running')
})

app.listen(PORT, () => {
    console.log(`TaskVibe server is running on http://localhost:${PORT}`)
})