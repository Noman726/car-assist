"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Car, ArrowLeft, FileText, Calendar, AlertTriangle, Edit } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { withAuth } from "@/lib/with-auth"
import { carStorage, documentStorage, Car as CarType, Document } from "@/lib/storage"
import { firebaseCarStorage, firebaseDocumentStorage } from "@/lib/firebase-storage"

function CarDetailsPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const router = useRouter()
  const [car, setCar] = useState<CarType | null>(null)
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadCarData = async () => {
      if (user && id) {
        try {
          const carData = await firebaseCarStorage.getCarById(id as string)
          if (carData && carData.userId === user.id) {
            setCar(carData)
            const carDocs = await firebaseDocumentStorage.getDocumentsByCarId(id as string)
            setDocuments(carDocs)
          } else {
            // Fallback to localStorage if Firebase fails or car not found
            const localCarData = carStorage.getCarById(id as string)
            if (localCarData && localCarData.userId === user.id) {
              setCar(localCarData)
              const localCarDocs = documentStorage.getDocumentsByCarId(id as string)
              setDocuments(localCarDocs)
            } else {
              router.push('/dashboard')
            }
          }
        } catch (error) {
          console.error("Error loading car data:", error)
          // Fallback to localStorage
          const localCarData = carStorage.getCarById(id as string)
          if (localCarData && localCarData.userId === user.id) {
            setCar(localCarData)
            const localCarDocs = documentStorage.getDocumentsByCarId(id as string)
            setDocuments(localCarDocs)
          } else {
            router.push('/dashboard')
          }
        }
        setLoading(false)
      }
    }
    
    loadCarData()
  }, [user, id, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!car) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Car className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Car not found</h1>
          <Link href="/dashboard">
            <Button>Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    )
  }

  const getStatusColor = () => {
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

  const getStatusText = () => {
    const today = new Date()
    const pucDate = car.pucExpiry ? new Date(car.pucExpiry) : null
    const insuranceDate = car.insuranceExpiry ? new Date(car.insuranceExpiry) : null
    const thirtyDaysFromNow = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000))

    if ((pucDate && pucDate <= today) || (insuranceDate && insuranceDate <= today)) {
      return "Document Expired"
    } else if ((pucDate && pucDate <= thirtyDaysFromNow) || (insuranceDate && insuranceDate <= thirtyDaysFromNow)) {
      return "Expiring Soon"
    }
    return "Active"
  }

  const getDaysUntilExpiry = (expiryDate: string) => {
    const today = new Date()
    const expiry = new Date(expiryDate)
    const diffTime = expiry.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
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
            <Car className="h-6 w-6 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">{car.carName}</span>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Car Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Car className="h-5 w-5" />
                  Vehicle Information
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor()}>{getStatusText()}</Badge>
                  <Link href={`/car/${car.id}/edit`}>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Registration Number</p>
                      <p className="text-lg font-semibold">{car.registrationNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Make & Model</p>
                      <p className="font-medium">{car.make} {car.model}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Year</p>
                      <p className="font-medium">{car.year}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Color</p>
                      <p className="font-medium">{car.color || 'Not specified'}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Chassis Number</p>
                      <p className="font-medium font-mono text-sm">{car.chassisNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Engine Number</p>
                      <p className="font-medium font-mono text-sm">{car.engineNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Fuel Type</p>
                      <p className="font-medium">{car.fuelType}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Insurance Provider</p>
                      <p className="font-medium">{car.insuranceProvider || 'Not specified'}</p>
                    </div>
                  </div>
                </div>
                {car.notes && (
                  <div className="mt-6 pt-6 border-t">
                    <p className="text-sm font-medium text-gray-600 mb-2">Notes</p>
                    <p className="text-gray-700">{car.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Documents Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Documents
                </CardTitle>
                <Link href={`/car/${car.id}/documents`}>
                  <Button size="sm">
                    Manage Documents
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {documents.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-600 mb-2">No documents uploaded yet</p>
                    <Link href={`/car/${car.id}/documents`}>
                      <Button variant="outline" size="sm">
                        Upload Documents
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {documents.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-blue-600" />
                          <div>
                            <p className="font-medium">{doc.name}</p>
                            <p className="text-sm text-gray-600">{doc.type.toUpperCase()}</p>
                          </div>
                        </div>
                        {doc.expiryDate && (
                          <div className="text-right">
                            <p className="text-sm font-medium">
                              {getDaysUntilExpiry(doc.expiryDate) > 0 
                                ? `${getDaysUntilExpiry(doc.expiryDate)} days left`
                                : 'Expired'
                              }
                            </p>
                            <p className="text-xs text-gray-500">{doc.expiryDate}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Compliance Status */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Compliance Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* PUC Status */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">PUC Certificate</h4>
                    {car.pucExpiry && getDaysUntilExpiry(car.pucExpiry) <= 30 && (
                      <AlertTriangle className="h-4 w-4 text-orange-500" />
                    )}
                  </div>
                  {car.pucExpiry ? (
                    <div>
                      <p className="text-sm text-gray-600">Expires: {car.pucExpiry}</p>
                      <p className={`text-sm font-medium ${
                        getDaysUntilExpiry(car.pucExpiry) <= 0 
                          ? 'text-red-600' 
                          : getDaysUntilExpiry(car.pucExpiry) <= 30 
                          ? 'text-orange-600' 
                          : 'text-green-600'
                      }`}>
                        {getDaysUntilExpiry(car.pucExpiry) <= 0 
                          ? 'Expired' 
                          : getDaysUntilExpiry(car.pucExpiry) <= 30 
                          ? `${getDaysUntilExpiry(car.pucExpiry)} days left`
                          : 'Valid'
                        }
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No expiry date set</p>
                  )}
                </div>

                {/* Insurance Status */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Insurance</h4>
                    {car.insuranceExpiry && getDaysUntilExpiry(car.insuranceExpiry) <= 30 && (
                      <AlertTriangle className="h-4 w-4 text-orange-500" />
                    )}
                  </div>
                  {car.insuranceExpiry ? (
                    <div>
                      <p className="text-sm text-gray-600">Expires: {car.insuranceExpiry}</p>
                      <p className={`text-sm font-medium ${
                        getDaysUntilExpiry(car.insuranceExpiry) <= 0 
                          ? 'text-red-600' 
                          : getDaysUntilExpiry(car.insuranceExpiry) <= 30 
                          ? 'text-orange-600' 
                          : 'text-green-600'
                      }`}>
                        {getDaysUntilExpiry(car.insuranceExpiry) <= 0 
                          ? 'Expired' 
                          : getDaysUntilExpiry(car.insuranceExpiry) <= 30 
                          ? `${getDaysUntilExpiry(car.insuranceExpiry)} days left`
                          : 'Valid'
                        }
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No expiry date set</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href={`/car/${car.id}/documents`}>
                  <Button variant="outline" className="w-full">
                    <FileText className="h-4 w-4 mr-2" />
                    Manage Documents
                  </Button>
                </Link>
                <Link href={`/car/${car.id}/edit`}>
                  <Button variant="outline" className="w-full">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Car Details
                  </Button>
                </Link>
                <Link href="/mechanic-locator">
                  <Button variant="outline" className="w-full">
                    <Car className="h-4 w-4 mr-2" />
                    Find Mechanic
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default withAuth(CarDetailsPage)
