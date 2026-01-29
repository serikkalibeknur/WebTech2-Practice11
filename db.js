const { MongoClient } = require("mongodb");

let client;
let db;

async function connectToDb() {
  if (db) return db;

  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017";
  client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 3000
  });
  await client.connect();

  db = client.db("shop");
  return db;
}

function getDb() {
  if (!db) {
    throw new Error("DB not initialized. Call connectToDb() before getDb().");
  }
  return db;
}

async function closeDb() {
  if (client) await client.close();
  client = undefined;
  db = undefined;
}