import express from "express";
import { app } from "./app.js";
import { connectDb } from "./db.js";
import { config } from "./config.js";
import { startEventIndexer } from "./services/events.js";
import { errorHandler } from "./middleware/error.js";

// Initialize the main Express app
const mainApp = express();

// Connect to database and start indexer
await connectDb();
await startEventIndexer();

// Mount your existing app routes under /api
mainApp.use("/api", app);

// Error handler MUST be registered after routes
mainApp.use(errorHandler);

mainApp.listen(config.port, () => {
  console.log(`Backend running on http://localhost:${config.port}`);
  console.log(`API available at http://localhost:${config.port}/api`);
});