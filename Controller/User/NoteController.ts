import { Router } from "express"
import { userService } from "../../index.js"
import type { UserModel } from "../../utils/entity/UserModel.js"

const router: Router = Router()

router.get("/get/:uuid", async (req, res) => {
  var token = req.headers.authorization

  var user: UserModel = await userService.getUserDataByToken(token)

  if (user === null) {
    return res.status(500).json({ error: "User not found" })
  }

  if (user.player_permission < 70) {
    return res.status(500).json({ error: "Not enough Permission" })
  }

  var notes = await userService.getPlayerNotes(req.params.uuid)
  return res.status(200).json(notes)
})

router.post("/add", async (req, res) => {
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

export const NoteRouter: Router = router

