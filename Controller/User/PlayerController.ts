import { Router } from "express"
import { userService } from "../../index.js"
import type { UserModel } from "../../utils/entity/UserModel.js"

const router: Router = Router()

router.get("/get/:name", async (req, res) => {
  var token = req.headers.authorization

  var user: UserModel = await userService.getUserDataByToken(token)

  if (user === null) {
    return res.status(500).json({ error: "User not found" })
  }

  var player = await userService.findByNameAsync(req.params.name)
  if (player === null) return res.status(404).send()

  return res.status(200).json({
    player_name: player.player_name,
    uuid: player.uuid,
    faction: player.faction,
    isLeader: player.isLeader,
    level: player.level,
    visum: player.visum,
    secondaryTeam: player.secondaryTeam,
    player_permlevel: player.player_permlevel,
  })
})

router.get("/search/:name", async (req, res) => {
  var token = req.headers.authorization

  var user: UserModel = await userService.getUserDataByToken(token)

  if (user === null) {
    return res.status(500).json({ error: "User not found" })
  }

  var players = await userService.searchPlayersByName(req.params.name)
  return res.status(200).json(players)
})

router.post("/note/add", async (req, res) => {
  var token = req.headers.authorization

  var user: UserModel = await userService.getUserDataByToken(token)

  if (user === null) {
    return res.status(500).json({ error: "User not found" })
  }

  if (user.player_permission < 70) {
    return res.status(500).json({ error: "Not enough Permission" })
  }

  await userService.addNoteToPlayer(req.body.target, user.uuid, req.body.note)
  return res.status(200).send()
})

router.post("/ban/add", async (req, res) => {
  var token = req.headers.authorization

  var user: UserModel = await userService.getUserDataByToken(token)

  if (user === null) {
    return res.status(500).json({ error: "User not found" })
  }

  if (user.player_permission < 70) {
    return res.status(500).json({ error: "Not enough Permission" })
  }

  await userService.banPlayer(req.body.target, user.uuid, req.body.reason, req.body.duration)
  return res.status(200).send()
})

router.post("/ban/remove", async (req, res) => {
  var token = req.headers.authorization

  var user: UserModel = await userService.getUserDataByToken(token)

  if (user === null) {
    return res.status(500).json({ error: "User not found" })
  }

  if (user.player_permission < 70) {
    return res.status(500).json({ error: "Not enough Permission" })
  }

  await userService.unbanPlayer(req.body.target)
  return res.status(200).send()
})

export const PlayerRouter: Router = router

