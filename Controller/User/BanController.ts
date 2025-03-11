import { Router } from "express"
import { userService } from "../../index.js"

const router: Router = Router()

router.get("/get", async (req, res) => {
  const { page = 1, pageSize = 10 } = req.query
  try {
    return res.send(await userService.getBannedPlayers(Number(page), Number(pageSize)))
  } catch (error) {
    console.error(error)
    return res.status(500).send("Internal Server Error")
  }
})

router.get("/get/:uuid", async (req, res) => {
  try {
    const playerUuid = req.params.uuid
    return res.send(await userService.getPlayerBan(playerUuid))
  } catch (error) {
    console.error(error)
    return res.status(500).send("Internal Server Error")
  }
})

export const BanRouter: Router = router

