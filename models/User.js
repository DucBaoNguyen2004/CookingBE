import db from "../config/db.js";
import bcrypt from "bcryptjs";

class User {

  static async create({ name, email, password }) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db.query(
      `INSERT INTO users (name,email,password_hash) VALUES ($1,$2,$3) RETURNING id,name,email`,
      [name, email, hashedPassword]
    );
    return result.rows[0];
  }

  // Find user by email
  static async findByEmail(email) {
    const result = await db.query(
      `SELECT id, email, name,password_hash  , created_at, updated_at
     FROM users
     WHERE email = $1`,
      [email]
    );
    return result.rows[0];
  }

  // Find user by ID
  static async findById(id) {
    const result = await db.query(
      `SELECT id, email, name, password_hash, created_at, updated_at
     FROM users
     WHERE id = $1`,
      [id]
    );
    return result.rows[0];
  }

  // Update user
  static async update(id, { name, email }) {
    const result = await db.query(
      `UPDATE users 
     SET name  = COALESCE($1, name),
         email = COALESCE($2, email),
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $3
     RETURNING id, name, email, created_at, updated_at`,
      [name, email, id]
    );
    return result.rows[0];
  }

  // Update password
  static async updatePassword(id, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.query(
      'UPDATE users SET password_hash = $1 WHERE id = $2',
      [hashedPassword, id]
    );
  }

  // Verify password
  static async verifyPassword(plainPassword, hashedPassword) {
    if (!plainPassword || !hashedPassword) {
      return false;
    }
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  // Delete user
  static async delete(id) {
    const result = await db.query(
      `DELETE FROM users
     WHERE id = $1
     RETURNING id, email, name`,
      [id]
    );
    return result.rows[0];
  }

}

export default User;