"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Car, Plus, Bell, MapPin, AlertTriangle, FileText, LogOut } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { withAuth } from "@/lib/with-auth"
import { carStorage, checkDocumentExpiry, Notification } from "@/lib/storage"
import { firebaseCarStorage } from "@/lib/firebase-storage"
import { useRouter } from "next/navigation"

function DashboardPage() {
  const { user, firebaseUser, logout } = useAuth()
  const [cars, setCars] = useState<any[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showWelcome, setShowWelcome] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const loadCars = async () => {
      if (user) {
        try {
          const userCars = await firebaseCarStorage.getCarsByUserId(user.id)
          setCars(userCars)
          const expiryNotifications = checkDocumentExpiry(user.id)
          setNotifications(expiryNotifications)
          
          // Show welcome message for new users (no cars added yet)
          if (userCars.length === 0) {
            setShowWelcome(true)
          }
        } catch (error) {
          console.error("Error loading cars:", error)
          // Fallback to localStorage if Firebase fails
          const userCars = carStorage.getCarsByUserId(user.id)
          setCars(userCars)
        }
      }
    }
    
    loadCars()
  }, [user])

  const getStatusColor = (car: any) => {
    const today = new Date()
    const pucDate = car.pucExpiry ? new Date(car.pucExpiry) : null
    const insuranceDate = car.insuranceExpiry ? new Date(car.insuranceExpiry) : null
    const thirtyDaysFromNow = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000))

    if ((pucDate && pucDate <= today) || (insuranceDate && insuranceDate <= today)) {
      return "bg-red-100 text-red-800"
    } else if ((pucDate && pucDate <= thirtyDaysFromNow) || (insuranceDate && insuranceDate <= thirtyDaysFromNow)) {
      return "bg-yellow-100 text-yellow-800"
    }
    return "bg-green-100 text-green-800"
  }

  const getStatusText = (car: any) => {
    const today = new Date()
    const pucDate = car.pucExpiry ? new Date(car.pucExpiry) : null
    const insuranceDate = car.insuranceExpiry ? new Date(car.insuranceExpiry) : null
    const thirtyDaysFromNow = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000))

    if ((pucDate && pucDate <= today) || (insuranceDate && insuranceDate <= today)) {
      return "expired"
    } else if ((pucDate && pucDate <= thirtyDaysFromNow) || (insuranceDate && insuranceDate <= thirtyDaysFromNow)) {
      return "expiring soon"
    }
    return "active"
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "expiry":
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      case "info":
        return <Bell className="h-4 w-4 text-blue-600" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const handleDeleteCar = async (carId: string, carName: string) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${carName}"? This action cannot be undone and will remove all associated documents and data.`
    )

    if (confirmDelete) {
      try {
        const success = await firebaseCarStorage.deleteCar(carId)
        if (success) {
          // Refresh the cars list
          if (user) {
            const updatedCars = await firebaseCarStorage.getCarsByUserId(user.id)
            setCars(updatedCars)
          }
        } else {
          alert("Failed to delete car")
        }
      } catch (error) {
        alert("Error deleting car")
        console.error(error)
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
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
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
              {user?.fullName?.charAt(0).toUpperCase() || "U"}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Hey {user?.fullName}! 👋</h1>
          <p className="text-gray-600">Here's what's up with your rides</p>
        </div>

        {/* Welcome message for new users */}
        {showWelcome && (
          <Card className="mb-6 border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <Car className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-blue-900">Welcome to CarAssist! 🚗</h3>
                  <p className="text-sm text-blue-700">Get started by adding your first car to keep track of maintenance, documents, and more!</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowWelcome(false)}
                  className="text-blue-700 hover:bg-blue-100"
                >
                  ✕
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
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

            {cars.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Car className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No cars added yet</h3>
                  <p className="text-gray-600 mb-4">Add your first car to get started with CarAssist</p>
                  <Link href="/add-car">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Car
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
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
                            <h3 className="font-semibold text-lg">{car.carName}</h3>
                            <p className="text-gray-600">{car.registrationNumber}</p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(car)}>{getStatusText(car)}</Badge>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Model Year</p>
                          <p className="font-medium">{car.year}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">PUC Expiry</p>
                          <p className="font-medium">{car.pucExpiry || 'Not set'}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Insurance</p>
                          <p className="font-medium">{car.insuranceExpiry || 'Not set'}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Make</p>
                          <p className="font-medium">{car.make} {car.model}</p>
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
                        <Link href={`/car/${car.id}/documents`}>
                          <Button variant="outline" size="sm">
                            Documents
                          </Button>
                        </Link>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleDeleteCar(car.id, car.carName)}
                          className="text-red-600 border-red-200 hover:bg-red-50"
                        >
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Alerts</h2>
            {notifications.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600">No alerts at the moment</p>
                  <p className="text-sm text-gray-500">You'll see notifications about expiring documents here</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {notifications.slice(0, 5).map((notification) => (
                  <Card key={notification.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        {getAlertIcon(notification.type)}
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{notification.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                          <p className="text-xs text-gray-500 mt-2">
                            {new Date(notification.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default withAuth(DashboardPage)
