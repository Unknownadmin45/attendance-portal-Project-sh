"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  CalendarIcon,
  LogOut,
  CheckCircle,
  XCircle,
  Timer,
  FileText,
  User,
  Mail,
  Phone,
  Building2,
  Clock,
  TrendingUp,
  Download,
  Plus,
  CalendarIcon as CalendarLucide,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { WhatsAppIntegrationCard } from "@/components/whatsapp-integration-card"
import { formatDate, formatTime, exportToCSV, calculateAttendanceRate } from "@/lib/utils"

interface Employee {
  id: string
  employeeId: string
  firstName: string
  lastName: string
  email: string
  role: string
  department: string
  designation: string
  status: string
  joiningDate: string
  phone?: string
  reportingManager: string
  salary: number
}

interface AttendanceRecord {
  id: string
  userId: string
  date: string
  checkIn: string
  checkOut?: string
  status: string
  totalHours?: number
  notes?: string
}

interface LeaveRecord {
  id: string
  userId: string
  leaveType: string
  fromDate: string
  toDate: string
  reason: string
  status: string
  appliedDate: string
  totalDays: number
}

export default function EmployeeDashboard() {
  const [currentUser, setCurrentUser] = useState<Employee | null>(null)
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [leaveRecords, setLeaveRecords] = useState<LeaveRecord[]>([])
  const [todayAttendance, setTodayAttendance] = useState<AttendanceRecord | null>(null)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false)
  const [leaveForm, setLeaveForm] = useState({
    leaveType: "Annual Leave",
    fromDate: "",
    toDate: "",
    reason: "",
  })
  const router = useRouter()

  const leaveTypes = [
    "Annual Leave",
    "Sick Leave",
    "Personal Leave",
    "Emergency Leave",
    "Maternity Leave",
    "Paternity Leave",
  ]

  useEffect(() => {
    const user = localStorage.getItem("currentUser")
    if (!user) {
      router.push("/")
      return
    }

    const userData = JSON.parse(user)
    if (userData.role !== "employee") {
      router.push("/admin/dashboard")
      return
    }

    setCurrentUser(userData)
    loadAttendanceData(userData.id)

    // Update current time every second
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [router])

  const loadAttendanceData = (userId: string) => {
    const attendance = JSON.parse(localStorage.getItem("attendance") || "[]")
    const leaves = JSON.parse(localStorage.getItem("leaves") || "[]")

    const userAttendance = attendance.filter((a: AttendanceRecord) => a.userId === userId)
    const userLeaves = leaves.filter((l: LeaveRecord) => l.userId === userId)

    setAttendanceRecords(userAttendance)
    setLeaveRecords(userLeaves)

    // Check today's attendance
    const today = new Date().toISOString().split("T")[0]
    const todayRecord = userAttendance.find((a: AttendanceRecord) => a.date === today)
    setTodayAttendance(todayRecord || null)
  }

  const handleCheckIn = () => {
    if (!currentUser) return

    const now = new Date()
    const today = now.toISOString().split("T")[0]
    const time = now.toLocaleTimeString()

    // Get location if available
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newRecord: AttendanceRecord = {
            id: Date.now().toString(),
            userId: currentUser.id,
            date: today,
            checkIn: time,
            status: "present",
            notes: `Checked in via web portal at ${position.coords.latitude}, ${position.coords.longitude}`,
          }

          const attendance = JSON.parse(localStorage.getItem("attendance") || "[]")
          attendance.push(newRecord)
          localStorage.setItem("attendance", JSON.stringify(attendance))

          setTodayAttendance(newRecord)
          loadAttendanceData(currentUser.id)

          toast({
            title: "Check-in Successful",
            description: `Checked in at ${time}`,
          })
        },
        () => {
          // Fallback without location
          const newRecord: AttendanceRecord = {
            id: Date.now().toString(),
            userId: currentUser.id,
            date: today,
            checkIn: time,
            status: "present",
            notes: "Checked in via web portal",
          }

          const attendance = JSON.parse(localStorage.getItem("attendance") || "[]")
          attendance.push(newRecord)
          localStorage.setItem("attendance", JSON.stringify(attendance))

          setTodayAttendance(newRecord)
          loadAttendanceData(currentUser.id)

          toast({
            title: "Check-in Successful",
            description: `Checked in at ${time}`,
          })
        },
      )
    }
  }

  const handleCheckOut = () => {
    if (!currentUser || !todayAttendance) return

    const now = new Date()
    const time = now.toLocaleTimeString()

    const attendance = JSON.parse(localStorage.getItem("attendance") || "[]")
    const recordIndex = attendance.findIndex((a: AttendanceRecord) => a.id === todayAttendance.id)

    if (recordIndex !== -1) {
      attendance[recordIndex].checkOut = time

      // Calculate total hours
      const checkInTime = new Date(`${todayAttendance.date} ${todayAttendance.checkIn}`)
      const checkOutTime = new Date(`${todayAttendance.date} ${time}`)
      const totalHours = (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60)
      attendance[recordIndex].totalHours = Math.round(totalHours * 100) / 100

      localStorage.setItem("attendance", JSON.stringify(attendance))

      const updatedRecord = { ...todayAttendance, checkOut: time, totalHours: attendance[recordIndex].totalHours }
      setTodayAttendance(updatedRecord)
      loadAttendanceData(currentUser.id)

      toast({
        title: "Check-out Successful",
        description: `Checked out at ${time}. Total hours: ${attendance[recordIndex].totalHours}`,
      })
    }
  }

  const handleLeaveApplication = () => {
    if (!currentUser) return

    if (!leaveForm.fromDate || !leaveForm.toDate || !leaveForm.reason.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    const fromDate = new Date(leaveForm.fromDate)
    const toDate = new Date(leaveForm.toDate)

    if (fromDate > toDate) {
      toast({
        title: "Invalid Dates",
        description: "From date cannot be after to date",
        variant: "destructive",
      })
      return
    }

    const totalDays = Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24)) + 1

    const newLeave: LeaveRecord = {
      id: Date.now().toString(),
      userId: currentUser.id,
      leaveType: leaveForm.leaveType,
      fromDate: leaveForm.fromDate,
      toDate: leaveForm.toDate,
      reason: leaveForm.reason,
      status: "pending",
      appliedDate: new Date().toISOString(),
      totalDays,
    }

    const leaves = JSON.parse(localStorage.getItem("leaves") || "[]")
    leaves.push(newLeave)
    localStorage.setItem("leaves", JSON.stringify(leaves))

    setLeaveForm({
      leaveType: "Annual Leave",
      fromDate: "",
      toDate: "",
      reason: "",
    })

    setIsLeaveDialogOpen(false)
    loadAttendanceData(currentUser.id)

    toast({
      title: "Leave Application Submitted",
      description: `Your ${leaveForm.leaveType} application for ${totalDays} days has been submitted for approval`,
    })
  }

  const handleLogout = () => {
    localStorage.removeItem("currentUser")
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    })
    router.push("/")
  }

  const getAttendanceForDate = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0]
    return attendanceRecords.find((record) => record.date === dateStr)
  }

  const getMonthlyStats = () => {
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()

    const monthlyRecords = attendanceRecords.filter((record) => {
      const recordDate = new Date(record.date)
      return recordDate.getMonth() === currentMonth && recordDate.getFullYear() === currentYear
    })

    const totalHours = monthlyRecords.reduce((sum, r) => sum + (r.totalHours || 0), 0)
    const presentDays = monthlyRecords.filter((r) => r.status === "present").length

    return {
      totalDays: monthlyRecords.length,
      presentDays,
      totalHours: Math.round(totalHours * 10) / 10,
      attendanceRate: calculateAttendanceRate(presentDays, monthlyRecords.length),
    }
  }

  const exportMyAttendance = () => {
    const reportData = attendanceRecords.map((record) => ({
      Date: formatDate(record.date),
      CheckIn: formatTime(record.checkIn),
      CheckOut: record.checkOut ? formatTime(record.checkOut) : "Not checked out",
      TotalHours: record.totalHours || 0,
      Status: record.status,
      Notes: record.notes || "",
    }))

    exportToCSV(reportData, `my-attendance-${currentUser?.employeeId}-${new Date().toISOString().split("T")[0]}`)

    toast({
      title: "Report Exported",
      description: "Your attendance report has been exported successfully",
    })
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const monthlyStats = getMonthlyStats()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Enhanced Header */}
      <header className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-blue-600 rounded-xl flex items-center justify-center">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Employee Dashboard</h1>
                  <p className="text-sm text-gray-600">
                    Welcome, {currentUser.firstName} {currentUser.lastName}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:block text-right bg-gray-50 px-4 py-2 rounded-lg">
                <p className="text-sm font-medium text-gray-900">{currentTime.toLocaleDateString()}</p>
                <p className="text-lg font-bold text-blue-600">{currentTime.toLocaleTimeString()}</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions & Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="stats-card bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-lg text-green-700">Check In/Out</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              {!todayAttendance ? (
                <Button
                  onClick={handleCheckIn}
                  className="w-full h-12 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                  size="lg"
                >
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Check In
                </Button>
              ) : !todayAttendance.checkOut ? (
                <div className="space-y-3">
                  <div className="bg-green-100 rounded-lg p-3">
                    <p className="text-sm text-green-700 font-medium">Checked in</p>
                    <p className="text-lg font-bold text-green-900">{formatTime(todayAttendance.checkIn)}</p>
                  </div>
                  <Button
                    onClick={handleCheckOut}
                    variant="outline"
                    className="w-full h-12 border-red-300 text-red-700 hover:bg-red-50 bg-transparent"
                    size="lg"
                  >
                    <XCircle className="h-5 w-5 mr-2" />
                    Check Out
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="bg-green-100 rounded-lg p-2">
                    <p className="text-xs text-green-600">In: {formatTime(todayAttendance.checkIn)}</p>
                    <p className="text-xs text-blue-600">Out: {formatTime(todayAttendance.checkOut)}</p>
                  </div>
                  <div className="bg-blue-100 rounded-lg p-2">
                    <p className="text-sm font-medium text-blue-900">{todayAttendance.totalHours}h worked</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="stats-card bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-700">This Month</CardTitle>
              <CalendarIcon className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">{monthlyStats.presentDays}</div>
              <p className="text-xs text-blue-600">Days present</p>
            </CardContent>
          </Card>

          <Card className="stats-card bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-700">Total Hours</CardTitle>
              <Timer className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-900">{monthlyStats.totalHours}</div>
              <p className="text-xs text-purple-600">Hours worked</p>
            </CardContent>
          </Card>

          <Card className="stats-card bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-700">Attendance Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-900">{monthlyStats.attendanceRate}%</div>
              <p className="text-xs text-orange-600">This month</p>
            </CardContent>
          </Card>
        </div>

        {/* WhatsApp Integration */}
        <div className="mb-8">
          <WhatsAppIntegrationCard userPhone={currentUser?.phone} isEmployee={true} />
        </div>

        {/* Main Content */}
        <Tabs defaultValue="attendance" className="space-y-6">
          <TabsList className="bg-white shadow-sm border">
            <TabsTrigger
              value="attendance"
              className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
            >
              Attendance Calendar
            </TabsTrigger>
            <TabsTrigger value="profile" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
              My Profile
            </TabsTrigger>
            <TabsTrigger value="leaves" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
              Leave Management
            </TabsTrigger>
            <TabsTrigger value="reports" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
              My Reports
            </TabsTrigger>
          </TabsList>

          <TabsContent value="attendance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="shadow-lg">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                  <CardTitle className="flex items-center gap-2">
                    <CalendarLucide className="h-5 w-5 text-blue-600" />
                    Attendance Calendar
                  </CardTitle>
                  <CardDescription>View your attendance history</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="rounded-md border w-full"
                    modifiers={{
                      present: (date) => {
                        const record = getAttendanceForDate(date)
                        return record?.status === "present"
                      },
                      absent: (date) => {
                        const today = new Date()
                        const record = getAttendanceForDate(date)
                        return date < today && !record
                      },
                    }}
                    modifiersStyles={{
                      present: { backgroundColor: "#22c55e", color: "white" },
                      absent: { backgroundColor: "#ef4444", color: "white" },
                    }}
                  />
                  <div className="mt-4 flex flex-wrap gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-green-500 rounded"></div>
                      <span className="text-sm">Present</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-red-500 rounded"></div>
                      <span className="text-sm">Absent</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-blue-500 rounded"></div>
                      <span className="text-sm">Today</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 border-b">
                  <CardTitle>{selectedDate ? formatDate(selectedDate.toISOString()) : "Select a Date"}</CardTitle>
                  <CardDescription>Attendance details for selected date</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  {selectedDate &&
                    (() => {
                      const record = getAttendanceForDate(selectedDate)
                      return record ? (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                            <span className="font-medium">Status:</span>
                            <Badge className="bg-green-100 text-green-800">{record.status}</Badge>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                            <span className="font-medium">Check In:</span>
                            <span className="font-mono">{formatTime(record.checkIn)}</span>
                          </div>
                          {record.checkOut && (
                            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                              <span className="font-medium">Check Out:</span>
                              <span className="font-mono">{formatTime(record.checkOut)}</span>
                            </div>
                          )}
                          {record.totalHours && (
                            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                              <span className="font-medium">Total Hours:</span>
                              <span className="font-bold text-orange-700">{record.totalHours} hours</span>
                            </div>
                          )}
                          {record.notes && (
                            <div className="p-3 bg-gray-50 rounded-lg">
                              <span className="font-medium">Notes:</span>
                              <p className="text-sm text-gray-600 mt-1">{record.notes}</p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-500">No attendance record for this date</p>
                        </div>
                      )
                    })()}
                </CardContent>
              </Card>
            </div>

            {/* Recent Attendance */}
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-purple-600" />
                  Recent Attendance
                </CardTitle>
                <CardDescription>Your last 7 days attendance</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {attendanceRecords
                    .slice(-7)
                    .reverse()
                    .map((record) => (
                      <div
                        key={record.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border hover:shadow-md transition-shadow"
                      >
                        <div>
                          <p className="font-medium text-gray-900">{formatDate(record.date)}</p>
                          <p className="text-sm text-gray-600">
                            {formatTime(record.checkIn)} -{" "}
                            {record.checkOut ? formatTime(record.checkOut) : "Not checked out"}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge
                            variant={record.status === "present" ? "default" : "destructive"}
                            className={record.status === "present" ? "bg-green-100 text-green-800" : ""}
                          >
                            {record.status}
                          </Badge>
                          {record.totalHours && <p className="text-sm text-gray-600 mt-1">{record.totalHours}h</p>}
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b">
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-indigo-600" />
                  Employee Profile
                </CardTitle>
                <CardDescription>Your personal and professional information</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-lg">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-xl">
                          {currentUser.firstName[0]}
                          {currentUser.lastName[0]}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">
                          {currentUser.firstName} {currentUser.lastName}
                        </h3>
                        <p className="text-blue-600 font-medium">{currentUser.designation}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <Building2 className="h-5 w-5 text-gray-500" />
                        <div>
                          <label className="text-sm font-medium text-gray-700">Employee ID</label>
                          <p className="text-lg font-mono">{currentUser.employeeId}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <Mail className="h-5 w-5 text-gray-500" />
                        <div>
                          <label className="text-sm font-medium text-gray-700">Email</label>
                          <p className="text-lg">{currentUser.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <Phone className="h-5 w-5 text-gray-500" />
                        <div>
                          <label className="text-sm font-medium text-gray-700">Phone</label>
                          <p className="text-lg">{currentUser.phone || "Not provided"}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <Building2 className="h-5 w-5 text-gray-500" />
                      <div>
                        <label className="text-sm font-medium text-gray-700">Department</label>
                        <p className="text-lg">{currentUser.department}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <User className="h-5 w-5 text-gray-500" />
                      <div>
                        <label className="text-sm font-medium text-gray-700">Reporting Manager</label>
                        <p className="text-lg">{currentUser.reportingManager}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <CalendarLucide className="h-5 w-5 text-gray-500" />
                      <div>
                        <label className="text-sm font-medium text-gray-700">Joining Date</label>
                        <p className="text-lg">{formatDate(currentUser.joiningDate)}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <div>
                        <label className="text-sm font-medium text-gray-700">Status</label>
                        <Badge className="bg-green-100 text-green-800">{currentUser.status}</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leaves" className="space-y-6">
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 border-b">
                <div className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <CalendarLucide className="h-5 w-5 text-orange-600" />
                      Leave Management
                    </CardTitle>
                    <CardDescription>Apply for leaves and track your leave balance</CardDescription>
                  </div>
                  <Dialog open={isLeaveDialogOpen} onOpenChange={setIsLeaveDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700">
                        <Plus className="h-4 w-4 mr-2" />
                        Apply for Leave
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Apply for Leave</DialogTitle>
                        <DialogDescription>Submit your leave application for approval</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="leaveType">Leave Type</Label>
                          <select
                            id="leaveType"
                            value={leaveForm.leaveType}
                            onChange={(e) => setLeaveForm({ ...leaveForm, leaveType: e.target.value })}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            {leaveTypes.map((type) => (
                              <option key={type} value={type}>
                                {type}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="fromDate">From Date</Label>
                          <Input
                            id="fromDate"
                            type="date"
                            value={leaveForm.fromDate}
                            onChange={(e) => setLeaveForm({ ...leaveForm, fromDate: e.target.value })}
                            min={new Date().toISOString().split("T")[0]}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="toDate">To Date</Label>
                          <Input
                            id="toDate"
                            type="date"
                            value={leaveForm.toDate}
                            onChange={(e) => setLeaveForm({ ...leaveForm, toDate: e.target.value })}
                            min={leaveForm.fromDate || new Date().toISOString().split("T")[0]}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="reason">Reason</Label>
                          <Textarea
                            id="reason"
                            value={leaveForm.reason}
                            onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                            placeholder="Please provide reason for leave..."
                            rows={3}
                          />
                        </div>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setIsLeaveDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleLeaveApplication}>Submit Application</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {leaveRecords.length === 0 ? (
                    <div className="text-center py-12">
                      <CalendarLucide className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg">No leave applications yet</p>
                      <p className="text-gray-400 text-sm">Click "Apply for Leave" to submit your first application</p>
                    </div>
                  ) : (
                    leaveRecords.map((leave) => (
                      <div
                        key={leave.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                            <CalendarLucide className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{leave.leaveType}</p>
                            <p className="text-sm text-gray-600">
                              {formatDate(leave.fromDate)} to {formatDate(leave.toDate)}
                            </p>
                            <p className="text-sm text-gray-700 mt-1">
                              <strong>Reason:</strong> {leave.reason}
                            </p>
                            <p className="text-sm text-gray-500">
                              Applied: {formatDate(leave.appliedDate)} • {leave.totalDays} days
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge
                            variant={
                              leave.status === "approved"
                                ? "default"
                                : leave.status === "rejected"
                                  ? "destructive"
                                  : "secondary"
                            }
                            className={
                              leave.status === "approved"
                                ? "bg-green-100 text-green-800"
                                : leave.status === "rejected"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-yellow-100 text-yellow-800"
                            }
                          >
                            {leave.status}
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-purple-600" />
                  My Reports
                </CardTitle>
                <CardDescription>Download your attendance and performance reports</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 border-dashed border-gray-200 hover:border-blue-400">
                    <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                        <FileText className="h-8 w-8 text-blue-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">Attendance Report</h3>
                      <p className="text-sm text-gray-600 mb-4">Your complete attendance history</p>
                      <Button onClick={exportMyAttendance} className="w-full">
                        <Download className="h-4 w-4 mr-2" />
                        Download Report
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 border-dashed border-gray-200 hover:border-green-400">
                    <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
                        <CalendarLucide className="h-8 w-8 text-green-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">Monthly Summary</h3>
                      <p className="text-sm text-gray-600 mb-4">This month's performance summary</p>
                      <Button onClick={exportMyAttendance} className="w-full">
                        <Download className="h-4 w-4 mr-2" />
                        Download Summary
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 border-dashed border-gray-200 hover:border-purple-400">
                    <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                      <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
                        <TrendingUp className="h-8 w-8 text-purple-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">Performance Report</h3>
                      <p className="text-sm text-gray-600 mb-4">Quarterly performance analysis</p>
                      <Button onClick={exportMyAttendance} className="w-full">
                        <Download className="h-4 w-4 mr-2" />
                        Download Analysis
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                {/* Quick Stats */}
                <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-blue-900">{monthlyStats.presentDays}</p>
                    <p className="text-sm text-blue-600">Days Present</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-green-900">{monthlyStats.totalHours}</p>
                    <p className="text-sm text-green-600">Total Hours</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-purple-900">{monthlyStats.attendanceRate}%</p>
                    <p className="text-sm text-purple-600">Attendance Rate</p>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-orange-900">
                      {leaveRecords.filter((l) => l.status === "approved").length}
                    </p>
                    <p className="text-sm text-orange-600">Approved Leaves</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
