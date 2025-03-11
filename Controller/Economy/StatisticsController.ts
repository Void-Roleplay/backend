import { Router } from "express"
import { economyService } from "../../index.js"

const router: Router = Router()

router.get("/get", async (req, res) => {
  try {
    return res.send(await economyService.getStatistics())
  } catch (error) {
    console.error(error)
    return res.status(500).send("Internal Server Error")
  }
})

export const StatisticsRouter: Router = router

