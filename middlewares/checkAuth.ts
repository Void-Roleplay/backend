import type { Request, Response, NextFunction } from "express"
import { userService } from "../index.js"
import { AuthError } from "../utils/error.js"

export default function checkAuth() {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.headers.authorization
      if (!token) {
        throw new AuthError("No token provided")
      }

      const username = await userService.verifyUserToken(token)
      if (!username) {
        throw new AuthError("Invalid token")
      }

      next()
    } catch (error) {
      next(error)
    }
  }
}

