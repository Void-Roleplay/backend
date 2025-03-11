import { Router } from "express"
import type { UserModel } from "../../utils/entity/UserModel.js"
import { userService, factionService } from "../../index.js"

const router: Router = Router()

router.get("/get", async (req, res) => {
  var token = req.headers.authorization

  var user: UserModel = await userService.getUserDataByToken(token)

  if (user === null) {
    return res.status(500).json({ error: "User not found" })
  }

  if (user.player_permission < 70) {
    return res.status(500).json({ error: "Not enough Permission" })
  }

  return res.status(200).json(await factionService.getAllFactions())
})

router.get("/get/:name", async (req, res) => {
  var token = req.headers.authorization

  var user: UserModel = await userService.getUserDataByToken(token)

  if (user === null) {
    return res.status(500).json({ error: "User not found" })
  }

  if (user.player_permission < 70) {
    return res.status(500).json({ error: "Not enough Permission" })
  }

  return res.status(200).json(await factionService.getFactionByName(req.params.name))
})

router.post("/:name/update", async (req, res) => {
  var token = req.headers.authorization

  var user: UserModel = await userService.getUserDataByToken(token)

  if (user === null) {
    return res.status(500).json({ error: "User not found" })
  }

  if (user.player_permission < 90) {
    return res.status(500).json({ error: "Not enough Permission" })
  }

  await factionService.updateFaction(req.params.name, req.body)

  return res.status(200).send()
})

router.post("/add", async (req, res) => {
  var token = req.headers.authorization

  var user: UserModel = await userService.getUserDataByToken(token)

  if (user === null) {
    return res.status(500).json({ error: "User not found" })
  }

  if (user.player_permission < 90) {
    return res.status(500).json({ error: "Not enough Permission" })
  }

  await factionService.addFaction(req.body)
  return res.status(200).send()
})

export const AdminFactionRouter: Router = router

