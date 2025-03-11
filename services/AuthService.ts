import type Database from "../utils/Database.js"
import type { UserService } from "./UserService.js"
import jwt from "jsonwebtoken"

export class AuthService {
  private database: Database
  private userService: UserService

  constructor(database: Database, userService: UserService) {
    this.database = database
    this.userService = userService
  }

  public async login(email: string, password: string): Promise<any> {
    try {
      const user = await this.userService.getUserByEmail(email)
      if (!user) {
        return { success: false, message: "Invalid email or password" }
      }

      if (user.is_banned) {
        return { success: false, message: "Your account has been banned" }
      }

      const isPasswordValid = await this.userService.validatePassword(user, password)
      if (!isPasswordValid) {
        return { success: false, message: "Invalid email or password" }
      }

      await this.userService.updateLastLogin(user.id)

      const token = this.generateToken(user)

      return {
        success: true,
        token,
        user: {
          id: user.id,
          username: user.player_name,
          email: user.email,
          permLevel: user.player_permlevel,
        },
      }
    } catch (error) {
      console.error("Error during login:", error)
      return { success: false, message: "An error occurred during login" }
    }
  }

  public async register(username: string, email: string, password: string): Promise<any> {
    try {
      // Check if username already exists
      const existingUsername = await this.userService.getUserByUsername(username)
      if (existingUsername) {
        return { success: false, message: "Username already exists" }
      }

      // Check if email already exists
      const existingEmail = await this.userService.getUserByEmail(email)
      if (existingEmail) {
        return { success: false, message: "Email already exists" }
      }

      const user = await this.userService.createUser(username, email, password)
      if (!user) {
        return { success: false, message: "Failed to create user" }
      }

      const token = this.generateToken(user)

      return {
        success: true,
        token,
        user: {
          id: user.id,
          username: user.player_name,
          email: user.email,
          permLevel: user.player_permlevel,
        },
      }
    } catch (error) {
      console.error("Error during registration:", error)
      return { success: false, message: "An error occurred during registration" }
    }
  }

  public async requestPasswordReset(email: string): Promise<any> {
    try {
      const resetToken = await this.userService.generatePasswordResetToken(email)
      if (!resetToken) {
        return { success: false, message: "Email not found" }
      }

      return { success: true, resetToken }
    } catch (error) {
      console.error("Error requesting password reset:", error)
      return { success: false, message: "An error occurred while requesting password reset" }
    }
  }

  public async resetPassword(token: string, password: string): Promise<any> {
    try {
      const success = await this.userService.resetPassword(token, password)
      if (!success) {
        return { success: false, message: "Invalid or expired token" }
      }

      return { success: true, message: "Password reset successfully" }
    } catch (error) {
      console.error("Error resetting password:", error)
      return { success: false, message: "An error occurred while resetting password" }
    }
  }

  public async validateToken(token: string): Promise<any> {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "default_secret") as any

      const user = await this.userService.getUserById(decoded.id)
      if (!user) {
        return { success: false, message: "User not found" }
      }

      if (user.is_banned) {
        return { success: false, message: "Your account has been banned" }
      }

      return {
        success: true,
        user: {
          id: user.id,
          username: user.player_name,
          email: user.email,
          permLevel: user.player_permlevel,
        },
      }
    } catch (error) {
      console.error("Error validating token:", error)
      return { success: false, message: "Invalid token" }
    }
  }

  private generateToken(user: any): string {
    const payload = {
      id: user.id,
      username: user.player_name,
      email: user.email,
      permLevel: user.player_permlevel,
    }

    return jwt.sign(payload, process.env.JWT_SECRET || "default_secret", { expiresIn: "7d" })
  }

  public async changePassword(userId: number, currentPassword: string, newPassword: string): Promise<any> {
    try {
      const user = await this.userService.getUserById(userId)
      if (!user) {
        return { success: false, message: "User not found" }
      }

      const isPasswordValid = await this.userService.validatePassword(user, currentPassword)
      if (!isPasswordValid) {
        return { success: false, message: "Current password is incorrect" }
      }

      const success = await this.userService.updatePassword(userId, newPassword)
      if (!success) {
        return { success: false, message: "Failed to update password" }
      }

      return { success: true, message: "Password changed successfully" }
    } catch (error) {
      console.error("Error changing password:", error)
      return { success: false, message: "An error occurred while changing password" }
    }
  }

  public async logout(token: string): Promise<any> {
    try {
      // In a real implementation, you might want to blacklist the token
      // For now, we'll just return success
      return { success: true, message: "Logged out successfully" }
    } catch (error) {
      console.error("Error during logout:", error)
      return { success: false, message: "An error occurred during logout" }
    }
  }
}

