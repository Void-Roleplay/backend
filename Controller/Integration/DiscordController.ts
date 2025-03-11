import { Router } from "express"
import { discordService } from "../../index.js"

const router: Router = Router()

router.post("/verify", async (req, res) => {
  const username = req.body.username
  const name = req.body.name
  const uuid = req.body.uuid
  await discordService.verifyUser(username, uuid, name)
  return res.status(200).send()
})

router.post("/reloaduser", async (req, res) => {
  await discordService.setClientName(req.body.uid, req.body.name)
  return res.status(200).send()
})

router.post("/unlink", async (req, res) => {
  const user = await discordService.getUserById(req.body.uid)
  if (user) {
    return res.status(200).send()
  }
  return res.status(404).send()
})

export const DiscordController: Router = router

