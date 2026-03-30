import app from './app.js';
import connectDB from './config/db.js';
import { env } from './config/env.js';

const startServer = async () => {
  await connectDB();

  app.listen(env.PORT, () => {
    console.log(`Backend running on port ${env.PORT}`);
  });
};

startServer().catch((error) => {
  console.error('Failed to start backend', error);
  process.exit(1);
});
