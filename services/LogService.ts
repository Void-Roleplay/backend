import type Database from "../utils/Database.js"

export class LogService {
  private database: Database

  constructor(database: Database) {
    this.database = database
  }

  public async logAction(userId: number, action: string, details: string): Promise<void> {
    try {
      await this.database.query("INSERT INTO logs (user_id, action, details, timestamp) VALUES (?, ?, ?, NOW())", [
        userId,
        action,
        details,
      ])
    } catch (error) {
      console.error("Error logging action:", error)
    }
  }

  public async getRecentLogs(limit = 100): Promise<any[]> {
    try {
      const logs = await this.database.query(
        "SELECT l.*, u.player_name FROM logs l LEFT JOIN players u ON l.user_id = u.id ORDER BY l.timestamp DESC LIMIT ?",
        [limit],
      )
      return logs || []
    } catch (error) {
      console.error("Error getting recent logs:", error)
      return []
    }
  }

  public async getUserLogs(userId: number, limit = 50): Promise<any[]> {
    try {
      const logs = await this.database.query("SELECT * FROM logs WHERE user_id = ? ORDER BY timestamp DESC LIMIT ?", [
        userId,
        limit,
      ])
      return logs || []
    } catch (error) {
      console.error("Error getting user logs:", error)
      return []
    }
  }

  public async getLogsByAction(action: string, limit = 50): Promise<any[]> {
    try {
      const logs = await this.database.query(
        "SELECT l.*, u.player_name FROM logs l LEFT JOIN players u ON l.user_id = u.id WHERE l.action = ? ORDER BY l.timestamp DESC LIMIT ?",
        [action, limit],
      )
      return logs || []
    } catch (error) {
      console.error("Error getting logs by action:", error)
      return []
    }
  }
}

