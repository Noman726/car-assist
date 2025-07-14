"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Car, ArrowLeft, MapPin, Phone, Star, Navigation, Clock, Wrench } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function MechanicLocatorPage() {
  const [searchLocation, setSearchLocation] = useState("")
  const [mechanics] = useState([
    {
      id: 1,
      name: "Sharma Auto Works",
      address: "Shop 15, Linking Road, Bandra West, Mumbai",
      distance: "1.2 km",
      rating: 4.2,
      reviews: 89,
      phone: "+91 98765 43210",
      services: ["Engine", "Brakes", "AC repair"],
      isOpen: true,
      estimatedTime: "20 mins",
    },
    {
      id: 2,
      name: "Quick Fix Garage",
      address: "Near Petrol Pump, SV Road, Malad West",
      distance: "2.1 km",
      rating: 4.0,
      reviews: 156,
      phone: "+91 98765 43211",
      services: ["Puncture", "Battery", "Electrical"],
      isOpen: true,
      estimatedTime: "25 mins",
    },
    {
      id: 3,
      name: "Highway Rescue Service",
      address: "Km 23, Mumbai-Pune Highway, Panvel",
      distance: "800 m",
      rating: 4.5,
      reviews: 203,
      phone: "+91 98765 43212",
      services: ["Towing", "Jump start", "24x7"],
      isOpen: true,
      estimatedTime: "15 mins",
    },
    {
      id: 4,
      name: "City Car Care",
      address: "Ground Floor, Opposite Bus Stop, Andheri East",
      distance: "3.2 km",
      rating: 3.8,
      reviews: 67,
      phone: "+91 98765 43213",
      services: ["General repair", "Oil change", "Servicing"],
      isOpen: false,
      estimatedTime: "35 mins",
    },
  ])

  const handleEmergencyCall = (phone: string) => {
    window.open(`tel:${phone}`)
  }

  const handleGetDirections = (address: string) => {
    const encodedAddress = encodeURIComponent(address)
    window.open(`https://maps.google.com/?q=${encodedAddress}`, "_blank")
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
            <MapPin className="h-6 w-6 text-red-600" />
            <span className="text-xl font-bold text-gray-900">Find Nearby Mechanics</span>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Emergency Banner */}
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                  <Phone className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-red-900">Car broke down?</h3>
                  <p className="text-sm text-red-700">Don't panic - call our emergency line</p>
                </div>
              </div>
              <Button className="bg-red-600 hover:bg-red-700" onClick={() => handleEmergencyCall("+91 1800-123-4567")}>
                Call Now
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Search Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Your Location
            </CardTitle>
            <CardDescription>Showing mechanics near you (we detected Bandra West)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Input
                placeholder="Enter your location or let us detect it..."
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                className="flex-1"
              />
              <Button variant="outline">
                <Navigation className="h-4 w-4 mr-2" />
                Use GPS
              </Button>
              <Button>Search</Button>
            </div>
          </CardContent>
        </Card>

        {/* Map Placeholder */}
        <Card className="mb-6">
          <CardContent className="p-0">
            <div className="h-64 bg-gray-200 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">Interactive Map View</p>
                <p className="text-sm text-gray-500">Google Maps integration would be implemented here</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mechanics List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Nearby Mechanics</h2>
            <Badge variant="secondary">{mechanics.length} found</Badge>
          </div>

          {mechanics.map((mechanic) => (
            <Card key={mechanic.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold">{mechanic.name}</h3>
                      {mechanic.isOpen ? (
                        <Badge className="bg-green-100 text-green-800">Open</Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-800">Closed</Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{mechanic.distance}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>
                          {mechanic.rating} ({mechanic.reviews} reviews)
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>ETA: {mechanic.estimatedTime}</span>
                      </div>
                    </div>

                    <p className="text-gray-600 mb-3">{mechanic.address}</p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {mechanic.services.map((service, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          <Wrench className="h-3 w-3 mr-1" />
                          {service}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleGetDirections(mechanic.address)}>
                    <Navigation className="h-4 w-4 mr-2" />
                    Directions
                  </Button>
                  <Button size="sm" onClick={() => handleEmergencyCall(mechanic.phone)}>
                    <Phone className="h-4 w-4 mr-2" />
                    Call Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Help Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Need Help?</CardTitle>
            <CardDescription>Can't find what you're looking for? We're here to help.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <Button variant="outline" className="h-auto p-4 bg-transparent">
                <div className="text-center">
                  <Phone className="h-6 w-6 mx-auto mb-2" />
                  <p className="font-medium">24/7 Support</p>
                  <p className="text-sm text-gray-600">Call our helpline</p>
                </div>
              </Button>
              <Button variant="outline" className="h-auto p-4 bg-transparent">
                <div className="text-center">
                  <Car className="h-6 w-6 mx-auto mb-2" />
                  <p className="font-medium">Request Towing</p>
                  <p className="text-sm text-gray-600">Emergency towing service</p>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
