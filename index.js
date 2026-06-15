const express = require('express');
const cors = require('cors');
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

const uri = process.env.MONGODB_URI;

// Create a MongoClient
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // 🔴 সংশোধন ১: Vercel-এর জন্য অবশ্যই client.connect() আন-কমেন্ট করতে হবে
    await client.connect();
    console.log("Successfully connected to MongoDB!");

    const jobCollection = client.db('job-portal').collection('jobs');

    // POST: Create a Job
    app.post("/jobs", async (req, res) => {
      try {
        const job = req.body;
        job.created_at = new Date();
        const result = await jobCollection.insertOne(job);
        res.status(201).send(result);
      } catch (error) {
        res.status(500).send({ message: "Error inserting job", error: error.message });
      }
    });

    // GET: My Jobs (🔴 সংশোধন ২: sort করার সঠিক নিয়ম)
    app.get("/my-jobs/:email", async (req, res) => {
      try {
        const email = req.params.email;
        const query = { hr_email: email };
        const result = await jobCollection.find(query).sort({ created_at: -1 }).toArray();
        res.send(result);
      } catch (error) {
        res.status(500).send({ message: "Error fetching my jobs", error: error.message });
      }
    });

    // DELETE: Delete a Job
    app.delete("/jobs/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await jobCollection.deleteOne(query);
        res.send(result);
      } catch (error) {
        res.status(500).send({ message: "Error deleting job", error: error.message });
      }
    });

    // GET: All Jobs
    app.get("/alljobs", async (req, res) => {
      try {
        const result = await jobCollection.find().toArray();
        res.send(result);
      } catch (error) {
        res.status(500).send({ message: "Error fetching all jobs", error: error.message });
      }
    });

    // GET: Latest Jobs (🔴 সংশোধন ২: sort ও limit করার সঠিক নিয়ম)
    app.get("/letest-jobs", async (req, res) => {
      try {
        const result = await jobCollection.find().sort({ created_at: -1 }).limit(6).toArray();
        res.send(result);
      } catch (error) {
        res.status(500).send({ message: "Error fetching latest jobs", error: error.message });
      }
    });

    // GET: Single Job Details
    app.get("/all-job-details/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await jobCollection.findOne(query);
        res.send(result);
      } catch (error) {
        res.status(500).send({ message: "Error fetching job details", error: error.message });
      }
    });

    // PUT: Update Job
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
        res.status(500).send({ message: "Internal Server Error", error: error.message });
      }
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } catch (error) {
    console.error("Database connecting error:", error);
  }
}

run().catch(console.dir);

// Root Route
app.get('/', (req, res) => {
  res.send('Job Portal Server is running!');
});

app.listen(port, () => {
  console.log(`Job Portal Server listening on port ${port}`);
});