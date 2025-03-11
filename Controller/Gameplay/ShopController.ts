import { Router } from "express"
import { gameplayService } from "../../index.js"

const router: Router = Router()

router.get("/get", async (req, res) => {
  try {
    return res.send(await gameplayService.getShops())
  } catch (error) {
    console.error(error)
    return res.status(500).send("Internal Server Error")
  }
})

router.get("/get/:name", async (req, res) => {
  try {
    const shopName = req.params.name
    return res.send(await gameplayService.getShopByName(shopName))
  } catch (error) {
    console.error(error)
    return res.status(500).send("Internal Server Error")
  }
})

router.get("/item/get/:shop/:id", async (req, res) => {
  try {
    const shopName = req.params.shop
    const itemId = Number.parseInt(req.params.id)
    return res.send(await gameplayService.getShopItemById(shopName, itemId))
  } catch (error) {
    console.error(error)
    return res.status(500).send("Internal Server Error")
  }
})

export const ShopRouter: Router = router

