import type Database from "../utils/Database.js"

export class FactionService {
  private database: Database

  constructor(database: Database) {
    this.database = database
  }

  public async getAllFactions(): Promise<any[]> {
    try {
      const factions = await this.database.query("SELECT * FROM factions WHERE isActive = 1 ORDER BY name")
      return factions || []
    } catch (error) {
      console.error("Error getting all factions:", error)
      return []
    }
  }

  public async getFactionByName(name: string): Promise<any> {
    try {
      const result = await this.database.query("SELECT * FROM factions WHERE name = ?", [name])

      if (!result || result.length === 0) {
        return null
      }

      return result[0]
    } catch (error) {
      console.error("Error getting faction by name:", error)
      return null
    }
  }

  public async getFactionById(id: number): Promise<any> {
    try {
      const result = await this.database.query("SELECT * FROM factions WHERE id = ?", [id])

      if (!result || result.length === 0) {
        return null
      }

      return result[0]
    } catch (error) {
      console.error("Error getting faction by ID:", error)
      return null
    }
  }

  public async getFactionMembers(factionName: string): Promise<any[]> {
    try {
      const members = await this.database.query(
        "SELECT id, player_name, player_permlevel, isLeader, secondaryTeam FROM players WHERE faction = ? ORDER BY isLeader DESC, player_name",
        [factionName],
      )

      return members || []
    } catch (error) {
      console.error("Error getting faction members:", error)
      return []
    }
  }

  public async createFaction(
    name: string,
    fullname: string,
    teamSpeakId: string,
    channelGroupId: string,
  ): Promise<any> {
    try {
      const result = await this.database.query(
        "INSERT INTO factions (name, fullname, TeamSpeakID, ChannelGroupID, isActive) VALUES (?, ?, ?, ?, 1)",
        [name, fullname, teamSpeakId, channelGroupId],
      )

      if (!result || !result.insertId) {
        return null
      }

      return this.getFactionById(result.insertId)
    } catch (error) {
      console.error("Error creating faction:", error)
      return null
    }
  }

  public async updateFaction(id: number, data: any): Promise<boolean> {
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

      await this.database.query(`UPDATE factions SET ${fields.join(", ")} WHERE id = ?`, values)

      return true
    } catch (error) {
      console.error("Error updating faction:", error)
      return false
    }
  }

  public async deleteFaction(id: number): Promise<boolean> {
    try {
      // Instead of actually deleting, we set isActive to 0
      await this.database.query("UPDATE factions SET isActive = 0 WHERE id = ?", [id])

      // Remove all members from the faction
      await this.database.query(
        "UPDATE players SET faction = NULL, isLeader = 0 WHERE faction = (SELECT name FROM factions WHERE id = ?)",
        [id],
      )

      return true
    } catch (error) {
      console.error("Error deleting faction:", error)
      return false
    }
  }

  public async addMemberToFaction(userId: number, factionName: string, isLeader = false): Promise<boolean> {
    try {
      await this.database.query("UPDATE players SET faction = ?, isLeader = ? WHERE id = ?", [
        factionName,
        isLeader ? 1 : 0,
        userId,
      ])

      return true
    } catch (error) {
      console.error("Error adding member to faction:", error)
      return false
    }
  }

  public async removeMemberFromFaction(userId: number): Promise<boolean> {
    try {
      await this.database.query("UPDATE players SET faction = NULL, isLeader = 0 WHERE id = ?", [userId])

      return true
    } catch (error) {
      console.error("Error removing member from faction:", error)
      return false
    }
  }

  public async promoteMemberToLeader(userId: number): Promise<boolean> {
    try {
      await this.database.query("UPDATE players SET isLeader = 1 WHERE id = ?", [userId])

      return true
    } catch (error) {
      console.error("Error promoting member to leader:", error)
      return false
    }
  }

  public async demoteMemberFromLeader(userId: number): Promise<boolean> {
    try {
      await this.database.query("UPDATE players SET isLeader = 0 WHERE id = ?", [userId])

      return true
    } catch (error) {
      console.error("Error demoting member from leader:", error)
      return false
    }
  }

  public async getFactionBalance(factionName: string): Promise<number> {
    try {
      const result = await this.database.query("SELECT balance FROM faction_finances WHERE faction_name = ?", [
        factionName,
      ])

      if (!result || result.length === 0) {
        return 0
      }

      return result[0].balance || 0
    } catch (error) {
      console.error("Error getting faction balance:", error)
      return 0
    }
  }

  public async updateFactionBalance(factionName: string, amount: number): Promise<boolean> {
    try {
      // Check if faction finance record exists
      const exists = await this.database.query("SELECT * FROM faction_finances WHERE faction_name = ?", [factionName])

      if (!exists || exists.length === 0) {
        // Create new record
        await this.database.query("INSERT INTO faction_finances (faction_name, balance) VALUES (?, ?)", [
          factionName,
          amount,
        ])
      } else {
        // Update existing record
        await this.database.query("UPDATE faction_finances SET balance = balance + ? WHERE faction_name = ?", [
          amount,
          factionName,
        ])
      }

      return true
    } catch (error) {
      console.error("Error updating faction balance:", error)
      return false
    }
  }

  public async setFactionBalance(factionName: string, amount: number): Promise<boolean> {
    try {
      // Check if faction finance record exists
      const exists = await this.database.query("SELECT * FROM faction_finances WHERE faction_name = ?", [factionName])

      if (!exists || exists.length === 0) {
        // Create new record
        await this.database.query("INSERT INTO faction_finances (faction_name, balance) VALUES (?, ?)", [
          factionName,
          amount,
        ])
      } else {
        // Update existing record
        await this.database.query("UPDATE faction_finances SET balance = ? WHERE faction_name = ?", [
          amount,
          factionName,
        ])
      }

      return true
    } catch (error) {
      console.error("Error setting faction balance:", error)
      return false
    }
  }
}

