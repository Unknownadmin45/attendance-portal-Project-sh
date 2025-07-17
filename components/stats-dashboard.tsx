"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, UserCheck, UserX, Clock, Calendar, TrendingUp } from "lucide-react"

interface StatsDashboardProps {
  stats: {
    totalEmployees: number
    presentToday: number
    absentToday: number
    avgWorkingHours: number
    monthlyAttendance: number
    pendingLeaves: number
  }
  isAdmin?: boolean
}

export function StatsDashboard({ stats, isAdmin = false }: StatsDashboardProps) {
  const attendanceRate = stats.totalEmployees > 0 ? Math.round((stats.presentToday / stats.totalEmployees) * 100) : 0

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
      {isAdmin && (
        <Card className="stats-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEmployees}</div>
            <p className="text-xs text-muted-foreground">Active employees</p>
          </CardContent>
        </Card>
      )}

      <Card className="stats-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Present Today</CardTitle>
          <UserCheck className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{stats.presentToday}</div>
          <p className="text-xs text-muted-foreground">{isAdmin ? "Employees checked in" : "You are present"}</p>
        </CardContent>
      </Card>

      {isAdmin && (
        <Card className="stats-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Absent Today</CardTitle>
            <UserX className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.absentToday}</div>
            <p className="text-xs text-muted-foreground">Not checked in</p>
          </CardContent>
        </Card>
      )}

      <Card className="stats-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg. Hours</CardTitle>
          <Clock className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">{stats.avgWorkingHours}</div>
          <p className="text-xs text-muted-foreground">Daily average</p>
        </CardContent>
      </Card>

      <Card className="stats-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">This Month</CardTitle>
          <Calendar className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-600">{stats.monthlyAttendance}</div>
          <p className="text-xs text-muted-foreground">Days present</p>
        </CardContent>
      </Card>

      <Card className="stats-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
          <TrendingUp className="h-4 w-4 text-orange-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">{attendanceRate}%</div>
          <p className="text-xs text-muted-foreground">{isAdmin ? "Overall rate" : "Your rate"}</p>
        </CardContent>
      </Card>
    </div>
  )
}
