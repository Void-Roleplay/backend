import { Router } from "express"
import { adminService } from "../../index.js"

const router: Router = Router()

router.get("/get", async (req, res) => {
  try {
    return res.send(await adminService.getRules())
  } catch (error) {
    console.error(error)
    return res.status(500).send("Internal Server Error")
  }
})

router.get("/get/:id", async (req, res) => {
  try {
    const ruleId = Number.parseInt(req.params.id)
    return res.send(await adminService.getRuleById(ruleId))
  } catch (error) {
    console.error(error)
    return res.status(500).send("Internal Server Error")
  }
})

export const RuleRouter: Router = router

