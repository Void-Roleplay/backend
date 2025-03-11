import { Router } from "express"
import { userService, adminService } from "../../index.js"
import type { UserModel } from "../../utils/entity/UserModel.js"

const router: Router = Router()

router.get("/list", async (req, res) => {
  const { page = 1, pageSize = 10 } = req.query
  var token = req.headers.authorization

  var user: UserModel = await userService.getUserDataByToken(token)

  if (user === null) {
    return res.status(500).json({ error: "User not found" })
  }

  if (user.player_permission < 70) {
    return res.status(500).json({ error: "Not enough Permission" })
  }

  const response = await adminService.getBanlist(Number(page), Number(pageSize))
  return res.status(200).json(response)
})

export const AdminBanRouter: Router = router

