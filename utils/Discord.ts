import {
  ActivityType,
  Client,
  type CommandInteraction,
  EmbedBuilder,
  GatewayIntentBits,
  type GuildMember,
  type Message,
  REST,
  Routes,
} from "discord.js"
import { database, discordBot } from "../index.js"

interface ICommand {
  name: string
  description: string
  action?: (interaction: CommandInteraction) => void
  options?: any[]
}

export class Command {
  public name: string
  protected _description: string
  protected _action?: (interaction: CommandInteraction) => void
  protected _options?: any[]

  constructor(name: string, description: string, action?: (interaction: CommandInteraction) => void, options?: any[]) {
    this.name = name
    this._description = description
    this._action = action
    this._options = options
  }

  get description() {
    return this._description
  }

  get action() {
    return this._action
  }

  get options() {
    return this._options
  }
}

interface IVerification {
  uuid: string
  user: any
  timestamp: number
}

export class DiscordBot {
  private client: Client
  private verifications: IVerification[] = []
  private commands: Command[] = []
  private applicationId: string = process.env.DISCORD_APPLICATION_ID || "1242962210393821315"
  private defaultRoleId: string = process.env.DISCORD_DEFAULT_ROLE_ID || "1292182262825357383"
  private interval: NodeJS.Timeout

  constructor() {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages,
      ],
    })

    this.setupEventHandlers()
    this.interval = this.setupPresenceUpdateInterval()
    this.loginToDiscord()
  }

  private setupEventHandlers(): void {
    this.client.once("ready", this.handleReady)
    this.client.on("messageCreate", this.onMessage)
    this.client.on("interactionCreate", this.onInteraction)
    this.client.on("guildMemberAdd", this.onGuildJoin)

    this.client.on("error", (error) => {
      console.error("Discord client error:", error)
    })
  }

  private handleReady = async (): Promise<void> => {
    try {
      new FFAStats()
      new HelpCommand()
      new PlayersCommand()

      console.log("Discord bot is online!")
      await this.registerCommands()
      await this.updatePresence()
    } catch (error) {
      console.error("Error in ready handler:", error)
    }
  }

  private setupPresenceUpdateInterval(): NodeJS.Timeout {
    return setInterval(() => {
      const time = new Date()
      if (time.getMinutes() % 5 === 0 && time.getSeconds() === 1) {
        this.updatePresence().catch((error) => {
          console.error("Error updating presence:", error)
        })
      }
    }, 1000)
  }

  private loginToDiscord(): void {
    const token = process.env.DISCORD_TOKEN
    if (!token) {
      console.error("DISCORD_TOKEN environment variable is not set")
      return
    }

    this.client.login(token).catch((error) => {
      console.error("Failed to login to Discord:", error)
    })
  }

  public updatePresence = async (): Promise<void> => {
    try {
      const countRes: any = await database.query("SELECT COUNT(*) AS count FROM players")
      const count = countRes[0].count

      this.client.user?.setPresence({
        activities: [{ name: `mit ${count} Spielern`, type: ActivityType.Playing }],
        status: "online",
      })
    } catch (error) {
      console.error("Error updating presence:", error)
    }
  }

  private onMessage = (message: Message): void => {
    if (message.author.bot) return

    if (message.content === "!ping") {
      message.reply("Pong!").catch((error) => {
        console.error("Error replying to message:", error)
      })
    }
  }

  private onInteraction = (interaction: any): void => {
    if (!interaction.isChatInputCommand()) return

    const { commandName } = interaction
    this.onCommand(commandName, interaction)
  }

  private onGuildJoin = async (member: GuildMember): Promise<void> => {
    try {
      const role = member.guild.roles.cache.get(this.defaultRoleId)

      if (role) {
        await member.roles.add(role)
        console.log(`Role ${role.name} assigned to ${member.user.username}`)

        if (!(await this.isLinked(member.id))) {
          await member
            .send(
              `Hey <@${member.id}>! Du bist noch nicht verifiziert - nutze "/discord link ${member.id}" auf dem Minecraft-Server (voidroleplay.de) um dich zu verlinken.`,
            )
            .catch((error) => {
              console.error(`Could not send DM to ${member.user.username}:`, error)
            })
        }
      } else {
        console.error(`Role with ID ${this.defaultRoleId} not found`)
      }
    } catch (error) {
      console.error(`Error assigning role to ${member.user.username}:`, error)
    }
  }

  private isLinked = async (id: string): Promise<boolean> => {
    try {
      const result: any = await database.query("SELECT COUNT(*) AS count FROM players WHERE discordId = ?", [id])
      return result[0]?.count > 0
    } catch (error) {
      console.error("Error checking if user is linked:", error)
      return false
    }
  }

  private async registerCommands(): Promise<void> {
    try {
      const commands = this.commands.map((cmd) => ({
        name: cmd.name,
        description: cmd.description,
        options: cmd.options || [],
      }))

      const token = process.env.DISCORD_TOKEN
      if (!token) {
        console.error("DISCORD_TOKEN environment variable is not set")
        return
      }

      const rest = new REST({ version: "10" }).setToken(token)

      console.log("Started refreshing application (/) commands")
      await rest.put(Routes.applicationCommands(this.applicationId), { body: commands })
      console.log("Successfully reloaded application (/) commands")
    } catch (error) {
      console.error("Error registering commands:", error)
    }
  }

  public sendPrivateMessage = async (
    clientId: string,
    title: string,
    message: string,
    color: any = 0x7289da,
  ): Promise<Message | null> => {
    try {
      const user = await this.getUserById(clientId)
      if (!user) {
        console.log("User not found")
        return null
      }

      const embed = new EmbedBuilder().setTitle(title).setDescription(message).setColor(color).setFooter({
        text: "Void Roleplay - Reallife & Roleplay",
        iconURL: "https://voidroleplay.de/static/media/logo.a1042905537a8805e549.png",
      })

      console.log(`Message sent to ${user.username}`)
      return await user.send({ embeds: [embed] })
    } catch (error) {
      console.error("Error sending private message:", error)
      return null
    }
  }

  public verifyUser = async (username: string, uuid: string, player_name: string): Promise<boolean> => {
    try {
      const user = this.client.users.cache.find((x) => x.tag === username)
      if (!user) return false

      const now = Date.now()
      this.verifications = this.verifications.filter((v) => now - v.timestamp < 10 * 60 * 1000)

      this.verifications.push({
        uuid,
        user,
        timestamp: now,
      })

      const message = await this.sendPrivateMessage(
        user.id,
        "Verifikation",
        `${player_name} möchte sich mit deinem Discord Account verbinden. Bitte bestätige diese Anfrage oder lehne Sie ab.`,
      )

      if (!message) return false

      await message.react("✅")
      await message.react("❌")

      const filter = (reaction: any, reactingUser: any) => {
        return ["✅", "❌"].includes(reaction.emoji.name) && reactingUser.id === user.id
      }

      const collector = message.createReactionCollector({ filter, time: 60000 })

      collector.on("collect", async (reaction) => {
        if (reaction.emoji.name === "✅") {
          await this.handleApproval(uuid, user, player_name)
        } else if (reaction.emoji.name === "❌") {
          await this.handleRejection(uuid, user, player_name)
        }
        collector.stop()
      })

      collector.on("end", (collected, reason) => {
        if (reason === "time") {
          this.handleTimeout(uuid, user)
        }
      })

      return true
    } catch (error) {
      console.error("Error verifying user:", error)
      return false
    }
  }

  private async handleApproval(uuid: string, user: any, player_name: string): Promise<void> {
    try {
      console.log(`User ${user.tag} confirmed connection for ${player_name}`)

      await database.query("UPDATE players SET discordId = ? WHERE uuid = ?", [user.id, uuid])

      await this.sendPrivateMessage(
        user.id,
        "Verifikation erfolgreich",
        `Dein Discord-Account wurde erfolgreich mit ${player_name} verknüpft.`,
      )
    } catch (error) {
      console.error("Error handling approval:", error)
    }
  }

  private async handleRejection(uuid: string, user: any, player_name: string): Promise<void> {
    try {
      console.log(`User ${user.tag} rejected connection for ${player_name}`)

      await this.sendPrivateMessage(
        user.id,
        "Verifikation abgelehnt",
        `Die Verknüpfung mit ${player_name} wurde abgelehnt.`,
      )
    } catch (error) {
      console.error("Error handling rejection:", error)
    }
  }

  private async handleTimeout(uuid: string, user: any): Promise<void> {
    try {
      console.log(`User ${user.tag} did not respond to the request`)

      await this.sendPrivateMessage(
        user.id,
        "Verifikation abgelaufen",
        "Die Anfrage zur Verknüpfung ist abgelaufen. Bitte versuche es erneut.",
      )
    } catch (error) {
      console.error("Error handling timeout:", error)
    }
  }

  public getUserById = async (clientId: string) => {
    try {
      return await this.client.users.fetch(clientId)
    } catch (error) {
      console.error(`Error fetching user with ID ${clientId}:`, error)
      return null
    }
  }

  public setClientName = async (clientId: string, name: string): Promise<void> => {
    try {
      const user = await this.getUserById(clientId)
      if (user) {
        user.username = name
      }
    } catch (error) {
      console.error(`Error setting name for user ${clientId}:`, error)
    }
  }

  private onCommand = (commandName: string, interaction: CommandInteraction): void => {
    try {
      const command = this.commands.find((cmd) => cmd.name === commandName)
      if (command && command.action) {
        command.action(interaction)
      } else {
        console.log(`Command not found: ${commandName}`)
        interaction
          .reply({ content: "Dieser Befehl wurde nicht gefunden.", ephemeral: true })
          .catch((error) => console.error("Error replying to interaction:", error))
      }
    } catch (error) {
      console.error(`Error executing command ${commandName}:`, error)
      interaction
        .reply({ content: "Bei der Ausführung des Befehls ist ein Fehler aufgetreten.", ephemeral: true })
        .catch((error) => console.error("Error replying to interaction:", error))
    }
  }

  public addCommand(command: Command): void {
    this.commands.push(command)
  }

  public shutdown(): void {
    clearInterval(this.interval)
    this.client.destroy()
    console.log("Discord bot shut down")
  }
}

class HelpCommand extends Command {
  constructor() {
    super("help", "Erhalte eine Übersicht zu wichtigen Daten")
    this._action = (interaction: any) => {
      try {
        const embed = new EmbedBuilder()
          .setTitle("Hilfe")
          .setDescription("Hier findest du eine Übersicht der verfügbaren Befehle:")
          .addFields(
            { name: "/help", value: "Zeigt diese Hilfe an", inline: true },
            { name: "/players", value: "Zeigt die Spielerstatistik an", inline: true },
            { name: "/ffastats", value: "Zeigt FFA-Statistiken eines Spielers an", inline: true },
          )
          .setColor("Aqua")
          .setFooter({
            text: "Void Roleplay - Reallife & Roleplay",
            iconURL: "https://voidroleplay.de/static/media/logo.a1042905537a8805e549.png",
          })

        interaction.reply({ embeds: [embed] })
      } catch (error) {
        console.error("Error executing help command:", error)
        interaction.reply({ content: "Bei der Ausführung des Befehls ist ein Fehler aufgetreten.", ephemeral: true })
      }
    }

    discordBot.addCommand(this)
  }
}

class PlayersCommand extends Command {
  constructor() {
    super("players", "Erhalte die Anzahl aller Spieler online.")

    this._action = async (interaction: any) => {
      try {
        await interaction.deferReply()

        const countRes: any = await database.query("SELECT COUNT(*) AS count FROM players")
        const count = countRes[0].count

        const onlineCount = 0

        const embed = new EmbedBuilder()
          .setTitle("Spielerstatistik")
          .setDescription(`Es sind ${onlineCount} Spieler online & ${count} registriert`)
          .setColor("Aqua")
          .setFooter({
            text: "Void Roleplay - Reallife & Roleplay",
            iconURL: "https://voidroleplay.de/static/media/logo.a1042905537a8805e549.png",
          })
          .setTimestamp()

        await interaction.editReply({ embeds: [embed] })
      } catch (error) {
        console.error("Error executing players command:", error)
        await interaction.editReply({ content: "Bei der Ausführung des Befehls ist ein Fehler aufgetreten." })
      }
    }

    discordBot.addCommand(this)
  }
}

class FFAStats extends Command {
  constructor() {
    super(
      "ffastats",
      "Erhalte die FFA-Stats eines Spielers",
      async (interaction: any) => {
        try {
          await interaction.deferReply()

          const playerName = interaction.options.getString("player")
          if (!playerName) {
            await interaction.editReply("Kein Spielername angegeben.")
            return
          }

          const stats: any = await database.query(
            `SELECT
              COALESCE(SUM(CASE WHEN s.statsType = 'ALL_TIME' THEN s.kills ELSE 0 END), 0) AS all_time_kills,
              COALESCE(SUM(CASE WHEN s.statsType = 'ALL_TIME' THEN s.deaths ELSE 0 END), 0) AS all_time_deaths,
              COALESCE(SUM(CASE WHEN s.statsType = 'WEEKLY' THEN s.kills ELSE 0 END), 0) AS weekly_kills,
              COALESCE(SUM(CASE WHEN s.statsType = 'WEEKLY' THEN s.deaths ELSE 0 END), 0) AS weekly_deaths,
              COALESCE(SUM(CASE WHEN s.statsType = 'MONTHLY' THEN s.kills ELSE 0 END), 0) AS monthly_kills,
              COALESCE(SUM(CASE WHEN s.statsType = 'MONTHLY' THEN s.deaths ELSE 0 END), 0) AS monthly_deaths
            FROM
              player_ffa_stats s
            INNER JOIN
              players p ON s.uuid = p.uuid
            WHERE
              p.player_name = ?
            GROUP BY
              p.uuid;
          `,
            [playerName],
          )

          let embed
          if (stats.length === 0) {
            embed = new EmbedBuilder()
              .setTitle(`${playerName}'s FFA-Statistiken`)
              .setDescription("Spieler hat keine Statistiken!")
              .setColor("Red")
              .setFooter({
                text: "Void Roleplay - Reallife & Roleplay",
                iconURL: "https://voidroleplay.de/static/media/logo.a1042905537a8805e549.png",
              })
              .setTimestamp()
          } else {
            const playerStats = stats[0]

            const allTimeKD =
              playerStats.all_time_deaths > 0
                ? (playerStats.all_time_kills / playerStats.all_time_deaths).toFixed(2)
                : playerStats.all_time_kills > 0
                  ? "∞"
                  : "0.00"

            const weeklyKD =
              playerStats.weekly_deaths > 0
                ? (playerStats.weekly_kills / playerStats.weekly_deaths).toFixed(2)
                : playerStats.weekly_kills > 0
                  ? "∞"
                  : "0.00"

            const monthlyKD =
              playerStats.monthly_deaths > 0
                ? (playerStats.monthly_kills / playerStats.monthly_deaths).toFixed(2)
                : playerStats.monthly_kills > 0
                  ? "∞"
                  : "0.00"

            embed = new EmbedBuilder()
              .setTitle(`${playerName}'s FFA-Statistiken`)
              .addFields(
                { name: "All Time Kills", value: `${playerStats.all_time_kills}`, inline: true },
                { name: "All Time Deaths", value: `${playerStats.all_time_deaths}`, inline: true },
                { name: "All Time K/D", value: `${allTimeKD}`, inline: true },
                { name: "Weekly Kills", value: `${playerStats.weekly_kills}`, inline: true },
                { name: "Weekly Deaths", value: `${playerStats.weekly_deaths}`, inline: true },
                { name: "Weekly K/D", value: `${weeklyKD}`, inline: true },
                { name: "Monthly Kills", value: `${playerStats.monthly_kills}`, inline: true },
                { name: "Monthly Deaths", value: `${playerStats.monthly_deaths}`, inline: true },
                { name: "Monthly K/D", value: `${monthlyKD}`, inline: true },
              )
              .setColor("Orange")
              .setFooter({
                text: "Void Roleplay - Reallife & Roleplay",
                iconURL: "https://voidroleplay.de/static/media/logo.a1042905537a8805e549.png",
              })
              .setTimestamp()
          }

          await interaction.editReply({ embeds: [embed] })
        } catch (error) {
          console.error("Error executing ffastats command:", error)
          await interaction.editReply({ content: "Bei der Ausführung des Befehls ist ein Fehler aufgetreten." })
        }
      },
      [
        {
          name: "player",
          type: 3,
          description: "Der Name des Spielers",
          required: true,
        },
      ],
    )

    discordBot.addCommand(this)
  }
}

