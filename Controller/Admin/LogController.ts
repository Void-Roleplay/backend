import { Router } from "express"
import type { UserModel } from "../../utils/entity/UserModel.js"
import { userService, logService } from "../../index.js"

const router: Router = Router()

router.get("/:type", async (req, res) => {
  const { page = 1, pageSize = 10 } = req.query
  const { type } = req.params

  var token = req.headers.authorization
  var user: UserModel = await userService.getUserDataByToken(token)

  if (user === null) {
    return res.status(500).json({ error: "User not found" })
  }

  if (user.player_permission < 70) {
    return res.status(500).json({ error: "Not enough Permission" })
  }

  const logs = await logService.getLogs(type, Number(page), Number(pageSize))
  return res.status(200).json(logs)
})

router.get("/:type/:id", async (req, res) => {
  const { page = 1, pageSize = 10 } = req.query
  const { type, id } = req.params

  var token = req.headers.authorization
  var user = await userService.getUserDataByToken(token)

  if (user === null) {
    return res.status(500).json({ error: "User not found" })
  }

  if (user.player_permission < 70) {
    return res.status(500).json({ error: "Not enough Permission" })
  }

  const logs = await logService.getLogById(type, Number.parseInt(id), Number(page), Number(pageSize))
  return res.status(200).json(logs)
})

export const AdminLogRouter: Router = router

