const express = require("express");
const app = express();
const cors = require("cors");
require('dotenv').config()
const port = process.env.PORT || 1000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.4kmqo4g.mongodb.net/?appName=Cluster0`;


const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();

    const myDB = client.db("smart_DB-M55");
    const productsCollection = myDB.collection("products");
    const bidsCollection = myDB.collection("bids");
    const userCollection = myDB.collection("users");

    // 👤 User create
    app.post("/users", async (req, res) => {
      const newUser = req.body;
      const email = req.body.email;
      const query = { email: email };
      const existingUser = await userCollection.findOne(query);
      if (existingUser) {
        res.send({ message: "User already exists" });
      } else {
        const result = await userCollection.insertOne(newUser);
        res.send(result);
      }
    });

    // 📦 All Products
    app.get("/products", async (req, res) => {
      const email = req.query.email;
      const query = {};
      if (email) {
        query.email = email;
      }
      const result = await productsCollection.find(query).toArray();
      res.send(result);
    });

    // 🆕 Latest Products
    app.get("/latest-products", async (req, res) => {
      const cursor = productsCollection
        .find()
        .sort({ created_at: -1 })
        .limit(9);
      const result = await cursor.toArray();
      res.send(result);
    });

    // 🔍 Single Product Details
    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await productsCollection.findOne(query);
      res.send(result);
    });

    // ➕ Add New Product
    app.post("/products", async (req, res) => {
      const newProduct = req.body;
      const result = await productsCollection.insertOne(newProduct);
      res.send(result);
    });

    // ✏️ Update Product
    app.patch("/products/:id", async (req, res) => {
      const id = req.params.id;
      const updatedProduct = req.body;
      const query = { _id: new ObjectId(id) };
      const update = {
        $set: {
          name: updatedProduct.name,
          price: updatedProduct.price,
        },
      };
      const result = await productsCollection.updateOne(query, update);
      res.send(result);
    });

    // ❌ Delete Product
    app.delete("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await productsCollection.deleteOne(query);
      res.send(result);
    });

    // 🎯 GET Bids (email দিয়ে find)
    app.get("/bids", async (req, res) => {
      const email = req.query.email; // যেমন: ?email=rony@gmail.com
      console.log("Buyer email query:", email);

      let query = {};
      if (email) {
        query = { buyer_email: email }; // ✅ buyer_email ফিল্ডে match করবে
      }

      const cursor = bidsCollection.find(query);
      const result = await cursor.toArray();
      console.log("Result:", result);
      res.send(result);
    });

    // 🎯 GET Bids by Product ID
    app.get("/products/bids/:id", async (req, res) => {
      const productId = req.params.id;
      const query = { product: productId };
      const cursor = bidsCollection.find(query).sort({ bid_price: -1 });
      const result = await cursor.toArray();
      res.send(result);
    });

    // ➕ Add New Bid
    app.post("/bids", async (req, res) => {
      const newBid = req.body;
      const result = await bidsCollection.insertOne(newBid);
      res.send(result);
    });

    // ✏️ Update Bid
    app.patch("/bids/:product_id", async (req, res) => {
      const productId = req.params.product_id;
      const updateBids = req.body;
      const query = { product_id: productId };
      const update = {
        $set: {
          bidder_name: updateBids.bidder_name,
          bid_amount: updateBids.bid_amount,
          status: updateBids.status,
          buyer_email: updateBids.buyer_email,
          bid_time: updateBids.bid_time,
        },
      };
      try {
        const result = await bidsCollection.updateOne(query, update);
        res.send(result);
      } catch (err) {
        console.log("Update method error", err);
      }
    });

    // ❌ Delete Bid
    app.delete("/bids/:id", async (req, res) => {
      const Id = req.params.id;
      const query = { _id: new ObjectId (Id) };
      const result = await bidsCollection.deleteOne(query);
      res.send(result);
    });

    // MongoDB Test
    await client.db("admin").command({ ping: 1 });
    console.log("✅ Connected to MongoDB successfully!");
  } finally {
  }
}

run().catch(console.dir);

// Root route
app.get("/", (req, res) => {
  res.send("✅ Smart Deals Server is running!");
});

// Listen
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
