"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bell, ArrowLeft, AlertTriangle, Car, FileText, Calendar } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { withAuth } from "@/lib/with-auth"
import { checkDocumentExpiry, Notification, carStorage } from "@/lib/storage"

function NotificationsPage() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      // Generate notifications for document expiries
      const expiryNotifications = checkDocumentExpiry(user.id)
      setNotifications(expiryNotifications)
      setLoading(false)
    }
  }, [user])

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "expiry":
        return <AlertTriangle className="h-5 w-5 text-orange-600" />
      case "info":
        return <Bell className="h-5 w-5 text-blue-600" />
      default:
        return <Bell className="h-5 w-5" />
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "expiry":
        return "bg-orange-100 text-orange-800"
      case "info":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getDaysUntilExpiry = (expiryDate: string) => {
    const today = new Date()
    const expiry = new Date(expiryDate)
    const diffTime = expiry.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getCarName = (carId?: string) => {
    if (!carId) return 'Unknown Car'
    const car = carStorage.getCarById(carId)
    return car?.carName || 'Unknown Car'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading notifications...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Bell className="h-6 w-6 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">Notifications</span>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">All Notifications</h1>
            <p className="text-gray-600">Stay updated on document expiries and important reminders</p>
          </div>

          {notifications.length === 0 ? (
            <Card className="text-center py-16">
              <CardContent>
                <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No notifications</h3>
                <p className="text-gray-600 mb-6">
                  You're all caught up! We'll notify you when documents are about to expire.
                </p>
                <Link href="/dashboard">
                  <Button>
                    <Car className="h-4 w-4 mr-2" />
                    Back to Dashboard
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm text-gray-600">
                  {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
                </p>
              </div>

              {notifications.map((notification) => (
                <Card key={notification.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-lg text-gray-900">
                            {notification.title}
                          </h3>
                          <Badge className={getNotificationColor(notification.type)}>
                            {notification.type === 'expiry' ? 'Expiry Alert' : 'Info'}
                          </Badge>
                        </div>
                        
                        <p className="text-gray-700 mb-3">{notification.message}</p>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(notification.createdAt).toLocaleDateString()}</span>
                          </div>
                          
                          {notification.carId && (
                            <div className="flex items-center gap-1">
                              <Car className="h-4 w-4" />
                              <span>{getCarName(notification.carId)}</span>
                            </div>
                          )}
                          
                          {notification.expiryDate && (
                            <div className="flex items-center gap-1">
                              <FileText className="h-4 w-4" />
                              <span>
                                Expires: {notification.expiryDate}
                                {getDaysUntilExpiry(notification.expiryDate) > 0 && (
                                  <span className="ml-1 text-orange-600">
                                    ({getDaysUntilExpiry(notification.expiryDate)} days left)
                                  </span>
                                )}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        {notification.carId && (
                          <div className="mt-4 flex gap-2">
                            <Link href={`/car/${notification.carId}`}>
                              <Button variant="outline" size="sm">
                                View Car Details
                              </Button>
                            </Link>
                            <Link href={`/car/${notification.carId}/documents`}>
                              <Button variant="outline" size="sm">
                                Manage Documents
                              </Button>
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Urgent notification styling */}
                    {notification.type === 'expiry' && notification.expiryDate && getDaysUntilExpiry(notification.expiryDate) <= 7 && (
                      <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                          <p className="text-sm font-medium text-red-800">
                            {getDaysUntilExpiry(notification.expiryDate) <= 0 
                              ? 'This document has expired' 
                              : 'Urgent: Document expires very soon'
                            }
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Tips Card */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2">Document Reminders</h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• We check expiry dates daily</li>
                    <li>• Notifications appear 30 days before expiry</li>
                    <li>• Urgent alerts for documents expiring within 7 days</li>
                    <li>• Keep your documents updated for accurate reminders</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Stay Compliant</h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• Renew PUC certificates every 6 months</li>
                    <li>• Insurance renewal is mandatory before expiry</li>
                    <li>• Keep digital copies of all documents</li>
                    <li>• Set calendar reminders for important dates</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default withAuth(NotificationsPage)
