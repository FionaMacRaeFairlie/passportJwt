// models/userModel.js
import path from "path";
import { fileURLToPath } from "url";
import Datastore from "nedb-promises";

// __dirname replacement in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class UserDAO {
  constructor(dbFilePath) {
    // If a filename is provided, use file-backed DB; otherwise, in-memory
    const options = dbFilePath?.filename
      ? { filename: dbFilePath.filename, autoload: true }
      : { inMemoryOnly: true, autoload: true };

    this.db = Datastore.create(options);
  }

  /**
   * Optional initializer — seed demo data if empty.
   * Replace with proper bcrypt hashing in production.
   */
  init = async () => {
    const count = await this.db.count({});
    if (count === 0) {
      await this.db.insert({
        user: "admin",
        // ⚠️ Demo only — NEVER store plaintext passwords in production
        password: "admin",
        role: "admin",
        createdAt: new Date(),
      });
    }
  };

  /**
   * Find exactly one user document by query
   * @param {Object} query e.g., { user: 'alice' } or { email: 'alice@example.com' }
   * @returns {Promise<Object|null>}
   */
  findOne = async (query) => {
    return this.db.findOne(query);
  };

  /**
   * Create a new user (demo version – no hashing)
   * @param {Object} doc e.g., { user, email, password, role }
   * @returns {Promise<Object>} the inserted document
   */
  create = async (doc) => {
    return this.db.insert({
      ...doc,
      createdAt: new Date(),
    });
  };

  /**
   * Update fields for a user by id
   * @param {string} id document _id
   * @param {Object} update fields to set
   * @returns {Promise<number>} number of documents updated
   */
  updateById = async (id, update) => {
    const result = await this.db.update(
      { _id: id },
      { $set: { ...update, updatedAt: new Date() } },
      { multi: false }
    );
    return result;
  };

  /**
   * Remove a user by id
   * @param {string} id document _id
   * @returns {Promise<number>} number of documents removed
   */
  removeById = async (id) => {
    const result = await this.db.remove({ _id: id }, { multi: false });
    return result;
  };

  /**
   * Convenience: count users matching a query
   */
  count = async (query = {}) => {
    return this.db.count(query);
  };
}

// ---- Singleton instance, file-backed in ./data/user.db ----
const dataDir = path.join(__dirname, "..", "data");
const dao = new UserDAO({ filename: path.join(dataDir, "user.db") });

// Seed demo data (optional)
await dao.init();

export default dao;
