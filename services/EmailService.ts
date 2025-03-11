import nodemailer from "nodemailer"
import type { SendMailOptions } from "nodemailer"

export class EmailService {
  private transporter: nodemailer.Transporter

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "",
      port: Number.parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER || "",
        pass: process.env.SMTP_PASSWORD || "",
      },
    })
  }

  public async sendEmail(to: string, subject: string, text: string, html?: string): Promise<boolean> {
    try {
      const mailOptions: SendMailOptions = {
        from: process.env.SMTP_FROM || "noreply@example.com",
        to,
        subject,
        text,
        html: html || text,
      }

      await this.transporter.sendMail(mailOptions)
      return true
    } catch (error) {
      console.error("Error sending email:", error)
      return false
    }
  }

  public async sendPasswordResetEmail(to: string, resetToken: string, username: string): Promise<boolean> {
    const resetUrl = `https://yourwebsite.com/reset-password?token=${resetToken}`

    const subject = "Password Reset Request"
    const text = `Hello ${username},\n\nYou requested a password reset. Please click the following link to reset your password: ${resetUrl}\n\nIf you did not request this, please ignore this email.\n\nRegards,\nYour Website Team`

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Password Reset Request</h2>
        <p>Hello ${username},</p>
        <p>You requested a password reset. Please click the button below to reset your password:</p>
        <p style="text-align: center;">
          <a href="${resetUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
        </p>
        <p>If you did not request this, please ignore this email.</p>
        <p>Regards,<br>Your Website Team</p>
      </div>
    `

    return this.sendEmail(to, subject, text, html)
  }

  public async sendWelcomeEmail(to: string, username: string): Promise<boolean> {
    const subject = "Welcome to Our Platform"
    const text = `Hello ${username},\n\nWelcome to our platform! We're excited to have you on board.\n\nRegards,\nYour Website Team`

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to Our Platform</h2>
        <p>Hello ${username},</p>
        <p>Welcome to our platform! We're excited to have you on board.</p>
        <p>Regards,<br>Your Website Team</p>
      </div>
    `

    return this.sendEmail(to, subject, text, html)
  }

  public async sendVerificationEmail(to: string, verificationToken: string, username: string): Promise<boolean> {
    const verificationUrl = `https://yourwebsite.com/verify-email?token=${verificationToken}`

    const subject = "Email Verification"
    const text = `Hello ${username},\n\nPlease verify your email address by clicking the following link: ${verificationUrl}\n\nRegards,\nYour Website Team`

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Email Verification</h2>
        <p>Hello ${username},</p>
        <p>Please verify your email address by clicking the button below:</p>
        <p style="text-align: center;">
          <a href="${verificationUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Verify Email</a>
        </p>
        <p>Regards,<br>Your Website Team</p>
      </div>
    `

    return this.sendEmail(to, subject, text, html)
  }
}

