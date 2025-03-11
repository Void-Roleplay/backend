import { Router } from "express"
import { gameplayService } from "../../index.js"

const router: Router = Router()

router.get("/get", async (req, res) => {
  try {
    return res.send(await gameplayService.getWeapons())
  } catch (error) {
    console.error(error)
    return res.status(500).send("Internal Server Error")
  }
})

router.get("/get/:type", async (req, res) => {
  try {
    const weaponType = req.params.type
    return res.send(await gameplayService.getWeaponByType(weaponType))
  } catch (error) {
    console.error(error)
    return res.status(500).send("Internal Server Error")
  }
})

export const WeaponRouter: Router = router

