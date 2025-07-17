"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Users,
  UserCheck,
  UserX,
  AlertCircle,
  LogOut,
  Settings,
  FileText,
  Plus,
  Search,
  Filter,
  Download,
  Edit,
  Trash2,
  Calendar,
  Clock,
  TrendingUp,
  Building2,
  Mail,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { WhatsAppBotPanel } from "@/components/whatsapp-bot-panel"
import { exportToCSV, formatDate, formatTime, calculateAttendanceRate } from "@/lib/utils"
import { User } from "lucide-react" // Import User component

interface AdminUser {
  id: string
  employeeId: string
  firstName: string
  lastName: string
  email: string
  role: string
  department: string
  designation: string
  status: string
  phone: string
  joiningDate: string
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
  approvedBy?: string
  totalDays: number
}

export default function AdminDashboard() {
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null)
  const [employees, setEmployees] = useState<AdminUser[]>([])
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [leaveRecords, setLeaveRecords] = useState<LeaveRecord[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterDepartment, setFilterDepartment] = useState("all")
  const [selectedEmployee, setSelectedEmployee] = useState<AdminUser | null>(null)
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false)
  const [isEditEmployeeOpen, setIsEditEmployeeOpen] = useState(false)
  const [stats, setStats] = useState({
    totalEmployees: 0,
    presentToday: 0,
    absentToday: 0,
    pendingLeaves: 0,
    avgWorkingHours: 0,
    monthlyAttendance: 0,
  })

  const [newEmployee, setNewEmployee] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    department: "",
    designation: "",
    salary: "",
    reportingManager: "",
  })

  const router = useRouter()

  const departments = ["IT", "HR", "Engineering", "Finance", "Marketing", "Sales", "Operations"]

  useEffect(() => {
    const user = localStorage.getItem("currentUser")
    if (!user) {
      router.push("/")
      return
    }

    const userData = JSON.parse(user)
    if (userData.role !== "admin") {
      router.push("/employee/dashboard")
      return
    }

    setCurrentUser(userData)
    loadData()
  }, [router])

  const loadData = () => {
    const users = JSON.parse(localStorage.getItem("users") || "[]")
    const attendance = JSON.parse(localStorage.getItem("attendance") || "[]")
    const leaves = JSON.parse(localStorage.getItem("leaves") || "[]")

    const activeEmployees = users.filter((u: AdminUser) => u.status === "active")
    setEmployees(activeEmployees)
    setAttendanceRecords(attendance)
    setLeaveRecords(leaves)

    // Calculate stats
    const today = new Date().toISOString().split("T")[0]
    const todayAttendance = attendance.filter((a: AttendanceRecord) => a.date === today)
    const pendingLeaves = leaves.filter((l: LeaveRecord) => l.status === "pending")

    // Calculate average working hours
    const recentAttendance = attendance.filter((a: AttendanceRecord) => a.totalHours).slice(-30)
    const avgHours =
      recentAttendance.length > 0
        ? recentAttendance.reduce((sum: number, a: AttendanceRecord) => sum + (a.totalHours || 0), 0) /
          recentAttendance.length
        : 0

    setStats({
      totalEmployees: activeEmployees.length,
      presentToday: todayAttendance.filter((a: AttendanceRecord) => a.status === "present").length,
      absentToday: activeEmployees.length - todayAttendance.length,
      pendingLeaves: pendingLeaves.length,
      avgWorkingHours: Math.round(avgHours * 10) / 10,
      monthlyAttendance: todayAttendance.length,
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

  const handleAddEmployee = () => {
    if (!newEmployee.firstName || !newEmployee.lastName || !newEmployee.email) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    const users = JSON.parse(localStorage.getItem("users") || "[]")

    // Check if email already exists
    if (users.find((u: AdminUser) => u.email === newEmployee.email)) {
      toast({
        title: "Email Already Exists",
        description: "An employee with this email already exists",
        variant: "destructive",
      })
      return
    }

    const employeeId = `EMP${String(users.length + 1).padStart(3, "0")}`

    const employee: AdminUser = {
      id: Date.now().toString(),
      employeeId,
      firstName: newEmployee.firstName,
      lastName: newEmployee.lastName,
      email: newEmployee.email,
      phone: newEmployee.phone,
      role: "employee",
      department: newEmployee.department,
      designation: newEmployee.designation,
      status: "active",
      joiningDate: new Date().toISOString().split("T")[0],
      reportingManager: newEmployee.reportingManager,
      salary: Number(newEmployee.salary) || 0,
    }

    users.push(employee)
    localStorage.setItem("users", JSON.stringify(users))

    setNewEmployee({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      department: "",
      designation: "",
      salary: "",
      reportingManager: "",
    })

    setIsAddEmployeeOpen(false)
    loadData()

    toast({
      title: "Employee Added",
      description: `${employee.firstName} ${employee.lastName} has been added successfully`,
    })
  }

  const handleEditEmployee = () => {
    if (!selectedEmployee) return

    const users = JSON.parse(localStorage.getItem("users") || "[]")
    const userIndex = users.findIndex((u: AdminUser) => u.id === selectedEmployee.id)

    if (userIndex !== -1) {
      users[userIndex] = selectedEmployee
      localStorage.setItem("users", JSON.stringify(users))

      setIsEditEmployeeOpen(false)
      setSelectedEmployee(null)
      loadData()

      toast({
        title: "Employee Updated",
        description: "Employee information has been updated successfully",
      })
    }
  }

  const handleDeleteEmployee = (employeeId: string) => {
    const users = JSON.parse(localStorage.getItem("users") || "[]")
    const updatedUsers = users.map((u: AdminUser) => (u.id === employeeId ? { ...u, status: "inactive" } : u))

    localStorage.setItem("users", JSON.stringify(updatedUsers))
    loadData()

    toast({
      title: "Employee Deactivated",
      description: "Employee has been deactivated successfully",
    })
  }

  const handleApproveLeave = (leaveId: string) => {
    const leaves = JSON.parse(localStorage.getItem("leaves") || "[]")
    const updatedLeaves = leaves.map((l: LeaveRecord) =>
      l.id === leaveId
        ? { ...l, status: "approved", approvedBy: currentUser?.firstName + " " + currentUser?.lastName }
        : l,
    )

    localStorage.setItem("leaves", JSON.stringify(updatedLeaves))
    loadData()

    toast({
      title: "Leave Approved",
      description: "Leave request has been approved",
    })
  }

  const handleRejectLeave = (leaveId: string) => {
    const leaves = JSON.parse(localStorage.getItem("leaves") || "[]")
    const updatedLeaves = leaves.map((l: LeaveRecord) =>
      l.id === leaveId
        ? { ...l, status: "rejected", approvedBy: currentUser?.firstName + " " + currentUser?.lastName }
        : l,
    )

    localStorage.setItem("leaves", JSON.stringify(updatedLeaves))
    loadData()

    toast({
      title: "Leave Rejected",
      description: "Leave request has been rejected",
    })
  }

  const exportAttendanceReport = () => {
    const reportData = attendanceRecords.map((record) => {
      const employee = employees.find((emp) => emp.id === record.userId)
      return {
        Date: formatDate(record.date),
        Employee: employee ? `${employee.firstName} ${employee.lastName}` : "Unknown",
        EmployeeID: employee?.employeeId || "N/A",
        Department: employee?.department || "N/A",
        CheckIn: formatTime(record.checkIn),
        CheckOut: record.checkOut ? formatTime(record.checkOut) : "Not checked out",
        TotalHours: record.totalHours || 0,
        Status: record.status,
        Notes: record.notes || "",
      }
    })

    exportToCSV(reportData, `attendance-report-${new Date().toISOString().split("T")[0]}`)

    toast({
      title: "Report Exported",
      description: "Attendance report has been exported successfully",
    })
  }

  const exportEmployeeReport = () => {
    const reportData = employees.map((employee) => ({
      EmployeeID: employee.employeeId,
      Name: `${employee.firstName} ${employee.lastName}`,
      Email: employee.email,
      Phone: employee.phone,
      Department: employee.department,
      Designation: employee.designation,
      JoiningDate: formatDate(employee.joiningDate),
      Status: employee.status,
      ReportingManager: employee.reportingManager,
      Salary: employee.salary,
    }))

    exportToCSV(reportData, `employee-report-${new Date().toISOString().split("T")[0]}`)

    toast({
      title: "Report Exported",
      description: "Employee report has been exported successfully",
    })
  }

  const getTodayAttendance = () => {
    const today = new Date().toISOString().split("T")[0]
    return attendanceRecords
      .filter((record) => record.date === today)
      .map((record) => {
        const employee = employees.find((emp) => emp.id === record.userId)
        return {
          ...record,
          employeeName: employee ? `${employee.firstName} ${employee.lastName}` : "Unknown",
          employeeId: employee?.employeeId || "N/A",
          department: employee?.department || "N/A",
        }
      })
  }

  const getFilteredEmployees = () => {
    return employees.filter((employee) => {
      const matchesSearch =
        searchTerm === "" ||
        employee.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.employeeId.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesDepartment = filterDepartment === "all" || employee.department === filterDepartment

      return matchesSearch && matchesDepartment
    })
  }

  const getPendingLeaves = () => {
    return leaveRecords
      .filter((leave) => leave.status === "pending")
      .map((leave) => {
        const employee = employees.find((emp) => emp.id === leave.userId)
        return {
          ...leave,
          employeeName: employee ? `${employee.firstName} ${employee.lastName}` : "Unknown",
          employeeId: employee?.employeeId || "N/A",
        }
      })
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Enhanced Header */}
      <header className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                  <p className="text-sm text-gray-600">Welcome back, {currentUser.firstName}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2 bg-green-50 px-3 py-2 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-700">System Online</span>
              </div>
              <Button variant="outline" size="sm" className="hidden md:flex bg-transparent">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          <Card className="stats-card bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-700">Total Employees</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">{stats.totalEmployees}</div>
              <p className="text-xs text-blue-600">Active employees</p>
            </CardContent>
          </Card>

          <Card className="stats-card bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-700">Present Today</CardTitle>
              <UserCheck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900">{stats.presentToday}</div>
              <p className="text-xs text-green-600">Checked in today</p>
            </CardContent>
          </Card>

          <Card className="stats-card bg-gradient-to-br from-red-50 to-red-100 border-red-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-red-700">Absent Today</CardTitle>
              <UserX className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-900">{stats.absentToday}</div>
              <p className="text-xs text-red-600">Not checked in</p>
            </CardContent>
          </Card>

          <Card className="stats-card bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-yellow-700">Pending Leaves</CardTitle>
              <AlertCircle className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-900">{stats.pendingLeaves}</div>
              <p className="text-xs text-yellow-600">Awaiting approval</p>
            </CardContent>
          </Card>

          <Card className="stats-card bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-700">Avg. Hours</CardTitle>
              <Clock className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-900">{stats.avgWorkingHours}</div>
              <p className="text-xs text-purple-600">Daily average</p>
            </CardContent>
          </Card>

          <Card className="stats-card bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-indigo-700">Attendance Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-indigo-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-indigo-900">
                {calculateAttendanceRate(stats.presentToday, stats.totalEmployees)}%
              </div>
              <p className="text-xs text-indigo-600">Overall rate</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="attendance" className="space-y-6">
          <TabsList className="bg-white shadow-sm border">
            <TabsTrigger
              value="attendance"
              className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
            >
              Today's Attendance
            </TabsTrigger>
            <TabsTrigger value="employees" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
              Employee Management
            </TabsTrigger>
            <TabsTrigger value="reports" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
              Reports
            </TabsTrigger>
            <TabsTrigger value="leaves" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
              Leave Management
            </TabsTrigger>
            <TabsTrigger value="whatsapp" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
              WhatsApp Bot
            </TabsTrigger>
          </TabsList>

          <TabsContent value="attendance" className="space-y-6">
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  Today's Attendance Overview
                </CardTitle>
                <CardDescription>
                  Real-time attendance tracking for {formatDate(new Date().toISOString())}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {getTodayAttendance().length === 0 ? (
                    <div className="text-center py-12">
                      <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg">No attendance records for today</p>
                      <p className="text-gray-400 text-sm">Records will appear as employees check in</p>
                    </div>
                  ) : (
                    getTodayAttendance().map((record) => (
                      <div
                        key={record.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{record.employeeName}</p>
                            <p className="text-sm text-gray-600">
                              {record.employeeId} • {record.department}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className="text-sm font-medium">Check-in: {formatTime(record.checkIn)}</p>
                            {record.checkOut && (
                              <p className="text-sm text-gray-600">Check-out: {formatTime(record.checkOut)}</p>
                            )}
                            {record.totalHours && <p className="text-sm text-blue-600">Hours: {record.totalHours}</p>}
                          </div>
                          <Badge
                            variant={record.status === "present" ? "default" : "destructive"}
                            className={record.status === "present" ? "bg-green-100 text-green-800" : ""}
                          >
                            {record.status}
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="employees" className="space-y-6">
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 border-b">
                <div className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-green-600" />
                      Employee Directory
                    </CardTitle>
                    <CardDescription>Manage employee profiles and information</CardDescription>
                  </div>
                  <Dialog open={isAddEmployeeOpen} onOpenChange={setIsAddEmployeeOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Employee
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Add New Employee</DialogTitle>
                        <DialogDescription>Enter the employee details to add them to the system</DialogDescription>
                      </DialogHeader>
                      <div className="grid grid-cols-2 gap-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">First Name *</Label>
                          <Input
                            id="firstName"
                            value={newEmployee.firstName}
                            onChange={(e) => setNewEmployee({ ...newEmployee, firstName: e.target.value })}
                            placeholder="Enter first name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Last Name *</Label>
                          <Input
                            id="lastName"
                            value={newEmployee.lastName}
                            onChange={(e) => setNewEmployee({ ...newEmployee, lastName: e.target.value })}
                            placeholder="Enter last name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email *</Label>
                          <Input
                            id="email"
                            type="email"
                            value={newEmployee.email}
                            onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                            placeholder="Enter email address"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone</Label>
                          <Input
                            id="phone"
                            value={newEmployee.phone}
                            onChange={(e) => setNewEmployee({ ...newEmployee, phone: e.target.value })}
                            placeholder="Enter phone number"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="department">Department</Label>
                          <Select
                            value={newEmployee.department}
                            onValueChange={(value) => setNewEmployee({ ...newEmployee, department: value })}
                          >
                            <SelectTrigger>
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
                          <Label htmlFor="designation">Designation</Label>
                          <Input
                            id="designation"
                            value={newEmployee.designation}
                            onChange={(e) => setNewEmployee({ ...newEmployee, designation: e.target.value })}
                            placeholder="Enter job title"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="salary">Salary</Label>
                          <Input
                            id="salary"
                            type="number"
                            value={newEmployee.salary}
                            onChange={(e) => setNewEmployee({ ...newEmployee, salary: e.target.value })}
                            placeholder="Enter salary"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="reportingManager">Reporting Manager</Label>
                          <Input
                            id="reportingManager"
                            value={newEmployee.reportingManager}
                            onChange={(e) => setNewEmployee({ ...newEmployee, reportingManager: e.target.value })}
                            placeholder="Enter reporting manager"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setIsAddEmployeeOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleAddEmployee}>Add Employee</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {/* Search and Filter */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search employees..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                    <SelectTrigger className="w-full md:w-48">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Filter by department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      {departments.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button variant="outline" onClick={exportEmployeeReport}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>

                {/* Employee List */}
                <div className="space-y-4">
                  {getFilteredEmployees().map((employee) => (
                    <div
                      key={employee.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium">
                            {employee.firstName[0]}
                            {employee.lastName[0]}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {employee.firstName} {employee.lastName}
                          </p>
                          <p className="text-sm text-gray-600">
                            {employee.employeeId} • {employee.designation}
                          </p>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="text-sm text-gray-500 flex items-center">
                              <Mail className="h-3 w-3 mr-1" />
                              {employee.email}
                            </span>
                            <span className="text-sm text-gray-500 flex items-center">
                              <Building2 className="h-3 w-3 mr-1" />
                              {employee.department}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={employee.status === "active" ? "default" : "secondary"}>
                          {employee.status}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedEmployee(employee)
                            setIsEditEmployeeOpen(true)
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDeleteEmployee(employee.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Edit Employee Dialog */}
            <Dialog open={isEditEmployeeOpen} onOpenChange={setIsEditEmployeeOpen}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Edit Employee</DialogTitle>
                  <DialogDescription>Update employee information</DialogDescription>
                </DialogHeader>
                {selectedEmployee && (
                  <div className="grid grid-cols-2 gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="editFirstName">First Name</Label>
                      <Input
                        id="editFirstName"
                        value={selectedEmployee.firstName}
                        onChange={(e) => setSelectedEmployee({ ...selectedEmployee, firstName: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="editLastName">Last Name</Label>
                      <Input
                        id="editLastName"
                        value={selectedEmployee.lastName}
                        onChange={(e) => setSelectedEmployee({ ...selectedEmployee, lastName: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="editEmail">Email</Label>
                      <Input
                        id="editEmail"
                        type="email"
                        value={selectedEmployee.email}
                        onChange={(e) => setSelectedEmployee({ ...selectedEmployee, email: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="editPhone">Phone</Label>
                      <Input
                        id="editPhone"
                        value={selectedEmployee.phone}
                        onChange={(e) => setSelectedEmployee({ ...selectedEmployee, phone: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="editDepartment">Department</Label>
                      <Select
                        value={selectedEmployee.department}
                        onValueChange={(value) => setSelectedEmployee({ ...selectedEmployee, department: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
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
                      <Label htmlFor="editDesignation">Designation</Label>
                      <Input
                        id="editDesignation"
                        value={selectedEmployee.designation}
                        onChange={(e) => setSelectedEmployee({ ...selectedEmployee, designation: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="editSalary">Salary</Label>
                      <Input
                        id="editSalary"
                        type="number"
                        value={selectedEmployee.salary}
                        onChange={(e) => setSelectedEmployee({ ...selectedEmployee, salary: Number(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="editReportingManager">Reporting Manager</Label>
                      <Input
                        id="editReportingManager"
                        value={selectedEmployee.reportingManager}
                        onChange={(e) => setSelectedEmployee({ ...selectedEmployee, reportingManager: e.target.value })}
                      />
                    </div>
                  </div>
                )}
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsEditEmployeeOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleEditEmployee}>Update Employee</Button>
                </div>
              </DialogContent>
            </Dialog>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-purple-600" />
                  Attendance Reports
                </CardTitle>
                <CardDescription>Generate and download comprehensive reports</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 border-dashed border-gray-200 hover:border-blue-400">
                    <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                        <FileText className="h-8 w-8 text-blue-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">Daily Report</h3>
                      <p className="text-sm text-gray-600 mb-4">Today's attendance summary</p>
                      <Button onClick={exportAttendanceReport} className="w-full">
                        <Download className="h-4 w-4 mr-2" />
                        Generate Report
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 border-dashed border-gray-200 hover:border-green-400">
                    <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
                        <Calendar className="h-8 w-8 text-green-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">Monthly Report</h3>
                      <p className="text-sm text-gray-600 mb-4">Complete monthly analysis</p>
                      <Button onClick={exportAttendanceReport} className="w-full">
                        <Download className="h-4 w-4 mr-2" />
                        Generate Report
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 border-dashed border-gray-200 hover:border-purple-400">
                    <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                      <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
                        <TrendingUp className="h-8 w-8 text-purple-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">Annual Report</h3>
                      <p className="text-sm text-gray-600 mb-4">Yearly performance metrics</p>
                      <Button onClick={exportAttendanceReport} className="w-full">
                        <Download className="h-4 w-4 mr-2" />
                        Generate Report
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leaves" className="space-y-6">
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 border-b">
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-orange-600" />
                  Leave Management
                </CardTitle>
                <CardDescription>Review and approve leave requests</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {getPendingLeaves().length === 0 ? (
                    <div className="text-center py-12">
                      <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg">No pending leave requests</p>
                      <p className="text-gray-400 text-sm">All leave requests have been processed</p>
                    </div>
                  ) : (
                    getPendingLeaves().map((leave) => (
                      <div
                        key={leave.id}
                        className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                            <Calendar className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{leave.employeeName}</p>
                            <p className="text-sm text-gray-600">{leave.employeeId}</p>
                            <p className="text-sm text-gray-700 mt-1">
                              <strong>Dates:</strong> {formatDate(leave.fromDate)} to {formatDate(leave.toDate)}
                            </p>
                            <p className="text-sm text-gray-700">
                              <strong>Reason:</strong> {leave.reason}
                            </p>
                            <p className="text-sm text-gray-500">
                              Applied: {formatDate(leave.appliedDate)} • {leave.totalDays} days
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            onClick={() => handleApproveLeave(leave.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Approve
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleRejectLeave(leave.id)}>
                            Reject
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="whatsapp" className="space-y-6">
            <WhatsAppBotPanel />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
