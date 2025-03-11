import { Router } from "express"
import { userService, economyService } from "../../index.js"
import type { UserModel } from "../../utils/entity/UserModel.js"

const router: Router = Router()

router.get("/transaction/get/:id", async (req, res) => {
  var token = req.headers.authorization

  var user: UserModel = await userService.getUserDataByToken(token)

  if (user === null) {
    return res.status(500).json({ error: "User not found" })
  }

  if (user.player_permission < 70) {
    return res.status(500).json({ error: "Not enough Permission" })
  }

  var transaction = await economyService.getTransactionById(Number.parseInt(req.params.id))
  return res.status(200).json(transaction)
})

router.get("/vehicle/get/:id", async (req, res) => {
  var token = req.headers.authorization

  var user: UserModel = await userService.getUserDataByToken(token)

  if (user === null) {
    return res.status(500).json({ error: "User not found" })
  }

  if (user.player_permission < 70) {
    return res.status(500).json({ error: "Not enough Permission" })
  }

  var vehicle = await economyService.getVehicleById(Number.parseInt(req.params.id))
  return res.status(200).json(vehicle)
})

router.get("/statistics/get", async (req, res) => {
  var token = req.headers.authorization

  var user: UserModel = await userService.getUserDataByToken(token)

  if (user === null) {
    return res.status(500).json({ error: "User not found" })
  }

  if (user.player_permission < 70) {
    return res.status(500).json({ error: "Not enough Permission" })
  }

  var statistics = await economyService.getStatistics()
  return res.status(200).json(statistics)
})

router.get("/realestate/get", async (req, res) => {
  var token = req.headers.authorization

  var user: UserModel = await userService.getUserDataByToken(token)

  if (user === null) {
    return res.status(500).json({ error: "User not found" })
  }

  if (user.player_permission < 70) {
    return res.status(500).json({ error: "Not enough Permission" })
  }

  var result = await economyService.getRealEstate()
  return res.status(200).json(result)
})

router.get("/realestate/get/:id", async (req, res) => {
  var token = req.headers.authorization

  var user: UserModel = await userService.getUserDataByToken(token)

  if (user === null) {
    return res.status(500).json({ error: "User not found" })
  }

  if (user.player_permission < 70) {
    return res.status(500).json({ error: "Not enough Permission" })
  }

  var result = await economyService.getRealEstateById(Number.parseInt(req.params.id))
  return res.status(200).json(result)
})

export const AdminEconomyRouter: Router = router

