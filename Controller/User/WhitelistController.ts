import { Router } from "express"
import { userService, database } from "../../index.js"
import type { UserModel } from "../../utils/entity/UserModel.js"

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

  var result = await database.query(
    "SELECT w.*, p.player_name FROM whitelist AS w LEFT JOIN players AS p ON w.uuid = p.uuid",
  )
  return res.status(200).json(result)
})

router.get("/get/:id", async (req, res) => {
  var token = req.headers.authorization

  var user: UserModel = await userService.getUserDataByToken(token)

  if (user === null) {
    return res.status(500).json({ error: "User not found" })
  }

  if (user.player_permission < 70) {
    return res.status(500).json({ error: "Not enough Permission" })
  }

  var result = await database.query(
    "SELECT w.*, p.player_name FROM whitelist AS w LEFT JOIN players AS p ON w.uuid = p.uuid WHERE w.id = ?",
    [req.params.id],
  )
  return res.status(200).json(result[0])
})

router.post("/accept", async (req, res) => {
  var token = req.headers.authorization

  var user: UserModel = await userService.getUserDataByToken(token)

  if (user === null) {
    return res.status(500).json({ error: "User not found" })
  }

  if (user.player_permission < 70) {
    return res.status(500).json({ error: "Not enough Permission" })
  }

  await userService.acceptWhitelistApplication(req.body.id, user.uuid)
  return res.status(200).send()
})

router.post("/deny", async (req, res) => {
  var token = req.headers.authorization

  var user: UserModel = await userService.getUserDataByToken(token)

  if (user === null) {
    return res.status(500).json({ error: "User not found" })
  }

  if (user.player_permission < 70) {
    return res.status(500).json({ error: "Not enough Permission" })
  }

  await userService.denyWhitelistApplication(req.body.id, user.uuid, req.body.reason)
  return res.status(200).send()
})

export const WhitelistRouter: Router = router

