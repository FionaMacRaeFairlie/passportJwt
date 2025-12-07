// db/index.js
import path from "path";
import fs from "fs";
import Datastore from "nedb-promises";

/**
 * Create and initialize NeDB datastores.
 * Uses async so we can seed/check state if needed.
 */
export const createDB = async (dataDir) => {
  fs.mkdirSync(dataDir, { recursive: true });

  const users = Datastore.create({
    // filename: path.join(dataDir, "users.db"),
    filename: path.join(dataDir, "user.db"),
    autoload: true,
  });

  const sessions = Datastore.create({
    filename: path.join(dataDir, "sessions.db"),
    autoload: true,
  });

  // Example: seed an admin user if DB is empty (replace with bcrypt in real apps)
  const count = await users.count({});
  if (count === 0) {
    await users.insert({
      email: "admin@example.com",
      password: "admin", // ⚠️ placeholder; use hashing in production
      role: "admin",
      createdAt: new Date(),
    });
  }

  return { users, sessions };
};

export default createDB;
