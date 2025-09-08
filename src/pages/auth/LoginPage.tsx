"use client"

import React, { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { User, CircleDollarSign, Building2, LogIn, AlertCircle } from "lucide-react"
import { useAuth } from "../../context/AuthContext"
import { Button } from "../../components/ui/Button"
import { Input } from "../../components/ui/Input"
import type { UserRole } from "../../types"

const OTPInput: React.FC<{
  value: string
  onChange: (value: string) => void
  length?: number
}> = ({ value, onChange, length = 6 }) => {
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([])

  const handleChange = (index: number, digit: string) => {
    if (!/^\d*$/.test(digit)) return

    const newValue = value.split("")
    newValue[index] = digit
    onChange(newValue.join(""))

    // Auto-focus next input
    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  return (
    <div className="flex gap-2 justify-center">
      {Array.from({ length }, (_, index) => (
        <input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          maxLength={1}
          value={value[index] || ""}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          className="w-12 h-12 text-center text-lg font-semibold border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
      ))}
    </div>
  )
}

const fillDemoCredentials = (role: UserRole) => {
  const demoEmails = {
    entrepreneur: "entrepreneur-demo@example.com",
    investor: "investor-demo@example.com",
  }
  const demoPassword = "demo123"

  return {
    email: demoEmails[role],
    password: demoPassword,
  }
}

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<UserRole>("entrepreneur")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showTwoFA, setShowTwoFA] = useState(false)
  const [otpCode, setOtpCode] = useState("")
  const [isVerifyingOTP, setIsVerifyingOTP] = useState(false)
  const [isSendingOTP, setIsSendingOTP] = useState(false)

  const { login, verifyOTP, resendOTP, pendingOTPEmail } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      await login(email, password, role)

      if (pendingOTPEmail) {
        setShowTwoFA(true)
        setIsLoading(false)
        return
      }

      // If no OTP required, navigate directly
      navigate(role === "entrepreneur" ? "/entrepreneur-dashboard" : "/investor-dashboard")
    } catch (err) {
      setError((err as Error).message)
      setIsLoading(false)
    }
  }

  const handleOTPVerification = async (e: React.FormEvent) => {
    e.preventDefault()
    if (otpCode.length !== 6) {
      setError("Please enter a valid 6-digit code")
      return
    }

    console.log("[v0] Starting OTP verification with code:", otpCode)
    setIsVerifyingOTP(true)
    setError(null)

    try {
      console.log("[v0] Calling verifyOTP with email:", pendingOTPEmail || email)
      const isValidOTP = await verifyOTP(pendingOTPEmail || email, otpCode)
      console.log("[v0] verifyOTP result:", isValidOTP)

      if (isValidOTP) {
        console.log("[v0] OTP verified successfully, navigating to dashboard")
        setIsVerifyingOTP(false)
        navigate(role === "entrepreneur" ? "/entrepreneur-dashboard" : "/investor-dashboard")
      } else {
        console.log("[v0] OTP verification failed")
        setIsVerifyingOTP(false)
      }
    } catch (err) {
      console.log("[v0] OTP verification error:", err)
      setError((err as Error).message)
      setIsVerifyingOTP(false)
    }
  }

  const handleResendOTP = async () => {
    try {
      setIsSendingOTP(true)
      setError(null)
      await resendOTP()
      setIsSendingOTP(false)
    } catch (err) {
      setError((err as Error).message)
      setIsSendingOTP(false)
    }
  }

  const resetTwoFA = () => {
    setShowTwoFA(false)
    setOtpCode("")
    setError(null)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 bg-primary-600 rounded-md flex items-center justify-center">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-white"
            >
              <path
                d="M20 7H4C2.89543 7 2 7.89543 2 9V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19V9C22 7.89543 21.1046 7 20 7Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M16 21V5C16 3.89543 15.1046 3 14 3H10C8.89543 3 8 3.89543 8 5V21"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {showTwoFA ? "Enter Verification Code" : "Sign in to Business Nexus"}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {showTwoFA ? "We sent a 6-digit code to your email" : "Connect with investors and entrepreneurs"}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 bg-error-50 border border-error-500 text-error-700 px-4 py-3 rounded-md flex items-start">
              <AlertCircle size={18} className="mr-2 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {!showTwoFA ? (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">I am a</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    className={`py-3 px-4 border rounded-md flex items-center justify-center transition-colors ${
                      role === "entrepreneur"
                        ? "border-primary-500 bg-primary-50 text-primary-700"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                    onClick={(e: React.MouseEvent<HTMLButtonElement>) => setRole("entrepreneur")}
                  >
                    <Building2 size={18} className="mr-2" />
                    Entrepreneur
                  </button>

                  <button
                    type="button"
                    className={`py-3 px-4 border rounded-md flex items-center justify-center transition-colors ${
                      role === "investor"
                        ? "border-primary-500 bg-primary-50 text-primary-700"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                    onClick={(e: React.MouseEvent<HTMLButtonElement>) => setRole("investor")}
                  >
                    <CircleDollarSign size={18} className="mr-2" />
                    Investor
                  </button>
                </div>
              </div>

              <Input
                label="Email address"
                type="email"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                required
                fullWidth
                startAdornment={<User size={18} />}
              />

              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                required
                fullWidth
              />

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <a href="#" className="font-medium text-primary-600 hover:text-primary-500">
                    Forgot your password?
                  </a>
                </div>
              </div>

              <Button type="submit" fullWidth isLoading={isLoading || isSendingOTP} leftIcon={<LogIn size={18} />}>
                {isSendingOTP ? "Sending OTP..." : "Sign in"}
              </Button>
            </form>
          ) : (
            <form className="space-y-6" onSubmit={handleOTPVerification}>
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-4">
                  Signed in as: <span className="font-medium">{email}</span>
                </div>
                <OTPInput value={otpCode} onChange={setOtpCode} />
              </div>

              <Button type="submit" fullWidth isLoading={isVerifyingOTP} disabled={otpCode.length !== 6}>
                Verify Code
              </Button>

              <div className="text-center space-y-2">
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={isSendingOTP}
                  className="text-sm text-primary-600 hover:text-primary-500 disabled:opacity-50"
                >
                  {isSendingOTP ? "Sending..." : "Resend Code"}
                </button>
                <br />
                <button type="button" onClick={resetTwoFA} className="text-sm text-primary-600 hover:text-primary-500">
                  ← Back to login
                </button>
              </div>
            </form>
          )}

          {!showTwoFA && (
            <>
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Demo Accounts</span>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                      const demoCredentials = fillDemoCredentials("entrepreneur")
                      setEmail(demoCredentials.email)
                      setPassword(demoCredentials.password)
                    }}
                    leftIcon={<Building2 size={16} />}
                  >
                    Entrepreneur Demo
                  </Button>

                  <Button
                    variant="outline"
                    onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                      const demoCredentials = fillDemoCredentials("investor")
                      setEmail(demoCredentials.email)
                      setPassword(demoCredentials.password)
                    }}
                    leftIcon={<CircleDollarSign size={16} />}
                  >
                    Investor Demo
                  </Button>
                </div>
              </div>

              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or</span>
                  </div>
                </div>

                <div className="mt-2 text-center">
                  <p className="text-sm text-gray-600">
                    Don't have an account?{" "}
                    <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500">
                      Sign up
                    </Link>
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
