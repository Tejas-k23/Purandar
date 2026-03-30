import connectDB from '../config/db.js';
import { env } from '../config/env.js';
import User from '../models/User.js';

const run = async () => {
  await connectDB();

  const existing = await User.findOne({ email: env.ADMIN_EMAIL.toLowerCase() }).select('+password');

  if (existing) {
    existing.name = env.ADMIN_NAME;
    existing.password = env.ADMIN_PASSWORD;
    existing.role = 'admin';
    existing.isActive = true;
    existing.tokenVersion += 1;
    existing.refreshTokenHash = null;
    await existing.save();
    console.log(`Admin user updated: ${existing.email}`);
  } else {
    const user = await User.create({
      name: env.ADMIN_NAME,
      email: env.ADMIN_EMAIL,
      password: env.ADMIN_PASSWORD,
      role: 'admin',
    });
    console.log(`Admin user created: ${user.email}`);
  }

  process.exit(0);
};

run().catch((error) => {
  console.error('Failed to seed admin user', error);
  process.exit(1);
});
