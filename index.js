const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://tech-revive.web.app",
      "https://tech-revive.firebaseapp.com",
    ],
    credentials: true,
  })
);
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.nrlryfn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const serviceCollection = client.db("techRevive").collection("services");
    const bookingCollection = client.db("techRevive").collection("bookings");

    // Services Releted API
    app.get("/services", async (req, res) => {
      const cursor = serviceCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // Add Services
    app.post("/add-service", async (req, res) => {
      const newService = req.body;
      console.log(newService);
      const result = await serviceCollection.insertOne(newService);
      res.send(result);
    });

    // Update Service
    app.patch("/services/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const upadtedService = req.body;
      const options = {upsert : true}
      const updateDoc = {
        $set: {
          serviceName: upadtedService.serviceName,
          serviceArea: upadtedService.serviceArea,
          serviceDescription: upadtedService.serviceDescription,
          servicePrice: upadtedService.servicePrice,
          serviceProviderName: upadtedService.serviceProviderName,
          email: upadtedService.email,
          serviceProviderImage: upadtedService.serviceProviderImage,
          serviceImage: upadtedService.serviceImage,
        },
      };
      const result = await serviceCollection.updateOne(filter, updateDoc,options);
      res.send(result);
    });

    // Single Service Page Data
    app.get("/services/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const options = {
        projection: {
          service_id: 1,
          serviceImage: 1,
          serviceName: 1,
          serviceDescription: 1,
          serviceProviderImage: 1,
          serviceProviderName: 1,
          serviceArea: 1,
          servicePrice: 1,
        },
      };
      const result = await serviceCollection.findOne(query, options);
      res.send(result);
    });

    // Delete booking item
    app.delete("/services/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await serviceCollection.deleteOne(query);
      res.send(result);
    });

    // bookings
    app.get("/bookings", async (req, res) => {
      console.log(req.query.email);
      let query = {};
      if (req.query?.email) {
        query = { email: req.query.email };
      }
      const result = await bookingCollection.find(query).toArray();
      res.send(result);
    });

    // Book services
    app.post("/bookings", async (req, res) => {
      const bookings = req.body;
      res.send(await bookingCollection.insertOne(bookings));
    });

    // Update booking item
    app.patch("/bookings/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      // const options = {upsert : true}
      const upadtedBooking = req.body;
      console.log(upadtedBooking);
      const updateDoc = {
        $set: {
          status: upadtedBooking.status,
        },
      };
      const result = await bookingCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    // Get Bookings Services
    app.get("/bookings", async (req, res) => {
      res.send(await bookingCollection.find({}).toArray());
    });

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("tech revive is running!");
});

app.listen(port, () => {
  console.log(`Tech Revive server is running on port: ${port}`);
});
