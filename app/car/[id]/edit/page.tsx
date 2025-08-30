"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Car, ArrowLeft, AlertCircle, Trash2 } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { withAuth } from "@/lib/with-auth"
import { carStorage } from "@/lib/storage"
import { firebaseCarStorage } from "@/lib/firebase-storage"

function EditCarPage() {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [carFound, setCarFound] = useState(true)
  const [formData, setFormData] = useState({
    carName: "",
    registrationNumber: "",
    chassisNumber: "",
    engineNumber: "",
    make: "",
    model: "",
    year: "",
    color: "",
    fuelType: "",
    pucExpiry: "",
    insuranceExpiry: "",
    insuranceProvider: "",
    notes: "",
  })

  useEffect(() => {
    const loadCar = async () => {
      if (params.id && user) {
        try {
          const car = await firebaseCarStorage.getCarById(params.id as string)
          if (car && car.userId === user.id) {
            setFormData({
              carName: car.carName || "",
              registrationNumber: car.registrationNumber || "",
              chassisNumber: car.chassisNumber || "",
              engineNumber: car.engineNumber || "",
              make: car.make || "",
              model: car.model || "",
              year: car.year || "",
              color: car.color || "",
              fuelType: car.fuelType || "",
              pucExpiry: car.pucExpiry || "",
              insuranceExpiry: car.insuranceExpiry || "",
              insuranceProvider: car.insuranceProvider || "",
              notes: car.notes || "",
            })
          } else {
            // Fallback to localStorage
            const localCar = carStorage.getCarById(params.id as string)
            if (localCar && localCar.userId === user.id) {
              setFormData({
                carName: localCar.carName || "",
                registrationNumber: localCar.registrationNumber || "",
                chassisNumber: localCar.chassisNumber || "",
                engineNumber: localCar.engineNumber || "",
                make: localCar.make || "",
                model: localCar.model || "",
                year: localCar.year || "",
                color: localCar.color || "",
                fuelType: localCar.fuelType || "",
                pucExpiry: localCar.pucExpiry || "",
                insuranceExpiry: localCar.insuranceExpiry || "",
                insuranceProvider: localCar.insuranceProvider || "",
                notes: localCar.notes || "",
              })
            } else {
              setCarFound(false)
              setError("Car not found or you don't have permission to edit it")
            }
          }
        } catch (error) {
          console.error("Error loading car:", error)
          setCarFound(false)
          setError("Error loading car data")
        }
      }
    }
    
    loadCar()
  }, [params.id, user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!user) {
      setError("User not authenticated")
      return
    }

    if (!params.id) {
      setError("Car ID not found")
      return
    }

    setIsLoading(true)

    try {
      // Update the car
      const updatedCar = await firebaseCarStorage.updateCar(params.id as string, formData)
      
      if (updatedCar) {
        setSuccess("Car updated successfully!")
        setTimeout(() => {
          router.push("/dashboard")
        }, 1500)
      } else {
        setError("Failed to update car")
      }
    } catch (err) {
      setError("Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!params.id) return

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this car? This action cannot be undone."
    )

    if (confirmDelete) {
      setIsLoading(true)
      try {
        const deleted = await firebaseCarStorage.deleteCar(params.id as string)
        if (deleted) {
          router.push("/dashboard")
        } else {
          setError("Failed to delete car")
        }
      } catch (err) {
        setError("Failed to delete car")
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  if (!carFound) {
    return (
      <div className="min-h-screen bg-gray-50">
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
              <span className="text-xl font-bold text-gray-900">Edit Car</span>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardContent className="p-6 text-center">
                <Car className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Car Not Found</h3>
                <p className="text-gray-600 mb-4">
                  The car you're looking for doesn't exist or you don't have permission to edit it.
                </p>
                <Link href="/dashboard">
                  <Button>Back to Dashboard</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Car className="h-6 w-6 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">Edit Car</span>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            disabled={isLoading}
            className="text-red-600 border-red-200 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Car
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Edit Vehicle Information</CardTitle>
              <CardDescription>Update your vehicle details</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md text-red-800">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">{error}</span>
                  </div>
                )}

                {success && (
                  <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md text-green-800">
                    <span className="text-sm">{success}</span>
                  </div>
                )}

                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="carName">What do you call your car?</Label>
                      <Input
                        id="carName"
                        placeholder="e.g., My Swift, Dad's City, Office car"
                        value={formData.carName}
                        onChange={(e) => handleInputChange("carName", e.target.value)}
                        required
                        disabled={isLoading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="registrationNumber">Number Plate</Label>
                      <Input
                        id="registrationNumber"
                        placeholder="MH 12 AB 1234"
                        value={formData.registrationNumber}
                        onChange={(e) => handleInputChange("registrationNumber", e.target.value)}
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="chassisNumber">Chassis Number</Label>
                      <Input
                        id="chassisNumber"
                        placeholder="Enter chassis number"
                        value={formData.chassisNumber}
                        onChange={(e) => handleInputChange("chassisNumber", e.target.value)}
                        required
                        disabled={isLoading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="engineNumber">Engine Number</Label>
                      <Input
                        id="engineNumber"
                        placeholder="Enter engine number"
                        value={formData.engineNumber}
                        onChange={(e) => handleInputChange("engineNumber", e.target.value)}
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                </div>

                {/* Vehicle Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Vehicle Details</h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="make">Make</Label>
                      <Select onValueChange={(value) => handleInputChange("make", value)} value={formData.make}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select make" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="honda">Honda</SelectItem>
                          <SelectItem value="maruti">Maruti Suzuki</SelectItem>
                          <SelectItem value="hyundai">Hyundai</SelectItem>
                          <SelectItem value="tata">Tata</SelectItem>
                          <SelectItem value="mahindra">Mahindra</SelectItem>
                          <SelectItem value="toyota">Toyota</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="model">Model</Label>
                      <Input
                        id="model"
                        placeholder="e.g., City, Swift"
                        value={formData.model}
                        onChange={(e) => handleInputChange("model", e.target.value)}
                        required
                        disabled={isLoading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="year">Year</Label>
                      <Select onValueChange={(value) => handleInputChange("year", value)} value={formData.year}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select year" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 25 }, (_, i) => 2024 - i).map((year) => (
                            <SelectItem key={year} value={year.toString()}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="color">Color</Label>
                      <Input
                        id="color"
                        placeholder="e.g., White, Black"
                        value={formData.color}
                        onChange={(e) => handleInputChange("color", e.target.value)}
                        disabled={isLoading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="fuelType">Fuel Type</Label>
                      <Select onValueChange={(value) => handleInputChange("fuelType", value)} value={formData.fuelType}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select fuel type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="petrol">Petrol</SelectItem>
                          <SelectItem value="diesel">Diesel</SelectItem>
                          <SelectItem value="cng">CNG</SelectItem>
                          <SelectItem value="electric">Electric</SelectItem>
                          <SelectItem value="hybrid">Hybrid</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Compliance Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Compliance Information</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="pucExpiry">PUC Expiry Date</Label>
                      <Input
                        id="pucExpiry"
                        type="date"
                        value={formData.pucExpiry}
                        onChange={(e) => handleInputChange("pucExpiry", e.target.value)}
                        disabled={isLoading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="insuranceExpiry">Insurance Expiry Date</Label>
                      <Input
                        id="insuranceExpiry"
                        type="date"
                        value={formData.insuranceExpiry}
                        onChange={(e) => handleInputChange("insuranceExpiry", e.target.value)}
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="insuranceProvider">Insurance Provider</Label>
                    <Input
                      id="insuranceProvider"
                      placeholder="e.g., HDFC ERGO, ICICI Lombard"
                      value={formData.insuranceProvider}
                      onChange={(e) => handleInputChange("insuranceProvider", e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Additional Notes */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Additional Information</h3>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Anything else? (Optional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Like... it makes weird noises, AC doesn't work, whatever..."
                      value={formData.notes}
                      onChange={(e) => handleInputChange("notes", e.target.value)}
                      rows={3}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-4 pt-6">
                  <Link href="/dashboard" className="flex-1">
                    <Button variant="outline" className="w-full bg-transparent" disabled={isLoading}>
                      Cancel
                    </Button>
                  </Link>
                  <Button type="submit" className="flex-1" disabled={isLoading}>
                    {isLoading ? "Updating..." : "Update Car"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default withAuth(EditCarPage)
