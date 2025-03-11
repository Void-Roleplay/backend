import { Router } from "express"
import { teamSpeakService } from "../../index.js"

const router: Router = Router()

router.post("/verify", async (req, res) => {
  try {
    const uid = req.body.uid
    const apiToken = req.body.token

    if (!uid || !apiToken) {
      return res.status(400).send("Missing required parameters")
    }

    if (await teamSpeakService.verifyUser(uid, apiToken)) {
      return res.status(200).send()
    }

    return res.status(404).send()
  } catch (error) {
    console.error("Error in verify endpoint:", error)
    return res.status(500).send("Internal Server Error")
  }
})

router.post("/reloaduser", async (req, res) => {
  try {
    const uid = req.body.uid

    if (!uid) {
      return res.status(400).send("Missing required parameter: uid")
    }

    if (await teamSpeakService.reloadUser(uid)) {
      return res.status(200).send()
    }

    return res.status(404).send()
  } catch (error) {
    console.error("Error in reloaduser endpoint:", error)
    return res.status(500).send("Internal Server Error")
  }
})

router.post("/unlink", async (req, res) => {
  try {
    const uid = req.body.uid

    if (!uid) {
      return res.status(400).send("Missing required parameter: uid")
    }

    if (await teamSpeakService.unlink(uid)) {
      return res.status(200).send()
    }

    return res.status(404).send()
  } catch (error) {
    console.error("Error in unlink endpoint:", error)
    return res.status(500).send("Internal Server Error")
  }
})

export const TeamSpeakRouter: Router = router

