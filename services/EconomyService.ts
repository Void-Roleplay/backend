import type Database from "../utils/Database.js"

export class EconomyService {
  private database: Database

  constructor(database: Database) {
    this.database = database
  }

  public async getUserBalance(userId: number): Promise<number> {
    try {
      const result = await this.database.query("SELECT money FROM players WHERE id = ?", [userId])
      if (!result || result.length === 0) {
        return 0
      }
      return result[0].money || 0
    } catch (error) {
      console.error("Error getting user balance:", error)
      return 0
    }
  }

  public async updateUserBalance(userId: number, amount: number): Promise<boolean> {
    try {
      await this.database.query("UPDATE players SET money = money + ? WHERE id = ?", [amount, userId])
      return true
    } catch (error) {
      console.error("Error updating user balance:", error)
      return false
    }
  }

  public async setUserBalance(userId: number, amount: number): Promise<boolean> {
    try {
      await this.database.query("UPDATE players SET money = ? WHERE id = ?", [amount, userId])
      return true
    } catch (error) {
      console.error("Error setting user balance:", error)
      return false
    }
  }

  public async transferMoney(fromUserId: number, toUserId: number, amount: number): Promise<boolean> {
    try {
      // Start transaction
      await this.database.query("START TRANSACTION")

      // Check if sender has enough money
      const senderBalance = await this.getUserBalance(fromUserId)
      if (senderBalance < amount) {
        await this.database.query("ROLLBACK")
        return false
      }

      // Update balances
      await this.database.query("UPDATE players SET money = money - ? WHERE id = ?", [amount, fromUserId])
      await this.database.query("UPDATE players SET money = money + ? WHERE id = ?", [amount, toUserId])

      // Commit transaction
      await this.database.query("COMMIT")
      return true
    } catch (error) {
      console.error("Error transferring money:", error)
      await this.database.query("ROLLBACK")
      return false
    }
  }

  public async getTopBalances(limit = 10): Promise<any[]> {
    try {
      const results = await this.database.query(
        "SELECT id, player_name, money FROM players ORDER BY money DESC LIMIT ?",
        [limit],
      )
      return results || []
    } catch (error) {
      console.error("Error getting top balances:", error)
      return []
    }
  }
}

