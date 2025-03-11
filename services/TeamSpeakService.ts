import { QueryProtocol, TeamSpeak, type TeamSpeakClient } from "ts3-nodejs-library"
import type { TextMessage } from "ts3-nodejs-library/lib/types/Events"
import type { ClientConnectEvent } from "ts3-nodejs-library"
import type Database from "../utils/Database.js"

interface IVerify {
  name: string
  uid: string
  uuid: string
}

interface Rank {
  id: number
  rang: string
  permlevel: number
  TeamSpeakID: string
  isSecondary: boolean
  forumID: number
  color: string
  shortName: string
}

interface Faction {
  id: number
  name: string
  fullname: string
  TeamSpeakID: string
  ChannelGroupID: string
  isActive: boolean
}

export class TeamSpeakService {
  private database: Database
  private teamspeak: TeamSpeak
  private verifies: IVerify[] = []

  constructor(database: Database) {
    this.database = database

    this.teamspeak = new TeamSpeak({
      host: process.env.TEAMSPEAK_HOST || "localhost",
      protocol: QueryProtocol.RAW,
      queryport: Number.parseInt(process.env.TEAMSPEAK_QUERYPORT || "10011"),
      serverport: Number.parseInt(process.env.TEAMSPEAK_SERVERPORT || "9987"),
      username: process.env.TEAMSPEAK_USERNAME || "serveradmin",
      password: process.env.TEAMSPEAK_PASSWORD || "",
      nickname: process.env.TEAMSPEAK_NICKNAME || "VoidRoleplay",
      keepAlive: true,
    })

    this.setupEventHandlers()
  }

  private setupEventHandlers(): void {
    this.teamspeak.on("clientconnect", this.handleClientConnect)
    this.teamspeak.on("textmessage", this.handleTextMessage)
    this.teamspeak.on("error", (error) => {
      console.error("TeamSpeak error:", error)
    })
  }

  private handleClientConnect = async (event: ClientConnectEvent): Promise<void> => {
    try {
      const client: TeamSpeakClient = event.client

      client.servergroups.forEach(async (serverGroup) => {
        if (serverGroup == "2235") {
          client.message(`Hey! Du bist noch nicht verifiziert. Nutze Ingame "/tslink ${client.uniqueIdentifier}"`)
        }
      })
    } catch (error) {
      console.error("Error handling client connect:", error)
    }
  }

  private handleTextMessage = async (event: TextMessage): Promise<void> => {
    try {
      const client: TeamSpeakClient = event.invoker

      for (const verify of [...this.verifies]) {
        if (client.uniqueIdentifier == verify.uid) {
          if (event.msg.toLowerCase() == "ja") {
            client.message(`Dein Account wurde mit ${verify.name} verknüpft.`)
            await this.updateUserUidByUUID(verify.uuid, verify.uid)
          } else {
            client.message("Der Account wurde nicht verknüpft.")
          }
          this.verifies = this.verifies.filter((v) => v != verify)
          return
        }
      }
    } catch (error) {
      console.error("Error handling text message:", error)
    }
  }

  public async verifyUser(uid: string, apiToken: string): Promise<boolean> {
    try {
      if (apiToken == null) return false

      var result: any = await this.database.query("SELECT * FROM players WHERE tsToken = ?", [apiToken])
      if (result == null) return false

      result = result[0]
      if (result == null) return false

      const name = result.player_name
      const uuid = result.uuid

      const client: TeamSpeakClient | undefined = await this.teamspeak.getClientByUid(uid)
      if (!client) return false

      client.message(`${name} möchte sich mit deinem TeamSpeak-Account verbinden, möchtest du das zulassen?`)
      client.message("Schreibe Ja oder Nein")

      this.verifies.push({
        name: name,
        uid: uid,
        uuid: uuid,
      })

      await this.database.query("UPDATE players SET tsToken = NULL WHERE uuid = ?", [uuid])
      return true
    } catch (error) {
      console.error("Error verifying user:", error)
      return false
    }
  }

  public async reloadUser(uid: string): Promise<boolean> {
    try {
      const client: TeamSpeakClient | undefined = await this.teamspeak.getClientByUid(uid)
      if (!client) return false

      let result: any = await this.database.query("SELECT * FROM players WHERE teamSpeakUID = ?", [uid])
      const user: any = result[0]

      if (user === undefined) {
        client.message("Etwas ist schief gelaufen, bitte betrete den Server neu oder melde dich im Support.")
        return false
      }

      const rankResult: any = await this.database.query("SELECT * FROM ranks")
      const ranks: Rank[] = rankResult

      result = await this.database.query("SELECT * FROM factions")
      const factions: Faction[] = result

      client.message("Deine Rechte wurden aktualisiert.")

      if (user.player_name !== undefined) {
        client.edit({ clientDescription: user.player_name })
      }

      try {
        client.servergroups.forEach((group) => {
          if (group !== "2235") {
            this.teamspeak.clientDelServerGroup(client.databaseId, group)
          }
        })
      } catch (error) {
        console.error("Fehler beim Entfernen der Servergruppe:", error)
      }

      try {
        ranks.forEach((rank) => {
          if (client && ((rank.permlevel == user.player_permlevel && !rank.isSecondary) || rank.rang == "Spieler")) {
            this.teamspeak.clientAddServerGroup(client.databaseId, rank.TeamSpeakID)
          }
          if (client && rank.isSecondary && user.secondaryTeam === rank.rang) {
            this.teamspeak.clientAddServerGroup(client.databaseId, rank.TeamSpeakID)
          }
        })
      } catch (error) {
        console.error("Fehler beim hinzufügen der Servergruppe:", error)
      }

      if (client && user.faction != null) {
        for (const faction of factions) {
          if (!faction.isActive) continue
          try {
            if (faction.name !== user.faction) {
              this.teamspeak.setClientChannelGroup("2172", faction.ChannelGroupID, client.databaseId)
            } else {
              this.teamspeak.clientAddServerGroup(client.databaseId, faction.TeamSpeakID)
              if (user.isLeader) {
                this.teamspeak.setClientChannelGroup("2174", faction.ChannelGroupID, client.databaseId)
              } else {
                this.teamspeak.setClientChannelGroup("2173", faction.ChannelGroupID, client.databaseId)
              }
            }
          } catch (error) {
            console.error("Fehler beim Entfernen der Clientgruppe:", error)
            continue
          }
        }
      }

      return true
    } catch (error) {
      console.error("Error reloading user:", error)
      return false
    }
  }

  public async unlink(uid: string): Promise<boolean> {
    try {
      const client: TeamSpeakClient | undefined = await this.teamspeak.getClientByUid(uid)
      if (!client) return false

      let result: any = await this.database.query("SELECT * FROM players WHERE teamSpeakUID = ?", [uid])
      const user: any = result[0]

      if (user === undefined) {
        client.message("Etwas ist schief gelaufen, bitte betrete den Server neu oder melde dich im Support.")
        return false
      }

      result = await this.database.query("SELECT * FROM factions")
      const factions: Faction[] = result

      client.message("Deine Synchronisation wurde entfernt.")

      if (user.player_name !== undefined) {
        client.edit({ clientDescription: "" })
      }

      try {
        client.servergroups.forEach((group) => {
          if (group !== "2235") {
            this.teamspeak.clientDelServerGroup(client.databaseId, group)
          }
        })
      } catch (error) {
        console.error("Fehler beim Entfernen der Servergruppe:", error)
      }

      if (client && user.faction != null) {
        for (const faction of factions) {
          if (!faction.isActive) continue
          this.teamspeak.setClientChannelGroup("2172", faction.ChannelGroupID, client.databaseId)
        }
      }

      await this.database.query("UPDATE players SET teamSpeakUID = NULL WHERE teamSpeakUID = ?", [uid])
      return true
    } catch (error) {
      console.error("Error unlinking user:", error)
      return false
    }
  }

  public async addVerification(name: string, uid: string, uuid: string): Promise<void> {
    this.verifies.push({ name, uid, uuid })
  }

  private async updateUserUidByUUID(uuid: string, uid: string): Promise<void> {
    try {
      await this.database.query("UPDATE players SET teamSpeakUID = ? WHERE uuid = ?", [uid, uuid])
      await this.reloadUser(uid)
    } catch (error) {
      console.error("Error updating user UID:", error)
    }
  }

  public getTeamSpeak(): TeamSpeak {
    return this.teamspeak
  }
}

