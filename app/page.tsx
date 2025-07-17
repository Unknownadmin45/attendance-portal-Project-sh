"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Building2, Users, Clock, Calendar, Eye, EyeOff, Mail, Lock, User, Phone, MapPin } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState("login")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // Login form state
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  })

  // Signup form state
  const [signupForm, setSignupForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    department: "",
    designation: "",
    employeeId: "",
  })

  const departments = [
    "IT",
    "HR",
    "Engineering",
    "Finance",
    "Marketing",
    "Sales",
    "Operations",
    "Legal",
    "Customer Support",
  ]

  useEffect(() => {
    // Check if user is already logged in
    const user = localStorage.getItem("currentUser")
    if (user) {
      const userData = JSON.parse(user)
      if (userData.role === "admin") {
        router.push("/admin/dashboard")
      } else {
        router.push("/employee/dashboard")
      }
    }
    initializeData()
  }, [router])

  const initializeData = () => {
    // Initialize sample data if not exists
    if (!localStorage.getItem("users")) {
      const sampleUsers = [
        {
          id: "1",
          employeeId: "EMP001",
          firstName: "John",
          lastName: "Admin",
          email: "admin@scalinova.com",
          password: "admin123",
          phone: "+1234567890",
          role: "admin",
          department: "IT",
          designation: "System Administrator",
          joiningDate: "2024-01-15",
          status: "active",
          reportingManager: "CEO",
          address: {
            street: "123 Corporate Blvd",
            city: "Business City",
            state: "BC",
            zipCode: "12345",
          },
          dateOfBirth: "1985-06-15",
          employmentType: "Full-time",
          salary: 75000,
        },
        {
          id: "2",
          employeeId: "EMP002",
          firstName: "Jane",
          lastName: "Smith",
          email: "jane@scalinova.com",
          password: "emp123",
          phone: "+1234567891",
          role: "employee",
          department: "HR",
          designation: "HR Executive",
          joiningDate: "2024-02-01",
          status: "active",
          reportingManager: "John Admin",
          address: {
            street: "456 Employee St",
            city: "Work City",
            state: "WC",
            zipCode: "12346",
          },
          dateOfBirth: "1990-03-20",
          employmentType: "Full-time",
          salary: 55000,
        },
        {
          id: "3",
          employeeId: "EMP003",
          firstName: "Mike",
          lastName: "Johnson",
          email: "mike@scalinova.com",
          password: "emp123",
          phone: "+1234567892",
          role: "employee",
          department: "Engineering",
          designation: "Software Developer",
          joiningDate: "2024-03-15",
          status: "active",
          reportingManager: "John Admin",
          address: {
            street: "789 Developer Ave",
            city: "Tech City",
            state: "TC",
            zipCode: "12347",
          },
          dateOfBirth: "1988-11-10",
          employmentType: "Full-time",
          salary: 70000,
        },
      ]
      localStorage.setItem("users", JSON.stringify(sampleUsers))
    }

    // Initialize holidays
    if (!localStorage.getItem("holidays")) {
      const holidays = [
        { id: "1", date: "2025-01-01", name: "New Year Day", type: "national" },
        { id: "2", date: "2025-07-04", name: "Independence Day", type: "national" },
        { id: "3", date: "2025-12-25", name: "Christmas Day", type: "national" },
        { id: "4", date: "2025-11-28", name: "Thanksgiving Day", type: "national" },
      ]
      localStorage.setItem("holidays", JSON.stringify(holidays))
    }

    // Initialize leaves
    if (!localStorage.getItem("leaves")) {
      localStorage.setItem("leaves", JSON.stringify([]))
    }

    // Initialize attendance
    if (!localStorage.getItem("attendance")) {
      const sampleAttendance = [
        {
          id: "1",
          userId: "2",
          date: "2025-01-15",
          checkIn: "09:00:00",
          checkOut: "17:30:00",
          totalHours: 8.5,
          status: "present",
          location: {
            latitude: 40.7128,
            longitude: -74.006,
          },
          notes: "Regular working day",
        },
        {
          id: "2",
          userId: "3",
          date: "2025-01-15",
          checkIn: "09:15:00",
          checkOut: "17:45:00",
          totalHours: 8.5,
          status: "present",
          location: {
            latitude: 40.7128,
            longitude: -74.006,
          },
          notes: "Slightly late arrival",
        },
      ]
      localStorage.setItem("attendance", JSON.stringify(sampleAttendance))
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const users = JSON.parse(localStorage.getItem("users") || "[]")
      const user = users.find((u: any) => u.email === loginForm.email && u.password === loginForm.password)

      if (user) {
        localStorage.setItem("currentUser", JSON.stringify(user))
        toast({
          title: "Login Successful",
          description: `Welcome back, ${user.firstName}!`,
        })

        if (user.role === "admin") {
          router.push("/admin/dashboard")
        } else {
          router.push("/employee/dashboard")
        }
      } else {
        toast({
          title: "Login Failed",
          description: "Invalid email or password",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred during login",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validation
      if (signupForm.password !== signupForm.confirmPassword) {
        toast({
          title: "Password Mismatch",
          description: "Passwords do not match",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      if (signupForm.password.length < 6) {
        toast({
          title: "Weak Password",
          description: "Password must be at least 6 characters long",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      const users = JSON.parse(localStorage.getItem("users") || "[]")

      // Check if email already exists
      if (users.find((u: any) => u.email === signupForm.email)) {
        toast({
          title: "Email Already Exists",
          description: "An account with this email already exists",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      // Generate employee ID
      const employeeId = signupForm.employeeId || `EMP${String(users.length + 1).padStart(3, "0")}`

      // Create new user
      const newUser = {
        id: Date.now().toString(),
        employeeId,
        firstName: signupForm.firstName,
        lastName: signupForm.lastName,
        email: signupForm.email,
        password: signupForm.password,
        phone: signupForm.phone,
        role: "employee", // Default role
        department: signupForm.department,
        designation: signupForm.designation,
        joiningDate: new Date().toISOString().split("T")[0],
        status: "active",
        reportingManager: "HR Manager",
        address: {
          street: "",
          city: "",
          state: "",
          zipCode: "",
        },
        dateOfBirth: "",
        employmentType: "Full-time",
        salary: 0,
      }

      users.push(newUser)
      localStorage.setItem("users", JSON.stringify(users))

      toast({
        title: "Account Created Successfully",
        description: "Your account has been created. You can now login.",
      })

      // Reset form and switch to login
      setSignupForm({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
        phone: "",
        department: "",
        designation: "",
        employeeId: "",
      })
      setActiveTab("login")
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred during signup",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-7xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Branding */}
        <div className="hidden lg:block space-y-8">
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center space-x-3">
              <div className="relative">
                <Building2 className="h-16 w-16 text-blue-600" />
                <div className="absolute -top-1 -right-1 h-6 w-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <div className="h-2 w-2 bg-white rounded-full"></div>
                </div>
              </div>
              <div>
                <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Scalinova
                </h1>
                <p className="text-xl text-gray-600 font-medium">Corporate Attendance Portal</p>
              </div>
            </div>
            <p className="text-lg text-gray-700 max-w-md mx-auto">
              Streamline your workforce management with our comprehensive attendance tracking solution
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-white/70 backdrop-blur-sm">
              <CardContent className="pt-6 text-center">
                <div className="mb-4 relative">
                  <Users className="h-10 w-10 text-blue-600 mx-auto group-hover:scale-110 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-blue-100 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Employee Management</h3>
                <p className="text-sm text-gray-600">Comprehensive employee profiles and lifecycle management</p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-white/70 backdrop-blur-sm">
              <CardContent className="pt-6 text-center">
                <div className="mb-4 relative">
                  <Clock className="h-10 w-10 text-green-600 mx-auto group-hover:scale-110 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-green-100 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Time Tracking</h3>
                <p className="text-sm text-gray-600">Accurate attendance tracking with location verification</p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-white/70 backdrop-blur-sm">
              <CardContent className="pt-6 text-center">
                <div className="mb-4 relative">
                  <Calendar className="h-10 w-10 text-purple-600 mx-auto group-hover:scale-110 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-purple-100 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Leave Management</h3>
                <p className="text-sm text-gray-600">Streamlined leave application and approval workflow</p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-white/70 backdrop-blur-sm">
              <CardContent className="pt-6 text-center">
                <div className="mb-4 relative">
                  <Building2 className="h-10 w-10 text-orange-600 mx-auto group-hover:scale-110 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-orange-100 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Advanced Reports</h3>
                <p className="text-sm text-gray-600">Detailed analytics and reporting capabilities</p>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-sm">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-gray-700">System Online & Secure</span>
            </div>
          </div>
        </div>

        {/* Right Side - Auth Forms */}
        <Card className="w-full max-w-md mx-auto shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="text-center space-y-4 pb-8">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
              <Building2 className="h-8 w-8 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                {activeTab === "login" ? "Welcome Back" : "Create Account"}
              </CardTitle>
              <CardDescription className="text-gray-600">
                {activeTab === "login"
                  ? "Sign in to access your attendance portal"
                  : "Join Scalinova and start tracking your attendance"}
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8 bg-gray-100">
                <TabsTrigger value="login" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  Sign In
                </TabsTrigger>
                <TabsTrigger value="signup" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  Sign Up
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-6">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-700 font-medium">
                      Email Address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={loginForm.email}
                        onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                        className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-gray-700 font-medium">
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={loginForm.password}
                        onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                        className="pl-10 pr-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-300"
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Signing in...</span>
                      </div>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </form>

                <div className="text-center space-y-4">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-white text-gray-500">Demo Credentials</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-3 text-xs">
                    <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                      <p className="font-medium text-blue-900">Admin Access</p>
                      <p className="text-blue-700">admin@scalinova.com / admin123</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                      <p className="font-medium text-green-900">Employee Access</p>
                      <p className="text-green-700">jane@scalinova.com / emp123</p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="signup" className="space-y-6">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-gray-700 font-medium">
                        First Name
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="firstName"
                          type="text"
                          placeholder="First name"
                          value={signupForm.firstName}
                          onChange={(e) => setSignupForm({ ...signupForm, firstName: e.target.value })}
                          className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-gray-700 font-medium">
                        Last Name
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="lastName"
                          type="text"
                          placeholder="Last name"
                          value={signupForm.lastName}
                          onChange={(e) => setSignupForm({ ...signupForm, lastName: e.target.value })}
                          className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signupEmail" className="text-gray-700 font-medium">
                      Email Address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="signupEmail"
                        type="email"
                        placeholder="Enter your email"
                        value={signupForm.email}
                        onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                        className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-gray-700 font-medium">
                      Phone Number
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+1234567890"
                        value={signupForm.phone}
                        onChange={(e) => setSignupForm({ ...signupForm, phone: e.target.value })}
                        className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="department" className="text-gray-700 font-medium">
                        Department
                      </Label>
                      <Select
                        value={signupForm.department}
                        onValueChange={(value) => setSignupForm({ ...signupForm, department: value })}
                      >
                        <SelectTrigger className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          {departments.map((dept) => (
                            <SelectItem key={dept} value={dept}>
                              {dept}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="designation" className="text-gray-700 font-medium">
                        Designation
                      </Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="designation"
                          type="text"
                          placeholder="Job title"
                          value={signupForm.designation}
                          onChange={(e) => setSignupForm({ ...signupForm, designation: e.target.value })}
                          className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="employeeId" className="text-gray-700 font-medium">
                      Employee ID (Optional)
                    </Label>
                    <Input
                      id="employeeId"
                      type="text"
                      placeholder="Auto-generated if empty"
                      value={signupForm.employeeId}
                      onChange={(e) => setSignupForm({ ...signupForm, employeeId: e.target.value })}
                      className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signupPassword" className="text-gray-700 font-medium">
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="signupPassword"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create password"
                        value={signupForm.password}
                        onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                        className="pl-10 pr-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">
                      Confirm Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm password"
                        value={signupForm.confirmPassword}
                        onChange={(e) => setSignupForm({ ...signupForm, confirmPassword: e.target.value })}
                        className="pl-10 pr-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-medium rounded-lg transition-all duration-300"
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Creating account...</span>
                      </div>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
