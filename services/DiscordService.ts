import type Database from "../utils/Database.js"
import { Client, GatewayIntentBits, Partials } from "discord.js"

export class DiscordService {
  private database: Database
  private client: Client
  private isReady = false

  constructor(database: Database) {
    this.database = database

    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
      ],
      partials: [Partials.Channel],
    })

    this.setupEventHandlers()
    this.connect()
  }

  private setupEventHandlers(): void {
    this.client.on("ready", () => {
      console.log(`Logged in as ${this.client.user?.tag}!`)
      this.isReady = true
    })

    this.client.on("error", (error) => {
      console.error("Discord client error:", error)
      this.isReady = false
    })
  }

  private async connect(): Promise<void> {
    try {
      await this.client.login(process.env.DISCORD_TOKEN)
    } catch (error) {
      console.error("Failed to connect to Discord:", error)
    }
  }

  public async linkDiscordAccount(userId: number, discordId: string): Promise<boolean> {
    try {
      await this.database.query("UPDATE players SET discord_id = ? WHERE id = ?", [discordId, userId])

      await this.updateDiscordRoles(discordId)
      return true
    } catch (error) {
      console.error("Error linking Discord account:", error)
      return false
    }
  }

  public async unlinkDiscordAccount(userId: number): Promise<boolean> {
    try {
      const user = await this.database.query("SELECT discord_id FROM players WHERE id = ?", [userId])

      if (!user || user.length === 0 || !user[0].discord_id) {
        return false
      }

      const discordId = user[0].discord_id

      await this.database.query("UPDATE players SET discord_id = NULL WHERE id = ?", [userId])

      await this.removeDiscordRoles(discordId)
      return true
    } catch (error) {
      console.error("Error unlinking Discord account:", error)
      return false
    }
  }

  public async updateDiscordRoles(discordId: string): Promise<boolean> {
    if (!this.isReady) {
      console.error("Discord client not ready")
      return false
    }

    try {
      const userData = await this.database.query(
        "SELECT p.*, f.name as faction_name FROM players p LEFT JOIN factions f ON p.faction = f.name WHERE p.discord_id = ?",
        [discordId],
      )

      if (!userData || userData.length === 0) {
        return false
      }

      const user = userData[0]
      const guild = this.client.guilds.cache.first()

      if (!guild) {
        console.error("No guild found")
        return false
      }

      const member = await guild.members.fetch(discordId)
      if (!member) {
        console.error("Member not found in guild")
        return false
      }

      // Add default role
      const defaultRoleId = process.env.DISCORD_DEFAULT_ROLE_ID
      if (defaultRoleId) {
        await member.roles.add(defaultRoleId)
      }

      // Add rank role if exists
      if (user.player_permlevel > 0) {
        const rankRoles = await this.database.query("SELECT discord_role_id FROM ranks WHERE permlevel = ?", [
          user.player_permlevel,
        ])

        if (rankRoles && rankRoles.length > 0 && rankRoles[0].discord_role_id) {
          await member.roles.add(rankRoles[0].discord_role_id)
        }
      }

      // Add faction role if exists
      if (user.faction_name) {
        const factionRoles = await this.database.query("SELECT discord_role_id FROM factions WHERE name = ?", [
          user.faction_name,
        ])

        if (factionRoles && factionRoles.length > 0 && factionRoles[0].discord_role_id) {
          await member.roles.add(factionRoles[0].discord_role_id)
        }
      }

      return true
    } catch (error) {
      console.error("Error updating Discord roles:", error)
      return false
    }
  }

  private async removeDiscordRoles(discordId: string): Promise<boolean> {
    if (!this.isReady) {
      console.error("Discord client not ready")
      return false
    }

    try {
      const guild = this.client.guilds.cache.first()

      if (!guild) {
        console.error("No guild found")
        return false
      }

      const member = await guild.members.fetch(discordId)
      if (!member) {
        console.error("Member not found in guild")
        return false
      }

      // Get all role IDs that are related to the game
      const gameRoles = await this.database.query(
        "SELECT discord_role_id FROM ranks WHERE discord_role_id IS NOT NULL " +
          "UNION SELECT discord_role_id FROM factions WHERE discord_role_id IS NOT NULL",
      )

      if (gameRoles && gameRoles.length > 0) {
        for (const role of gameRoles) {
          if (member.roles.cache.has(role.discord_role_id)) {
            await member.roles.remove(role.discord_role_id)
          }
        }
      }

      return true
    } catch (error) {
      console.error("Error removing Discord roles:", error)
      return false
    }
  }

  public async sendDirectMessage(discordId: string, message: string): Promise<boolean> {
    if (!this.isReady) {
      console.error("Discord client not ready")
      return false
    }

    try {
      const user = await this.client.users.fetch(discordId)
      if (!user) {
        console.error("User not found")
        return false
      }

      await user.send(message)
      return true
    } catch (error) {
      console.error("Error sending direct message:", error)
      return false
    }
  }

  public getClient(): Client {
    return this.client
  }
}

