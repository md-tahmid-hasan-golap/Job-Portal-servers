const express = require('express');
const cors = require('cors');
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: [
    "https://job-portal-client-ashen-phi.vercel.app", // আপনার লাইভ ফ্রন্টএন্ড লিঙ্ক
    "http://localhost:3000",                          // Next.js লোকালহোস্ট (ভবিষ্যতে টেস্ট করার জন্য)
    "http://localhost:5173"                           // Vite লোকালহোস্ট (যদি লাগে)
  ],
  credentials: true
}));
app.use(express.json());

// Database Connection String
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
    // Vercel-এ সার্ভারলেস ফাংশনের সুবিধার জন্য client.connect() এখানে বন্ধ রাখাই ভালো
    // await client.connect();

    const jobCollection = client.db('job-portal').collection('jobs');

    // 1. POST: Create a Job
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

    // 2. GET: My Jobs (Fixed Sort Syntax)
    app.get("/my-jobs/:email", async (req, res) => {
      try {
        const email = req.params.email;
        const query = { hr_email: email };
        // ফিক্সড সর্ট সিনট্যাক্স চেইনিং
        const result = await jobCollection.find(query).sort({ created_at: -1 }).toArray();
        res.send(result);
      } catch (error) {
        res.status(500).send({ message: "Error fetching my jobs", error: error.message });
      }
    });

    // 3. DELETE: Delete a Job
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

    // 4. GET: All Jobs
    app.get("/alljobs", async (req, res) => {
      try {
        const result = await jobCollection.find().toArray();
        res.send(result);
      } catch (error) {
        res.status(500).send({ message: "Error fetching all jobs", error: error.message });
      }
    });

    // 5. GET: Latest Jobs (Fixed Sort and Limit Syntax)
    app.get("/letest-jobs", async (req, res) => {
      try {
        // ফিক্সড সর্ট এবং লিমিট সিনট্যাক্স চেইনিং
        const result = await jobCollection.find({}).sort({ created_at: -1 }).limit(6).toArray();
        res.send(result);
      } catch (error) {
        res.status(500).send({ message: "Error fetching latest jobs", error: error.message });
      }
    });

    // 6. GET: Single Job Details
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

    // 7. PUT: Update a Job
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

    console.log("MongoDB Routes Connected Successfully!");
  } catch (error) {
    console.error("MongoDB Connection Setup Error:", error);
  }
}
run().catch(console.dir);

// Root Route
app.get('/', (req, res) => {
  res.send('Job Portal Server is running!')
})

// Listen
app.listen(port, () => {
  console.log(`Job Portal Server listening on port ${port}`)
});