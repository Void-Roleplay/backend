import { Router } from "express"
import { gameplayService } from "../../index.js"

const router: Router = Router()

router.get("/get", async (req, res) => {
  try {
    return res.send(await gameplayService.getContracts())
  } catch (error) {
    console.error(error)
    return res.status(500).send("Internal Server Error")
  }
})

export const ContractRouter: Router = router

