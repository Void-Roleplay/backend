import { Router } from "express"
import { userService, authService } from "../../index.js"

const router: Router = Router()

router.get("/", (req, res) => {
  try {
    const message = "Hello from HomeController!"
    res.json({ message })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Internal Server Error" })
  }
})

router.get("/user/getuser", async (req, res) => {
  const token: any = req.headers.authorization

  if (!token) {
    return res.status(401).json(null)
  }

  const username = await userService.verifyUserToken(token)
  if (username === null) {
    return res.status(401).json(null)
  }

  var user = await userService.findByNameAsync(username)
  return res.json(user)
})

router.post("/login", async (req, res, next) => {
  try {
    const { user, password } = req.body
    const result = await authService.login(user, password)
    res.json(result)
  } catch (err) {
    next(err)
  }
})

export const AccountRoutes: Router = router

