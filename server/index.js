const express = require("express");
const { MongoClient } = require("mongodb");
const cors = require("cors");
const app = express();
const port = 4000;

const url =
  `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@wazirxdata.3psbww1.mongodb.net/?retryWrites=true&w=majority`; // Change this URL to your MongoDB server
const dbName = "wazirx-all";
const collectionName = "tickers";
app.use(cors());
const axios = require("axios");
const cron = require("node-cron");

// Define a task to run every 2 minutes

let config = {
  method: "get",
  maxBodyLength: Infinity,
  url: "https://api.wazirx.com/api/v2/tickers",
  headers: {},
};

app.use(
  cors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

cron.schedule("*/2 * * * *", async () => {
  try {
    const response = await axios.request(config);
    const first10Items = [];

    let count = 0;

    for (const key in response.data) {
      if (count < 10) {
        const tickerData = {
          name: key,
          last: response.data[key]["last"],
          buy: response.data[key]["buy"],
          sell: response.data[key]["sell"],
          volume: response.data[key]["volume"],
          baseUnit: response.data[key]["base_unit"],
        };

        first10Items.push(tickerData);
        count++;
      } else {
        break;
      }
    }

    // Connect to MongoDB Atlas
    const client = new MongoClient(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    await client.connect();

    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    // Clear existing data
    await collection.deleteMany({});

    // Insert the new data
    await collection.insertMany(first10Items);

    // Close the MongoDB connection
    await client.close();

    console.log("Task completed successfully");
  } catch (error) {
    console.error("Error fetching data:", error);
  }
});

app.get("/getTickers", async (req, res) => {
  try {
    // Connect to MongoDB Atlas
    const client = new MongoClient(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    await client.connect();

    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    // Find all documents in the collection and convert them to an array
    const tickerData = await collection.find({}).toArray();

    // Close the MongoDB connection
    await client.close();

    // Send the ticker data as JSON response
    res.json(tickerData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred" });
  }
});

app.get("/getDocuments", async (req, res) => {
  try {
    const client = new MongoClient(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    await client.connect();

    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    const documents = await collection.find({}).limit(10).toArray();

    client.close();

    res.json(documents);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
