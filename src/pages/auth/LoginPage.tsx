"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { User, UserRole } from "../../types"
import { users } from "../../data/users"
import toast from "react-hot-toast"

interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string, role: UserRole) => Promise<void>
  register: (name: string, email: string, password: string, role: UserRole) => Promise<void>
  logout: () => void
  sendOTP: (email: string) => Promise<void>
  verifyOTP: (email: string, otp: string) => Promise<boolean>
  resendOTP: () => Promise<void>
  pendingOTPEmail: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Local storage keys
const USER_STORAGE_KEY = "business_nexus_user"
const RESET_TOKEN_KEY = "business_nexus_reset_token"

class OTPService {
  private otpStore = new Map<string, { code: string; expires: number; attempts: number }>()

  async sendOTP(email: string): Promise<void> {
    // Generate 6-digit OTP
    let code: string
    if (email === "ishmalijaz167@gmail.com") {
      code = "123456" // Hardcoded OTP for this specific email
    } else {
      code = Math.floor(100000 + Math.random() * 900000).toString()
    }

    const expires = Date.now() + 5 * 60 * 1000 // 5 minutes
    const attempts = 0

    // Store OTP (in production, use Redis or database)
    this.otpStore.set(email, { code, expires, attempts })

    console.log(`[OTP Service] Sending OTP ${code} to ${email}`)

    try {
      // Simulate email sending API call
      await this.sendEmailOTP(email, code)
      toast.success("OTP sent to your email!")
    } catch (error) {
      // Fallback: show OTP in console for development
      console.log(`[DEV] OTP for ${email}: ${code}`)
      toast.success(`OTP sent! Check console for development code.`)
    }
  }

  private async sendEmailOTP(email: string, code: string): Promise<void> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    if (email === "ishmalijaz167@gmail.com") {
      console.log(`🔐 HARDCODED OTP for ${email}: ${code}`)
      console.log(`Use this code to login: ${code}`)
    } else {
      console.log(`📧 Email sent to ${email}:`)
      console.log(`Subject: Business Nexus - Your Login Code`)
      console.log(`Body: Your verification code is: ${code}`)
      console.log(`This code expires in 5 minutes.`)
    }

    // Simulate potential email sending failure for testing
    if (Math.random() < 0.1) {
      // 10% chance of failure for demo
      throw new Error("Email service temporarily unavailable")
    }
  }

  async verifyOTP(email: string, inputCode: string): Promise<boolean> {
    const stored = this.otpStore.get(email)

    if (!stored) {
      throw new Error("No OTP found for this email")
    }

    if (Date.now() > stored.expires) {
      this.otpStore.delete(email)
      throw new Error("OTP has expired")
    }

    // Increment attempts
    stored.attempts += 1

    // Max 3 attempts
    if (stored.attempts > 3) {
      this.otpStore.delete(email)
      throw new Error("Too many failed attempts. Please request a new OTP.")
    }

    const isValid = stored.code === inputCode

    if (isValid) {
      this.otpStore.delete(email) // Clean up after successful verification
    } else {
      this.otpStore.set(email, stored) // Update attempts count
    }

    return isValid
  }

  async resendOTP(email: string): Promise<void> {
    // Remove existing OTP before sending new one
    this.otpStore.delete(email)
    await this.sendOTP(email)
  }
}

const otpService = new OTPService()

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [pendingOTPEmail, setPendingOTPEmail] = useState<string | null>(null)

  useEffect(() => {
    const storedUser = localStorage.getItem(USER_STORAGE_KEY)
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string, role: UserRole): Promise<void> => {
    setIsLoading(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const foundUser = users.find((u) => u.email === email && u.role === role)

      if (foundUser) {
        if (foundUser.twoFactorEnabled) {
          await otpService.sendOTP(email)
          setPendingOTPEmail(email)
          toast.success("OTP sent! Please check your email.")
        } else {
          setUser(foundUser)
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(foundUser))
          toast.success("Successfully logged in!")
        }
      } else {
        throw new Error("Invalid credentials or user not found")
      }
    } catch (error) {
      toast.error((error as Error).message)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const verifyOTP = async (email: string, otp: string): Promise<boolean> => {
    console.log("[v0] AuthContext verifyOTP called with email:", email, "otp:", otp)
    setIsLoading(true)

    try {
      const isValid = await otpService.verifyOTP(email, otp)
      console.log("[v0] OTP service returned:", isValid)

      if (isValid) {
        const foundUser = users.find((u) => u.email === email)
        console.log("[v0] Found user:", foundUser?.name)
        if (foundUser) {
          setUser(foundUser)
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(foundUser))
          setPendingOTPEmail(null)
          toast.success("Successfully logged in with 2FA!")
          console.log("[v0] User set successfully, returning true")
          setIsLoading(false) // Set loading false before returning
          return true
        }
      } else {
        toast.error("Invalid OTP. Please try again.")
        console.log("[v0] Invalid OTP entered")
      }
    } catch (error) {
      console.log("[v0] OTP verification error:", error)
      toast.error((error as Error).message)
    }

    setIsLoading(false)
    return false
  }

  const sendOTP = async (email: string): Promise<void> => {
    await otpService.sendOTP(email)
  }

  const resendOTP = async (): Promise<void> => {
    if (!pendingOTPEmail) {
      toast.error("No pending OTP request found")
      return
    }
    await otpService.resendOTP(pendingOTPEmail)
  }

  const register = async (name: string, email: string, password: string, role: UserRole): Promise<void> => {
    setIsLoading(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      if (users.some((u) => u.email === email)) {
        throw new Error("Email already in use")
      }

      const newUser: User = {
        id: `${role[0]}${users.length + 1}`,
        name,
        email,
        role,
        avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
        bio: "",
        isOnline: true,
        twoFactorEnabled: true,
        createdAt: new Date().toISOString(),
      }

      users.push(newUser)

      setUser(newUser)
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser))
      toast.success("Account created successfully!")
    } catch (error) {
      toast.error((error as Error).message)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = (): void => {
    setUser(null)
    setPendingOTPEmail(null)
    localStorage.removeItem(USER_STORAGE_KEY)
    toast.success("Logged out successfully")
  }

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    sendOTP,
    verifyOTP,
    resendOTP,
    pendingOTPEmail,
    isAuthenticated: !!user,
    isLoading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
