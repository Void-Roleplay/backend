import type Database from "../utils/Database.js"

export class GameplayService {
  private database: Database

  constructor(database: Database) {
    this.database = database
  }

  public async getPlayerStats(playerId: number): Promise<any> {
    try {
      const result = await this.database.query(
        "SELECT p.*, " +
          "(SELECT COUNT(*) FROM player_kills WHERE killer_id = p.id) as kills, " +
          "(SELECT COUNT(*) FROM player_kills WHERE victim_id = p.id) as deaths " +
          "FROM players p WHERE p.id = ?",
        [playerId],
      )

      if (!result || result.length === 0) {
        return null
      }

      return result[0]
    } catch (error) {
      console.error("Error getting player stats:", error)
      return null
    }
  }

  public async updatePlayerPosition(playerId: number, x: number, y: number, z: number): Promise<boolean> {
    try {
      await this.database.query("UPDATE players SET position_x = ?, position_y = ?, position_z = ? WHERE id = ?", [
        x,
        y,
        z,
        playerId,
      ])
      return true
    } catch (error) {
      console.error("Error updating player position:", error)
      return false
    }
  }

  public async logPlayerKill(killerId: number, victimId: number, weaponId: string): Promise<boolean> {
    try {
      await this.database.query(
        "INSERT INTO player_kills (killer_id, victim_id, weapon_id, timestamp) VALUES (?, ?, ?, NOW())",
        [killerId, victimId, weaponId],
      )
      return true
    } catch (error) {
      console.error("Error logging player kill:", error)
      return false
    }
  }

  public async getPlayerInventory(playerId: number): Promise<any[]> {
    try {
      const inventory = await this.database.query("SELECT * FROM player_inventory WHERE player_id = ?", [playerId])
      return inventory || []
    } catch (error) {
      console.error("Error getting player inventory:", error)
      return []
    }
  }

  public async addItemToInventory(playerId: number, itemId: string, quantity: number): Promise<boolean> {
    try {
      // Check if player already has this item
      const existingItem = await this.database.query(
        "SELECT * FROM player_inventory WHERE player_id = ? AND item_id = ?",
        [playerId, itemId],
      )

      if (existingItem && existingItem.length > 0) {
        // Update quantity
        await this.database.query(
          "UPDATE player_inventory SET quantity = quantity + ? WHERE player_id = ? AND item_id = ?",
          [quantity, playerId, itemId],
        )
      } else {
        // Insert new item
        await this.database.query("INSERT INTO player_inventory (player_id, item_id, quantity) VALUES (?, ?, ?)", [
          playerId,
          itemId,
          quantity,
        ])
      }

      return true
    } catch (error) {
      console.error("Error adding item to inventory:", error)
      return false
    }
  }
}

