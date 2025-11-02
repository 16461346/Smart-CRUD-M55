const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 1000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

//Middleware
app.use(cors());
app.use(express.json());

//crud-smart-deals
//SkhRLIC5seBExS9n
const uri =
  "mongodb+srv://crud-smart-deals:SkhRLIC5seBExS9n@cluster0.4kmqo4g.mongodb.net/?appName=Cluster0";

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

    app.get('/products', async (req,res)=>{
        const cursor=productsCollection.find()
        const result=await cursor.toArray();
        res.send(result)
    })

    app.get('/products/:id', async(req,res)=>{
        const id=req.params.id;
        const query={_id: new ObjectId (id)}
        const result= await productsCollection.findOne(query)
        res.send(result)
    })

    app.post("/products", async (req, res) => {
      const newProducts = req.body;
      const result = await productsCollection.insertOne(newProducts);
      res.send(result);
    });

    app.patch("/products/:id", async (req, res) => {
      const id = req.params.id;
      const updatedProducts=req.body;
      const query = { _id: new ObjectId(id) };
      const update={
        $set:{
            name: updatedProducts.name,
            price: updatedProducts.price
        }
      }
      const result= await productsCollection.updateOne(query,update)
      res.send(result)
    });

    app.delete("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await productsCollection.deleteOne(query);
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("paise amar server");
});

app.listen(port, (req, res) => {
  console.log(`amar server colse ${port}`);
});
