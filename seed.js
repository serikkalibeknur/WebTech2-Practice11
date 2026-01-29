const { connectToDb, getDb, closeDb } = require("./db");

async function seed() {
  try {
    await connectToDb();

    const productsCol = getDb().collection("products");

    const products = [
      {
        name: "Keyboard",
        price: 120,
        category: "Electronics"
      },
      {
        name: "Mouse",
        price: 60,
        category: "Electronics"
      },
      {
        name: "Monitor",
        price: 300,
        category: "Electronics"
      },
      {
        name: "Office Chair",
        price: 200,
        category: "Furniture"
      },
      {
        name: "Notebook",
        price: 10,
        category: "Stationery"
      }
    ];

    await productsCol.insertMany(products);

    console.log("Seed completed: inserted products");
  } catch (e) {
    console.error("Seed error:", e.message);
  } finally {
    await closeDb();
    process.exit(0);
  }
}