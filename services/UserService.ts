import type Database from "../utils/Database.js"
import bcrypt from "bcrypt"
import { v4 as uuidv4 } from "uuid"
import jwt from "jsonwebtoken"

export interface UserModel {
  id: number
  player_name: string
  email: string
  password: string
  uuid: string
  player_permlevel: number
  player_permission: number
  faction?: string
  isLeader?: boolean
  secondaryTeam?: string
  money?: number
  is_banned?: number
  teamSpeakUID?: string
  discord_id?: string
  last_login?: Date
  created_at: Date
}

export class UserService {
  private database: Database

  constructor(database: Database) {
    this.database = database
  }

  public async getUserById(id: number): Promise<UserModel | null> {
    try {
      const result: any[] = await this.database.query("SELECT * FROM players WHERE id = ?", [id])
      if (!result || result.length === 0) {
        return null
      }
      return result[0] as UserModel
    } catch (error) {
      console.error("Error getting user by ID:", error)
      return null
    }
  }

  public async getUserByEmail(email: string): Promise<UserModel | null> {
    try {
      const result: any[] = await this.database.query("SELECT * FROM players WHERE email = ?", [email])
      if (!result || result.length === 0) {
        return null
      }
      return result[0] as UserModel
    } catch (error) {
      console.error("Error getting user by email:", error)
      return null
    }
  }

  public async getUserByUsername(username: string): Promise<UserModel | null> {
    try {
      const result: any[] = await this.database.query("SELECT * FROM players WHERE player_name = ?", [username])
      if (!result || result.length === 0) {
        return null
      }
      return result[0] as UserModel
    } catch (error) {
      console.error("Error getting user by username:", error)
      return null
    }
  }

  public async findByNameAsync(name: string): Promise<UserModel | null> {
    try {
      const result: any[] = await this.database.query("SELECT * FROM players WHERE player_name LIKE ?", [`%${name}%`])

      if (!result || result.length === 0) {
        return null
      }

      return result[0] as UserModel
    } catch (error) {
      console.error("Error finding user by name:", error)
      return null
    }
  }

  public async getPlayers(limit = 100, offset = 0): Promise<UserModel[]> {
    try {
      const result: any[] = await this.database.query("SELECT * FROM players ORDER BY id LIMIT ? OFFSET ?", [
        limit,
        offset,
      ])

      return result as UserModel[]
    } catch (error) {
      console.error("Error getting players:", error)
      return []
    }
  }

  public async getUserDataByToken(token: string): Promise<UserModel | null> {
    try {
      if (!token) return null

      // Remove "Bearer " prefix if present
      if (token.startsWith("Bearer ")) {
        token = token.slice(7)
      }

      // Verify and decode the JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "default_secret") as any

      // Get the user data from the database
      const userData = await this.getUserById(decoded.id)
      if (!userData) {
        return null
      }

      return userData
    } catch (error) {
      console.error("Error getting user data by token:", error)
      return null
    }
  }

  public async createUser(username: string, email: string, password: string): Promise<UserModel | null> {
    try {
      const hashedPassword = await bcrypt.hash(password, 10)
      const uuid = uuidv4()

      const result: any = await this.database.query(
        "INSERT INTO players (player_name, email, password, uuid, created_at) VALUES (?, ?, ?, ?, NOW())",
        [username, email, hashedPassword, uuid],
      )

      if (!result || !result.insertId) {
        return null
      }

      return this.getUserById(result.insertId)
    } catch (error) {
      console.error("Error creating user:", error)
      return null
    }
  }

  public async updateUser(id: number, data: Partial<UserModel>): Promise<boolean> {
    try {
      const fields: string[] = []
      const values: any[] = []

      for (const [key, value] of Object.entries(data)) {
        if (value !== undefined) {
          fields.push(`${key} = ?`)
          values.push(value)
        }
      }

      if (fields.length === 0) {
        return false
      }

      values.push(id)

      await this.database.query(`UPDATE players SET ${fields.join(", ")} WHERE id = ?`, values)

      return true
    } catch (error) {
      console.error("Error updating user:", error)
      return false
    }
  }

  public async updatePassword(id: number, password: string): Promise<boolean> {
    try {
      const hashedPassword = await bcrypt.hash(password, 10)

      await this.database.query("UPDATE players SET password = ? WHERE id = ?", [hashedPassword, id])

      return true
    } catch (error) {
      console.error("Error updating password:", error)
      return false
    }
  }

  public async deleteUser(id: number): Promise<boolean> {
    try {
      await this.database.query("DELETE FROM players WHERE id = ?", [id])
      return true
    } catch (error) {
      console.error("Error deleting user:", error)
      return false
    }
  }

  public async validatePassword(user: UserModel, password: string): Promise<boolean> {
    try {
      return await bcrypt.compare(password, user.password)
    } catch (error) {
      console.error("Error validating password:", error)
      return false
    }
  }

  public async generatePasswordResetToken(email: string): Promise<string | null> {
    try {
      const user = await this.getUserByEmail(email)
      if (!user) {
        return null
      }

      const resetToken = uuidv4()
      const tokenExpiry = new Date()
      tokenExpiry.setHours(tokenExpiry.getHours() + 1) // Token valid for 1 hour

      await this.database.query("UPDATE players SET reset_token = ?, reset_token_expires = ? WHERE id = ?", [
        resetToken,
        tokenExpiry,
        user.id,
      ])

      return resetToken
    } catch (error) {
      console.error("Error generating password reset token:", error)
      return null
    }
  }

  public async validateResetToken(token: string): Promise<UserModel | null> {
    try {
      const result: any[] = await this.database.query(
        "SELECT * FROM players WHERE reset_token = ? AND reset_token_expires > NOW()",
        [token],
      )

      if (!result || result.length === 0) {
        return null
      }

      return result[0] as UserModel
    } catch (error) {
      console.error("Error validating reset token:", error)
      return null
    }
  }

  public async resetPassword(token: string, password: string): Promise<boolean> {
    try {
      const user = await this.validateResetToken(token)
      if (!user) {
        return false
      }

      const hashedPassword = await bcrypt.hash(password, 10)

      await this.database.query(
        "UPDATE players SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?",
        [hashedPassword, user.id],
      )

      return true
    } catch (error) {
      console.error("Error resetting password:", error)
      return false
    }
  }

  public async updateLastLogin(id: number): Promise<boolean> {
    try {
      await this.database.query("UPDATE players SET last_login = NOW() WHERE id = ?", [id])
      return true
    } catch (error) {
      console.error("Error updating last login:", error)
      return false
    }
  }

  public async getOnlineUsers(): Promise<UserModel[]> {
    try {
      const result: any[] = await this.database.query(
        "SELECT * FROM players WHERE last_login > DATE_SUB(NOW(), INTERVAL 15 MINUTE)",
      )
      return result as UserModel[]
    } catch (error) {
      console.error("Error getting online users:", error)
      return []
    }
  }

  public async generateTeamSpeakToken(userId: number): Promise<string | null> {
    try {
      const token = Math.random().toString(36).substring(2, 10)

      await this.database.query("UPDATE players SET tsToken = ? WHERE id = ?", [token, userId])

      return token
    } catch (error) {
      console.error("Error generating TeamSpeak token:", error)
      return null
    }
  }
}

