import app from './app.js';
import connectDB from './config/db.js';
import { env } from './config/env.js';

const startServer = async () => {
  try {
    await connectDB();
    console.log("MongoDB Connected ✅");
  } catch (error) {
    console.error("MongoDB Failed ❌:", error.message);
  }

  // ✅ ALWAYS start server
  app.listen(env.PORT || 5000, () => {
    console.log(`Backend running on port ${env.PORT}`);
  });
};

startServer();