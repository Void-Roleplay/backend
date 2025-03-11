import type Database from "../utils/Database.js"

interface Rule {
  id: number
  title: string
  content: string
  category: string
  sort_order: number
  is_active: number
  created_at: Date
  updated_at: Date | null
}

interface WebRule {
  id: number
  isArea: number
  area: string
  isType: number
  type: string
  rule: string
}

export class AdminService {
  private database: Database

  constructor(database: Database) {
    this.database = database
  }

  // User management methods...

  // Ban management methods...

  // Rules management
  public async getAllRules(): Promise<Rule[]> {
    try {
      const rules: Rule[] = await this.database.query(
        "SELECT * FROM rules WHERE is_active = 1 ORDER BY category, sort_order",
      )
      return rules || []
    } catch (error) {
      console.error("Error getting all rules:", error)
      return []
    }
  }

  public async getRuleById(ruleId: number): Promise<Rule | null> {
    try {
      const result: Rule[] = await this.database.query("SELECT * FROM rules WHERE id = ?", [ruleId])

      if (!result || result.length === 0) {
        return null
      }

      return result[0]
    } catch (error) {
      console.error("Error getting rule by ID:", error)
      return null
    }
  }

  public async getRulesByCategory(category: string): Promise<Rule[]> {
    try {
      const rules: Rule[] = await this.database.query(
        "SELECT * FROM rules WHERE category = ? AND is_active = 1 ORDER BY sort_order",
        [category],
      )

      return rules || []
    } catch (error) {
      console.error("Error getting rules by category:", error)
      return []
    }
  }

  public async createRule(title: string, content: string, category: string, sortOrder = 0): Promise<Rule | null> {
    try {
      const result: any = await this.database.query(
        "INSERT INTO rules (title, content, category, sort_order, is_active, created_at) VALUES (?, ?, ?, ?, 1, NOW())",
        [title, content, category, sortOrder],
      )

      if (!result || !result.insertId) {
        return null
      }

      return this.getRuleById(result.insertId)
    } catch (error) {
      console.error("Error creating rule:", error)
      return null
    }
  }

  public async updateRule(ruleId: number, data: Partial<Rule>): Promise<boolean> {
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

      // Add updated_at timestamp
      fields.push("updated_at = NOW()")

      values.push(ruleId)

      await this.database.query(`UPDATE rules SET ${fields.join(", ")} WHERE id = ?`, values)

      return true
    } catch (error) {
      console.error("Error updating rule:", error)
      return false
    }
  }

  public async deleteRule(ruleId: number): Promise<boolean> {
    try {
      // Instead of actually deleting, we set is_active to 0
      await this.database.query("UPDATE rules SET is_active = 0, updated_at = NOW() WHERE id = ?", [ruleId])

      return true
    } catch (error) {
      console.error("Error deleting rule:", error)
      return false
    }
  }

  // Web Rules management
  public async getAllWebRules(): Promise<WebRule[]> {
    try {
      const rules: WebRule[] = await this.database.query("SELECT * FROM webRules")
      return rules || []
    } catch (error) {
      console.error("Error getting all web rules:", error)
      return []
    }
  }

  public async getWebRuleById(ruleId: number): Promise<WebRule | null> {
    try {
      const result: WebRule[] = await this.database.query("SELECT * FROM webRules WHERE id = ?", [ruleId])

      if (!result || result.length === 0) {
        return null
      }

      return result[0]
    } catch (error) {
      console.error("Error getting web rule by ID:", error)
      return null
    }
  }

  public async createWebRule(): Promise<number | null> {
    try {
      const result: any = await this.database.query("INSERT INTO webRules () VALUES ()")

      if (!result || !result.insertId) {
        return null
      }

      return result.insertId
    } catch (error) {
      console.error("Error creating web rule:", error)
      return null
    }
  }

  public async updateWebRule(
    ruleId: number,
    isArea: number,
    area: string,
    isType: number,
    type: string,
    rule: string,
  ): Promise<boolean> {
    try {
      await this.database.query(
        "UPDATE webRules SET isArea = ?, area = ?, isType = ?, type = ?, rule = ? WHERE id = ?",
        [isArea, area, isType, type, rule, ruleId],
      )

      return true
    } catch (error) {
      console.error("Error updating web rule:", error)
      return false
    }
  }

  public async deleteWebRule(ruleId: number): Promise<boolean> {
    try {
      await this.database.query("DELETE FROM webRules WHERE id = ?", [ruleId])
      return true
    } catch (error) {
      console.error("Error deleting web rule:", error)
      return false
    }
  }

  // Server stats
  public async getServerStats(): Promise<any> {
    try {
      const totalUsers: any[] = await this.database.query("SELECT COUNT(*) as count FROM players")
      const onlineUsers: any[] = await this.database.query(
        "SELECT COUNT(*) as count FROM players WHERE last_login > DATE_SUB(NOW(), INTERVAL 15 MINUTE)",
      )
      const totalFactions: any[] = await this.database.query("SELECT COUNT(*) as count FROM factions")

      return {
        totalUsers: totalUsers[0].count,
        onlineUsers: onlineUsers[0].count,
        totalFactions: totalFactions[0].count,
      }
    } catch (error) {
      console.error("Error getting server stats:", error)
      return {
        totalUsers: 0,
        onlineUsers: 0,
        totalFactions: 0,
      }
    }
  }
}

