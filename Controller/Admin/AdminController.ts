import { Router } from "express"
import { AdminFactionRouter } from "./FactionController.js"
import { AdminPlayerRouter } from "./PlayerController.js"
import { AdminLogRouter } from "./LogController.js"
import { AdminEconomyRouter } from "./EconomyController.js"
import { AdminGamePlayRouter } from "./GameplayController.js"
import { AdminRuleRouter } from "./RuleController.js"
import { AdminBanRouter } from "./BanController.js"
import { AdminProfileRouter } from "./ProfileController.js"
import { ContractRouter } from "../Gameplay/ContractController.js"
import { WeaponRouter } from "../Gameplay/WeaponController.js"
import { ShopRouter } from "../Gameplay/ShopController.js"
import { TransactionRouter } from "../Economy/TransactionController.js"
import { VehicleRouter } from "../Economy/VehicleController.js"
import { RealEstateRouter } from "../Economy/RealEstateController.js"
import { WhitelistRouter } from "../User/WhitelistController.js"
import { CompanyRouter } from "../Economy/CompanyController.js"
import { BanRouter } from "../User/BanController.js"
import { NoteRouter } from "../User/NoteController.js"

const router: Router = Router()

router.use("/faction", AdminFactionRouter)
router.use("/player", AdminPlayerRouter)
router.use("/log", AdminLogRouter)
router.use("/economy", AdminEconomyRouter)
router.use("/gameplay", AdminGamePlayRouter)
router.use("/rules", AdminRuleRouter)
router.use("/ban", AdminBanRouter)
router.use("/profile", AdminProfileRouter)

router.use("/contract", ContractRouter)
router.use("/weapon", WeaponRouter)
router.use("/shop", ShopRouter)
router.use("/transaction", TransactionRouter)
router.use("/vehicle", VehicleRouter)
router.use("/realestate", RealEstateRouter)
router.use("/whitelist", WhitelistRouter)
router.use("/company", CompanyRouter)
router.use("/ban", BanRouter)
router.use("/note", NoteRouter)

export const AdminRouter: Router = router

