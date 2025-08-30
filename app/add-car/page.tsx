"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Car, ArrowLeft, Upload, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { withAuth } from "@/lib/with-auth"
import { firebaseCarStorage } from "@/lib/firebase-storage"

function AddCarPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [rcBookFile, setRcBookFile] = useState<File | null>(null)
  const [insuranceFile, setInsuranceFile] = useState<File | null>(null)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!user) {
      setError("User not authenticated")
      return
    }

    setIsLoading(true)

    try {
      // Create the car with user ID and file uploads
      const carData = {
        ...formData,
        userId: user.id
      }
      
      // Prepare files for upload
      const files: { rcBook?: File; insurance?: File } = {};
      if (rcBookFile) files.rcBook = rcBookFile;
      if (insuranceFile) files.insurance = insuranceFile;
      
      const newCar = await firebaseCarStorage.createCar(carData, files)
      console.log("Car added to Firebase with files:", newCar)
      router.push("/dashboard")
    } catch (err) {
      console.error("Error adding car:", err)
      setError("Failed to add car. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleRcBookFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setRcBookFile(file)
    }
  }

  const handleInsuranceFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setInsuranceFile(file)
    }
  }

  const triggerRcBookFileInput = (e: React.MouseEvent) => {
    e.preventDefault() // Prevent form submission
    document.getElementById('rc-book-input')?.click()
  }

  const triggerInsuranceFileInput = (e: React.MouseEvent) => {
    e.preventDefault() // Prevent form submission
    document.getElementById('insurance-input')?.click()
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
            <span className="text-xl font-bold text-gray-900">Add New Car</span>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Vehicle Information</CardTitle>
              <CardDescription>Enter your vehicle details to add it to your digital garage</CardDescription>
            </CardHeader>
            <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md text-red-800">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">{error}</span>
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
              </div>                {/* Vehicle Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Vehicle Details</h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="make">Make</Label>
                      <Select onValueChange={(value) => handleInputChange("make", value)}>
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
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="year">Year</Label>
                      <Select onValueChange={(value) => handleInputChange("year", value)}>
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
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="fuelType">Fuel Type</Label>
                      <Select onValueChange={(value) => handleInputChange("fuelType", value)}>
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
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="insuranceExpiry">Insurance Expiry Date</Label>
                      <Input
                        id="insuranceExpiry"
                        type="date"
                        value={formData.insuranceExpiry}
                        onChange={(e) => handleInputChange("insuranceExpiry", e.target.value)}
                        required
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
                    />
                  </div>
                </div>

                {/* Document Upload Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Documents (Optional)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="border-dashed border-2 border-gray-300 hover:border-blue-400 transition-colors">
                      <CardContent className="p-6 text-center">
                        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 mb-2">RC Book (front page)</p>
                        {rcBookFile ? (
                          <p className="text-xs text-green-600 mb-2">✓ {rcBookFile.name}</p>
                        ) : null}
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm"
                          onClick={triggerRcBookFileInput}
                        >
                          {rcBookFile ? "Change File" : "Choose File"}
                        </Button>
                        <input
                          id="rc-book-input"
                          type="file"
                          accept="image/*,.pdf"
                          onChange={handleRcBookFileChange}
                          className="hidden"
                        />
                      </CardContent>
                    </Card>

                    <Card className="border-dashed border-2 border-gray-300 hover:border-blue-400 transition-colors">
                      <CardContent className="p-6 text-center">
                        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 mb-2">Insurance Policy</p>
                        {insuranceFile ? (
                          <p className="text-xs text-green-600 mb-2">✓ {insuranceFile.name}</p>
                        ) : null}
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm"
                          onClick={triggerInsuranceFileInput}
                        >
                          {insuranceFile ? "Change File" : "Choose File"}
                        </Button>
                        <input
                          id="insurance-input"
                          type="file"
                          accept="image/*,.pdf"
                          onChange={handleInsuranceFileChange}
                          className="hidden"
                        />
                      </CardContent>
                    </Card>
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
                    {isLoading ? "Adding Car..." : "Add Car"}
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

export default withAuth(AddCarPage)
