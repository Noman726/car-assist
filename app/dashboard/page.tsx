"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Car, Plus, Bell, MapPin, AlertTriangle, FileText } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function DashboardPage() {
  const [cars] = useState([
    {
      id: 1,
      name: "Dad's City",
      registrationNumber: "MH 12 DE 4567",
      model: "2019",
      pucExpiry: "2024-08-15",
      insuranceExpiry: "2024-12-03",
      fines: 1,
      status: "warning",
    },
    {
      id: 2,
      name: "Swift",
      registrationNumber: "MH 01 FG 8901",
      model: "2021",
      pucExpiry: "2024-07-28",
      insuranceExpiry: "2025-01-15",
      fines: 0,
      status: "active",
    },
    {
      id: 3,
      name: "Office Innova",
      registrationNumber: "MH 05 HI 2345",
      model: "2018",
      pucExpiry: "2024-07-20",
      insuranceExpiry: "2024-09-30",
      fines: 3,
      status: "danger",
    },
  ])

  const [alerts] = useState([
    {
      id: 1,
      type: "danger",
      title: "PUC expires in 9 days!",
      message: "Swift's PUC is due soon. Book appointment now?",
      date: "Today",
    },
    {
      id: 2,
      type: "warning",
      title: "New challan detected",
      message: "₹500 fine for Dad's City - overspeeding on Eastern Express",
      date: "2 days ago",
    },
    {
      id: 3,
      type: "danger",
      title: "Multiple fines pending",
      message: "Office Innova has 3 unpaid challans totaling ₹1,200",
      date: "1 week ago",
    },
    {
      id: 4,
      type: "info",
      title: "Insurance renewal reminder",
      message: "Office Innova insurance expires in 2 months",
      date: "1 week ago",
    },
  ])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "warning":
        return "bg-yellow-100 text-yellow-800"
      case "danger":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case "danger":
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      case "info":
        return <Bell className="h-4 w-4 text-blue-600" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Car className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">CarAssist</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/mechanic-locator">
              <Button variant="outline" size="sm">
                <MapPin className="h-4 w-4 mr-2" />
                Find Mechanic
              </Button>
            </Link>
            <Link href="/profile">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                U
              </div>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Hey there! 👋</h1>
          <p className="text-gray-600">Here's what's up with your rides</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Cars</p>
                  <p className="text-2xl font-bold text-gray-900">{cars.length}</p>
                </div>
                <Car className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Alerts</p>
                  <p className="text-2xl font-bold text-red-600">{alerts.length}</p>
                </div>
                <Bell className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Fines</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {cars.reduce((total, car) => total + car.fines, 0)}
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Documents</p>
                  <p className="text-2xl font-bold text-green-600">{cars.length * 4}</p>
                </div>
                <FileText className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* My Cars Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">My Cars</h2>
              <Link href="/add-car">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Car
                </Button>
              </Link>
            </div>

            <div className="space-y-4">
              {cars.map((car) => (
                <Card key={car.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Car className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{car.name}</h3>
                          <p className="text-gray-600">{car.registrationNumber}</p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(car.status)}>{car.status}</Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Model Year</p>
                        <p className="font-medium">{car.model}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">PUC Expiry</p>
                        <p className="font-medium">{car.pucExpiry}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Insurance</p>
                        <p className="font-medium">{car.insuranceExpiry}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Fines</p>
                        <p className={`font-medium ${car.fines > 0 ? "text-red-600" : "text-green-600"}`}>
                          {car.fines > 0 ? `${car.fines} pending` : "None"}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4">
                      <Link href={`/car/${car.id}`}>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </Link>
                      <Link href={`/car/${car.id}/edit`}>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Alerts Section */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Alerts</h2>
            <div className="space-y-4">
              {alerts.map((alert) => (
                <Card key={alert.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      {getAlertIcon(alert.type)}
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{alert.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                        <p className="text-xs text-gray-500 mt-2">{alert.date}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Link href="/alerts">
              <Button variant="outline" className="w-full mt-4 bg-transparent">
                View All Alerts
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
