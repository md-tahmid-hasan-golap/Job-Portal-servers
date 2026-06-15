const express = require('express');
const cors = require('cors');
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;







app.use(cors());
app.use(express.json());










const uri = process.env.MONGODB_URI;

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

    const jobCollection = client.db('job-portal').collection('jobs');


    app.post("/jobs", async (req, res) => {
      const job = req.body;
      job.created_at = new Date();
      const result = await jobCollection.insertOne(job);
      res.status(201).send(result);
    });



app.get("/my-jobs/:email", async (req, res) => {
  const email = req.params.email;
  const query = { hr_email: email };
  const sort = { sort: { created_at: -1 } };
  const result = await jobCollection.find(query, sort).toArray();
  res.send(result);
});



app.delete("/jobs/:id", async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const result = await jobCollection.deleteOne(query);
  res.send(result);
});




app.get("/alljobs", async (req, res) => {
    const result = await jobCollection.find().toArray();
    res.send(result);
});


app.get("/letest-jobs", async (req, res) => {
  const sort = { sort: { created_at: -1 } };
  const result = await jobCollection.find({}, sort).limit(6).toArray();
  res.send(result);
});

app.get("/all-job-details/:id", async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const result = await jobCollection.findOne(query);
  res.send(result);
});



app.put("/jobs/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const updatedJob = req.body;  
    const filter = { _id: new ObjectId(id) };
    const options = { upsert: true };
    const updateDoc = { $set: updatedJob };

    const result = await jobCollection.updateOne(filter, updateDoc, options);
    res.send(result);
  } catch (error) {
    console.error("Error updating job:", error);
    res.status(500).send({ message: "Internal Server Error", error: error.message });
  }
});
    











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
  res.send('Job Portal Server is running!')
})

app.listen(port, () => {
  console.log(`Job Portal Server listening on port ${port}`)
})