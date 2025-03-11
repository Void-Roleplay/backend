import { Router } from "express"
import { factionService } from "../../index.js"

const router: Router = Router()

router.get("/", async (req, res) => {
  try {
    return res.send(await factionService.getAllFactions())
  } catch (error) {
    console.error(error)
    return res.status(500).send("Internal Server Error")
  }
})

router.get("/:faction", async (req, res) => {
  try {
    var factionName = req.params.faction
    return res.send(await factionService.getFactionByName(factionName))
  } catch (error) {
    console.error(error)
    return res.status(500).send("Internal Server Error")
  }
})

export const FactionRouter: Router = router

