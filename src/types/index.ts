export type UserRole = "entrepreneur" | "investor"

export interface User {
  id: string
  name: string
  email: string
  password?: string // Added password field for authentication
  role: UserRole
  avatarUrl?: string
  bio?: string
  isOnline?: boolean
  twoFactorEnabled?: boolean
  createdAt: string
}

export interface Entrepreneur extends User {
  role: "entrepreneur"
  startupName?: string
  pitchSummary?: string
  fundingNeeded?: string
  industry?: string
  location?: string
  foundedYear?: number
  teamSize?: number
}

export interface Investor extends User {
  role: "investor"
  investmentInterests?: string[]
  investmentStage?: string[]
  portfolioCompanies?: string[]
  totalInvestments?: number
  minimumInvestment?: string
  maximumInvestment?: string
}

export interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}

export interface AuthContextType extends AuthState {
  login: (email: string, password: string, role: UserRole) => Promise<void>
  register: (name: string, email: string, password: string, role: UserRole) => Promise<void>
  logout: () => void
  sendOTP: (email: string) => Promise<void>
  verifyOTP: (email: string, otp: string) => Promise<boolean>
  resendOTP: (email: string) => Promise<void>
  pendingOTPEmail: string | null
  forgotPassword?: (email: string) => Promise<void>
  resetPassword?: (token: string, newPassword: string) => Promise<void>
  updateProfile?: (userId: string, updates: Partial<User>) => Promise<void>
}
