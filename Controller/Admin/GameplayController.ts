import { Router } from "express"
import { userService, gameplayService } from "../../index.js"
import type { UserModel } from "../../utils/entity/UserModel.js"

const router: Router = Router()

router.get("/weapons/get", async (req, res) => {
  var token = req.headers.authorization

  var user: UserModel = await userService.getUserDataByToken(token)

  if (user === null) {
    return res.status(500).json({ error: "User not found" })
  }

  if (user.player_permission < 90) {
    return res.status(500).json({ error: "Not enough Permission" })
  }

  return res.status(200).json(await gameplayService.getWeapons())
})

router.get("/weapons/get/:type", async (req, res) => {
  var token = req.headers.authorization

  var user: UserModel = await userService.getUserDataByToken(token)

  if (user === null) {
    return res.status(500).json({ error: "User not found" })
  }

  if (user.player_permission < 90) {
    return res.status(500).json({ error: "Not enough Permission" })
  }

  var result = await gameplayService.getWeaponByType(req.params.type)
  return res.status(200).json(result)
})

router.post("/weapon/:type/update", async (req, res) => {
  var token = req.headers.authorization

  var user: UserModel = await userService.getUserDataByToken(token)

  if (user === null) {
    return res.status(500).json({ error: "User not found" })
  }

  if (user.player_permission < 90) {
    return res.status(500).json({ error: "Not enough Permission" })
  }

  await gameplayService.updateWeapon(req.params.type, req.body)
  return res.status(200).send()
})

router.post("/weapon/add", async (req, res) => {
  var token = req.headers.authorization

  var user: UserModel = await userService.getUserDataByToken(token)

  if (user === null) {
    return res.status(500).json({ error: "User not found" })
  }

  if (user.player_permission < 90) {
    return res.status(500).json({ error: "Not enough Permission" })
  }

  await gameplayService.addWeapon(req.body)
  return res.status(200).send()
})

router.get("/shop/get", async (req, res) => {
  var token = req.headers.authorization

  var user: UserModel = await userService.getUserDataByToken(token)

  if (user === null) {
    return res.status(500).json({ error: "User not found" })
  }

  if (user.player_permission < 90) {
    return res.status(500).json({ error: "Not enough Permission" })
  }

  return res.status(200).json(await gameplayService.getShops())
})

router.get("/shop/get/:name", async (req, res) => {
  var token = req.headers.authorization

  var user: UserModel = await userService.getUserDataByToken(token)

  if (user === null) {
    return res.status(500).json({ error: "User not found" })
  }

  if (user.player_permission < 90) {
    return res.status(500).json({ error: "Not enough Permission" })
  }

  var result = await gameplayService.getShopByName(req.params.name)
  return res.status(200).json(result)
})

router.get("/item/get/:shop/:id", async (req, res) => {
  var token = req.headers.authorization

  var user: UserModel = await userService.getUserDataByToken(token)

  if (user === null) {
    return res.status(500).json({ error: "User not found" })
  }

  if (user.player_permission < 90) {
    return res.status(500).json({ error: "Not enough Permission" })
  }

  var result = await gameplayService.getShopItemById(req.params.shop, Number.parseInt(req.params.id))
  return res.status(200).json(result)
})

router.get("/contracts", async (req, res) => {
  var token = req.headers.authorization

  var user: UserModel = await userService.getUserDataByToken(token)

  if (user === null) {
    return res.status(500).json({ error: "User not found" })
  }

  if (user.player_permission < 70) {
    return res.status(500).json({ error: "Not enough Permission" })
  }

  var result = await gameplayService.getContracts()
  return res.status(200).json(result)
})

export const AdminGamePlayRouter = router

