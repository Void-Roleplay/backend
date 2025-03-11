import { Router } from "express"
import checkAuth from "../../middlewares/checkAuth.js"
import { database, userService } from "../../index.js"
import { AuthError } from "../../utils/error.js"

const router: Router = Router()

router.get("/requestChardata", checkAuth(), async (req, res, next) => {
  var token = req.headers.authorization
  var user = await userService.getUserDataByToken(token)
  if (!user) {
    return next(new AuthError("User not found"))
  }
  var response: any = await database.query("SELECT teamspeak FROM accounts WHERE id = ?", [user.accountId])

  const returnvalue = {
    forumId: 0,
    teamSpeakUid: response.teamspeak,
    charId: user.id,
    charName: `${user.firstname}_${user.lastname}`,
    money: user.money,
    bank: user.bank,
    visum: user.level,
  }

  return res.status(200).json(returnvalue)
})

export const ControlPanelRouter = router

