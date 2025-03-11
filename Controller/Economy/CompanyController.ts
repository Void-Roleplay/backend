import { Router } from "express"
import { economyService } from "../../index.js"

const router: Router = Router()

router.get("/", async (req, res) => {
  try {
    return res.send(await economyService.getAllCompanies())
  } catch (error) {
    console.error(error)
    return res.status(500).send("Internal Server Error")
  }
})

router.get("/:company", async (req, res) => {
  try {
    var companyName = req.params.company
    return res.send(await economyService.getCompanyByName(companyName))
  } catch (error) {
    console.error(error)
    return res.status(500).send("Internal Server Error")
  }
})

export const CompanyRouter: Router = router

