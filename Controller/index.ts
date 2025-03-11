import { Router } from "express"
import { AccountRoutes } from "./AccountController.js"
import { AdminRouter } from "./AdminController.js"
import { HomeRouter } from "./HomeController.js"
import { FactionRouter } from "./FactionController.js"
import { TeamSpeakRouter } from "./TeamSpeakController.js"
import { DiscordController } from "./DiscordController.js"
import { ControlPanelRouter } from "./ControlpanelController.js"

const router: Router = Router()

router.use("/", HomeRouter)
router.use("/auth", AccountRoutes)
router.use("/admin", AdminRouter)
router.use("/faction", FactionRouter)
router.use("/teamspeak", TeamSpeakRouter)
router.use("/discord", DiscordController)
router.use("/cp", ControlPanelRouter)

export const MainRouter: Router = router

