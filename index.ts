import express, { type Express, type Request, type Response, type NextFunction } from "express"
import cors from "cors"
import { AccountRoutes } from "./Controller/Auth/AccountController.js"
import { HomeRouter } from "./Controller/General/HomeController.js"
import { FactionRouter } from "./Controller/Gameplay/FactionController.js"
import { AdminRouter } from "./Controller/Admin/AdminController.js"
import { PlayerRouter } from "./Controller/User/PlayerController.js"
import { ControlPanelRouter } from "./Controller/General/ControlpanelController.js"
import { DiscordController } from "./Controller/Integration/DiscordController.js"
import { TeamSpeakRouter } from "./Controller/Integration/TeamSpeakController.js"
import { AuthError, ValidationError } from "./utils/error.js"
import { UserService } from "./services/UserService.js"
import { AuthService } from "./services/AuthService.js"
import { FactionService } from "./services/FactionService.js"
import { AdminService } from "./services/AdminService.js"
import { LogService } from "./services/LogService.js"
import { EconomyService } from "./services/EconomyService.js"
import { GameplayService } from "./services/GameplayService.js"
import { DiscordService } from "./services/DiscordService.js"
import { TeamSpeakService } from "./services/TeamSpeakService.js"
import { EmailService } from "./services/EmailService.js"
import Database from "./utils/Database.js"

export const database = new Database()

export const userService = new UserService(database)
export const authService = new AuthService(database, userService)
export const factionService = new FactionService(database)
export const adminService = new AdminService(database)
export const logService = new LogService(database)
export const economyService = new EconomyService(database)
export const gameplayService = new GameplayService(database)
export const discordService = new DiscordService(database)
export const teamSpeakService = new TeamSpeakService(database)
export const emailService = new EmailService()

const app: Express = express()
const port = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

app.use("/account", AccountRoutes)
app.use("/", HomeRouter)
app.use("/faction", FactionRouter)
app.use("/admin", AdminRouter)
app.use("/player", PlayerRouter)
app.use("/controlpanel", ControlPanelRouter)
app.use("/discord", DiscordController)
app.use("/teamspeak", TeamSpeakRouter)

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof AuthError) {
    return res.status(401).json({ error: err.message })
  }
  if (err instanceof ValidationError) {
    return res.status(400).json({ error: err.message })
  }
  console.error(err)
  return res.status(500).json({ error: "Internal Server Error" })
})

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})

