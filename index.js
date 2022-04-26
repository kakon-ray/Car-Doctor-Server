const express = require("express");
const cors = require("cors");
var jwt = require("jsonwebtoken");

require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;
const ObjectId = require("mongodb").ObjectId;
// username: geniusUser
// password: RoL6iUcn2laTQlE3

// middleware
app.use(cors());
app.use(express.json());

function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: "unauthorized access" });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).send({ message: "Forbidden access" });
    }
    // console.log("decoded", decoded);
    req.decoded = decoded;
    next();
  });
}

const { MongoClient, ServerApiVersion } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.1zds3.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();
    const userCollection = client.db("giniusCar").collection("service");
    const orderCollection = client.db("giniusCar").collection("order");

    // this is jwt token use api
    // create jwt web token: require('crypto').randomBytes(64).toString('hex')
    app.post("/login", (req, res) => {
      const user = req.body;
      const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1d",
      });
      res.send({ accessToken });
    });

    // service api //red api
    // get data to database this api call to show data clint side
    app.get("/service", async (req, res) => {
      const query = {};
      const cursor = userCollection.find(query);
      const service = await cursor.toArray();
      res.send(service);
    });

    // Red Api specific id
    // button e click korle sai servicee details page niye jaoyar API
    app.get("/service/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const service = await userCollection.findOne(query);
      res.send(service);
    });

    // create api
    // POST mathod : add a new services
    app.post("/service", async (req, res) => {
      const addService = req.body;
      console.log("adding new user", addService);
      const result = await userCollection.insertOne(addService);
      res.send(result);
    });

    // create api
    // front end theke data niye database send korar API
    app.post("/order", async (req, res) => {
      const addService = req.body;
      console.log("adding new user", addService);
      const result = await orderCollection.insertOne(addService);
      res.send(result);
    });

    // Red Api specific email
    // prottek person er email match kore tar order orderpagee show korbe
    app.get("/order", verifyJWT, async (req, res) => {
      const decodeEmail = req.decoded.email;
      const email = req.query.email;
      if (decodeEmail === email) {
        const query = { email: email };
        const cursor = orderCollection.find(query);
        const order = await cursor.toArray();
        res.send(order);
      } else {
        res.status(404).send({ message: "forbedden access" });
      }
    });

    // delete api
    // delete service

    app.delete("/service/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const service = await userCollection.deleteOne(query);
      res.send(service);
    });
  } finally {
  }
}

run().catch(console.dir());

app.get("/", (req, res) => {
  res.send("Running ginius server");
});

// db users
app.listen(port, () => {
  console.log(`CROUD server is Running ${port}`);
});
