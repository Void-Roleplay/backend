import { Router } from "express"
import { economyService } from "../../index.js"

const router: Router = Router()

router.get("/get", async (req, res) => {
  try {
    return res.send(await economyService.getAllVehicles())
  } catch (error) {
    console.error(error)
    return res.status(500).send("Internal Server Error")
  }
})

router.get("/get/:id", async (req, res) => {
  try {
    const vehicleId = Number.parseInt(req.params.id)
    return res.send(await economyService.getVehicleById(vehicleId))
  } catch (error) {
    console.error(error)
    return res.status(500).send("Internal Server Error")
  }
})

export const VehicleRouter: Router = router

