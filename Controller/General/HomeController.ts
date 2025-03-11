import { Router } from "express"
import { emailService, database, adminService } from "../../index.js"

const router: Router = Router()

router.post("/sendContact", async (req, res) => {
  const username = req.body.name
  const email = req.body.email
  const message = req.body.message
  await emailService.sendAsync(
    "management@voidroleplay.de",
    "[System] Kontaktformular",
    `Hallo Team!<br><br>${username} hat eine Nachricht über das Kontaktformular gesendet.<br>Message: ${message}<br>Email: ${email}`,
  )
  await emailService.sendAsync(
    email,
    "Kontaktformular eingegangen",
    `Hallo ${username}!<br><br>Wir haben deine Nachricht erhalten und kümmern uns so schnell wie möglich drum.`,
  )
  return res.json()
})

router.get("/team", async (req, res) => {
  return res
    .status(200)
    .json(
      await database.query(
        "SELECT p.player_name, p.uuid, r.rang FROM players AS p LEFT JOIN ranks AS r ON p.player_permlevel = r.permlevel WHERE p.player_permlevel >= 40",
      ),
    )
})

router.get("/statistics", async (req, res) => {
  var count: any = await database.query("SELECT COUNT(*) AS count FROM players")
  var factionCount: any = await database.query("SELECT COUNT(*) AS count FROM factions WHERE isActive = true")
  var companyCount: any = await database.query("SELECT COUNT(*) AS count FROM companies")

  var returnValue = {
    registeredCount: count[0].count,
    factionCount: factionCount[0].count,
    companyCount: companyCount[0].count,
  }
  return res.status(200).json(returnValue)
})

router.get("/rules", async (req, res) => {
  return res.status(200).json(await adminService.getRules())
})

router.get("/leaderboards", async (req, res) => {
  return res.status(200).json([
    { display: "Visum", url: "visum" },
    { display: "Level", url: "level" },
    { display: "Bekanntheit", url: "popularity" },
    { display: "Fischer", url: "fishing" },
    { display: "Holzfäller", url: "lumberjack" },
  ])
})

router.get("/leaderboard/:type", async (req, res) => {
  const type: string = req.params.type
  let query = ""

  switch (type.toLowerCase()) {
    case "visum":
      query = "SELECT player_name, visum AS level, uuid FROM players ORDER BY visum DESC LIMIT 100;"
      break
    case "level":
      query = "SELECT player_name, level, uuid FROM players ORDER BY level DESC LIMIT 100;"
      break
    case "popularity":
      query =
        "SELECT p.player_name AS player_name, p.uuid AS uuid, pa.popularityLevel AS level FROM player_addonxp AS pa LEFT JOIN players AS p ON pa.uuid = p.uuid ORDER BY pa.popularityLevel DESC LIMIT 100;"
      break
    case "fishing":
      query =
        "SELECT p.player_name AS player_name, p.uuid AS uuid, pa.fishingLevel AS level FROM player_addonxp AS pa LEFT JOIN players AS p ON pa.uuid = p.uuid ORDER BY pa.fishingLevel DESC LIMIT 100;"
      break
    case "lumberjack":
      query =
        "SELECT p.player_name AS player_name, p.uuid AS uuid, pa.lumberjackLevel AS level FROM player_addonxp AS pa LEFT JOIN players AS p ON pa.uuid = p.uuid ORDER BY pa.lumberjackLevel DESC LIMIT 100;"
      break
    default:
      return res.status(404).send()
  }

  return res.status(200).json(await database.query(query))
})

router.get("/leaderboard-info/:type", async (req, res) => {
  const type: string = req.params.type
  const response = { type: "", display: "" }
  switch (type.toLowerCase()) {
    case "visum":
      response.type = "Visum"
      response.display = "Visum"
      break
    case "level":
      response.type = "Level"
      response.display = "Level"
      break
    case "popularity":
      response.type = "Level"
      response.display = "Bekanntheit"
      break
    case "fishing":
      response.type = "Level"
      response.display = "Fischer"
      break
    case "lumberjack":
      response.type = "Level"
      response.display = "Holzfäller"
      break
    default:
      return res.status(404).send()
  }
  return res.status(200).json(response)
})

export const HomeRouter: Router = router

