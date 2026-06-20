const mongoose = require("mongoose");

async function connectMongo() {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      throw new Error("MONGO_URI is not set in environment variables");
    }

    await mongoose.connect(uri, {
      dbName: "digital_menu",
    });

    console.log("MongoDB Atlas Connected Successfully!");
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}

module.exports = { connectMongo };

