import { Router } from "express"
import { userService, database } from "../../index.js"
import type { UserModel } from "../../services/UserService.js"

const router: Router = Router()

router.get("/get/:name", async (req, res) => {
  try {
    const token = req.headers.authorization

    const user: UserModel | null = await userService.getUserDataByToken(token)

    if (!user) {
      return res.status(401).json({ error: "User not found" })
    }

    if (user.player_permission < 70) {
      return res.status(403).json({ error: "Not enough Permission" })
    }

    const player: any = await userService.findByNameAsync(req.params.name)
    if (!player) {
      return res.status(404).json({ error: "Player not found" })
    }

    // Get additional player data
    player.vehicles = await database.query("SELECT id, type FROM player_vehicles WHERE uuid = ?", [player.uuid])
    player.banking = await database.query("SELECT * FROM bank_logs WHERE uuid = ?", [player.uuid])
    player.moneylog = await database.query("SELECT * FROM money_logs WHERE uuid = ?", [player.uuid])
    player.notes = await database.query(
      "SELECT n.*, p.player_name AS executor FROM notes AS n LEFT JOIN players AS p ON n.uuid = p.uuid WHERE target = ?",
      [player.uuid],
    )

    const ban: any[] = await database.query("SELECT * FROM player_bans WHERE uuid = ?", [player.uuid])
    if (ban && ban.length > 0) {
      player.ban = ban[0]
    }

    return res.status(200).json(player)
  } catch (error) {
    console.error("Error getting player:", error)
    return res.status(500).json({ error: "Internal Server Error" })
  }
})

// Get all players
router.get("/", async (req, res) => {
  try {
    const token = req.headers.authorization

    const user: UserModel | null = await userService.getUserDataByToken(token)

    if (!user) {
      return res.status(401).json({ error: "User not found" })
    }

    if (user.player_permission < 70) {
      return res.status(403).json({ error: "Not enough Permission" })
    }

    const limit = req.query.limit ? Number.parseInt(req.query.limit as string) : 100
    const offset = req.query.offset ? Number.parseInt(req.query.offset as string) : 0

    const players = await userService.getPlayers(limit, offset)

    return res.status(200).json(players)
  } catch (error) {
    console.error("Error getting players:", error)
    return res.status(500).json({ error: "Internal Server Error" })
  }
})

// Additional routes for player management...

export const PlayerRouter: Router = router

