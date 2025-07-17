"use client"

import { useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface AttendanceRecord {
  id: string
  userId: string
  date: string
  checkIn: string
  checkOut?: string
  status: string
  totalHours?: number
}

interface AttendanceCalendarProps {
  attendanceRecords: AttendanceRecord[]
  userId: string
}

export function AttendanceCalendar({ attendanceRecords, userId }: AttendanceCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())

  const getAttendanceForDate = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0]
    return attendanceRecords.find((record) => record.userId === userId && record.date === dateStr)
  }

  const getAttendanceStatus = (date: Date) => {
    const record = getAttendanceForDate(date)
    return record?.status || "absent"
  }

  const selectedDateRecord = selectedDate ? getAttendanceForDate(selectedDate) : null

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Attendance Calendar</CardTitle>
          <CardDescription>Click on any date to view attendance details</CardDescription>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-md border"
            modifiers={{
              present: (date) => getAttendanceStatus(date) === "present",
              absent: (date) => {
                const today = new Date()
                return date < today && getAttendanceStatus(date) === "absent"
              },
              late: (date) => getAttendanceStatus(date) === "late",
            }}
            modifiersStyles={{
              present: { backgroundColor: "#22c55e", color: "white" },
              absent: { backgroundColor: "#ef4444", color: "white" },
              late: { backgroundColor: "#f59e0b", color: "white" },
            }}
          />
          <div className="mt-4 flex flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-sm">Present</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span className="text-sm">Absent</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 rounded"></div>
              <span className="text-sm">Late</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{selectedDate ? selectedDate.toLocaleDateString() : "Select a Date"}</CardTitle>
          <CardDescription>Attendance details for selected date</CardDescription>
        </CardHeader>
        <CardContent>
          {selectedDateRecord ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Status:</span>
                <Badge variant={selectedDateRecord.status === "present" ? "default" : "destructive"}>
                  {selectedDateRecord.status}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Check In:</span>
                <span>{selectedDateRecord.checkIn}</span>
              </div>
              {selectedDateRecord.checkOut && (
                <div className="flex items-center justify-between">
                  <span className="font-medium">Check Out:</span>
                  <span>{selectedDateRecord.checkOut}</span>
                </div>
              )}
              {selectedDateRecord.totalHours && (
                <div className="flex items-center justify-between">
                  <span className="font-medium">Total Hours:</span>
                  <span>{selectedDateRecord.totalHours} hours</span>
                </div>
              )}
              {selectedDateRecord.notes && (
                <div>
                  <span className="font-medium">Notes:</span>
                  <p className="text-sm text-gray-600 mt-1">{selectedDateRecord.notes}</p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">
              {selectedDate ? "No attendance record for this date" : "Select a date to view details"}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
