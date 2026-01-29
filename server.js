const express = require("express");
const { connectToDb, getDb, closeDb } = require("./db");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000; 

app.get("/", (req, res) => {
  return res.json({
    message: "Shop API is running in production",
    endpoints: {
      products: "/api/products"
    }
  });
});

app.post("/api/products", async (req, res) => {
  try {
    const result = await getDb().collection("products").insertOne(req.body);
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: "Failed to create product" });
  }
});

app.get("/", (req, res) => {
  return res.json({
    message: "Shop API is running",
    endpoints: {
      health: "/health",
      products: "/api/products",
      examples: [
        "/api/products?category=Electronics",
        "/api/products?minPrice=50&sort=price",
        "/api/products?fields=name,price"
      ]
    }
  });
});

function parseProjection(fieldsParam) {
  if (!fieldsParam) return undefined;

  const fields = fieldsParam
    .split(",")
    .map((f) => f.trim())
    .filter(Boolean);

  if (fields.length === 0) return undefined;

  const projection = {};
  for (const field of fields) projection[field] = 1;

  if (!Object.prototype.hasOwnProperty.call(projection, "_id")) {
    projection._id = 0;
  }

  return projection;
}

app.get("/api/products", async (req, res) => {
  try {
    const { category, minPrice, sort, fields } = req.query;

    const filter = {};
    if (category) filter.category = category;

    if (minPrice !== undefined) {
      const min = Number(minPrice);
      if (Number.isNaN(min)) {
        return res.status(400).json({ error: "minPrice must be a number" });
      }
      filter.price = { $gte: min };
    }

    const options = {};

    const projection = parseProjection(fields);
    if (projection) options.projection = projection;

    if (sort === "price") {
      options.sort = { price: 1 };
    }

    const products = await getDb()
      .collection("products")
      .find(filter, options)
      .toArray();

    return res.json(products);
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/health", (req, res) => res.json({ ok: true }));

async function start() {
  try {
    await connectToDb();
  } catch (e) {
    console.error("Failed to connect to MongoDB. Check MONGODB_URI and that MongoDB is running.");
    process.exit(1);
  }

  const server = app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  const shutdown = async () => {
    await closeDb();
    server.close(() => process.exit(0));
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

start().catch(() => {
  process.exit(1);
});

async function start() {
  try {
    await connectToDb();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (e) {
    console.error("DB Connection Failed", e);
    process.exit(1);
  }
}