"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { LocationPermissionHelper } from "@/components/location-permission-helper"
import { Car, ArrowLeft, MapPin, Phone, Star, Navigation, Clock, Wrench } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

type Mechanic = {
  id: string
  name: string
  address?: string | null
  distanceMeters: number
  phone?: string | null
  openingHours?: string | null
  lat: number
  lng: number
}

type LocationPermissionState = 'prompt' | 'granted' | 'denied' | 'unsupported'

export default function MechanicLocatorPage() {
  const [searchLocation, setSearchLocation] = useState("")
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mechanics, setMechanics] = useState<Mechanic[]>([])
  const [locationPermission, setLocationPermission] = useState<LocationPermissionState>('prompt')
  const [showLocationHelp, setShowLocationHelp] = useState(false)

  const km = (m: number) => (m / 1000).toFixed(1) + " km"

  const checkLocationPermission = async () => {
    if (!navigator.permissions || !navigator.geolocation) {
      setLocationPermission('unsupported')
      return 'unsupported'
    }

    try {
      const result = await navigator.permissions.query({ name: 'geolocation' })
      setLocationPermission(result.state as LocationPermissionState)
      return result.state as LocationPermissionState
    } catch (error) {
      // Fallback if permissions API not available
      setLocationPermission('prompt')
      return 'prompt'
    }
  }

  const testWithMockLocation = async () => {
    console.log("🧪 Testing with mock location (Mumbai)")
    const mockCoords = { lat: 19.0760, lng: 72.8777 } // Mumbai coordinates
    setCoords(mockCoords)
    setSearchLocation(`${mockCoords.lat.toFixed(5)}, ${mockCoords.lng.toFixed(5)}`)
    await fetchMechanics(mockCoords.lat, mockCoords.lng)
  }

  const handleManualSearch = async () => {
    if (!searchLocation.trim()) {
      setError("Please enter a location to search")
      return
    }

    setLoading(true)
    setError(null)

    try {
      // For now, we'll use a mock geocoding - in a real app you'd use Google Geocoding API
      // This is just a demonstration of how you could handle manual location entry
      const mockCoords = { lat: 19.0760, lng: 72.8777 } // Mumbai coordinates as fallback
      setCoords(mockCoords)
      await fetchMechanics(mockCoords.lat, mockCoords.lng)
    } catch (error) {
      setError("Failed to search for mechanics at the specified location")
    } finally {
      setLoading(false)
    }
  }

  const handleLocationError = (error: GeolocationPositionError) => {
    let errorMessage = "Failed to get location"
    let shouldShowHelp = false

    switch (error.code) {
      case error.PERMISSION_DENIED:
        errorMessage = "Location access denied"
        setLocationPermission('denied')
        shouldShowHelp = true
        break
      case error.POSITION_UNAVAILABLE:
        errorMessage = "Location information unavailable"
        break
      case error.TIMEOUT:
        errorMessage = "Location request timed out"
        break
      default:
        errorMessage = error.message || "Unknown location error"
        break
    }

    setError(errorMessage)
    setShowLocationHelp(shouldShowHelp)
  }

  const handleEmergencyCall = (phone: string) => window.open(`tel:${phone}`)
  const handleGetDirections = (addressOrCoords: string) => {
    const encoded = encodeURIComponent(addressOrCoords)
    window.open(`https://maps.google.com/?q=${encoded}`, "_blank")
  }

  const fetchMechanics = async (lat: number, lng: number) => {
    console.log(`🔧 Fetching mechanics for coordinates: ${lat}, ${lng}`)
    setLoading(true)
    setError(null)
    
    try {
      const apiUrl = `/api/mechanics?lat=${lat}&lng=${lng}&radius=4000`
      console.log(`📡 API call: ${apiUrl}`)
      
      const res = await fetch(apiUrl, { 
        cache: "no-store",
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      console.log(`📡 API response status: ${res.status}`)
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Unknown API error' }))
        throw new Error(errorData?.error || `API returned ${res.status}`)
      }
      
      const data = await res.json()
      console.log(`✅ API response data:`, data)
      
      const mechanics = data.results || []
      setMechanics(mechanics)
      
      if (mechanics.length === 0) {
        setError("No mechanics found in your area. Try expanding the search radius or checking a different location.")
      } else {
        console.log(`✅ Found ${mechanics.length} mechanics`)
      }
    } catch (e: any) {
      console.error("❌ Error fetching mechanics:", e)
      setError(`Failed to find mechanics: ${e.message || "Unknown error"}`)
    } finally {
      setLoading(false)
    }
  }

  const useGPS = async () => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported by this browser")
      setLocationPermission('unsupported')
      return
    }

    console.log("🔍 Starting GPS location request...")
    
    // Check current permission state
    await checkLocationPermission()
    
    setError(null)
    setShowLocationHelp(false)
    setLoading(true)
    
    const options = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 300000 // 5 minutes
    }
    
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        console.log("✅ GPS position obtained:", pos.coords)
        const c = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setCoords(c)
        setSearchLocation(`${c.lat.toFixed(5)}, ${c.lng.toFixed(5)}`)
        setLocationPermission('granted')
        
        console.log("🔧 Fetching mechanics for coordinates:", c)
        try {
          await fetchMechanics(c.lat, c.lng)
        } catch (error) {
          console.error("❌ Failed to fetch mechanics:", error)
        }
        setLoading(false)
      },
      (err) => {
        console.error("❌ GPS error:", err)
        handleLocationError(err)
        setLoading(false)
      },
      options
    )
  }

  useEffect(() => {
    // Check location permission on load
    checkLocationPermission().then((permission) => {
      // Only try GPS automatically if permission is already granted
      if (permission === 'granted') {
        useGPS()
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
            <CardDescription>
              {coords ? (
                `Showing mechanics near your location (${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)})`
              ) : locationPermission === 'denied' ? (
                "Location access denied - please enable to find nearby mechanics"
              ) : locationPermission === 'unsupported' ? (
                "Location detection not supported by your browser"
              ) : (
                "Enter your location or allow GPS access to find nearby mechanics"
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Input
                placeholder="Enter your location or let us detect it..."
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                className="flex-1"
              />
              <Button 
                variant="outline" 
                onClick={useGPS} 
                disabled={loading || locationPermission === 'unsupported'}
                className={locationPermission === 'denied' ? 'border-orange-300 text-orange-700' : ''}
              >
                <Navigation className="h-4 w-4 mr-2" />
                {loading ? 'Getting Location...' : 
                 locationPermission === 'denied' ? 'Enable GPS' :
                 locationPermission === 'unsupported' ? 'GPS Unavailable' : 
                 'Use GPS'}
              </Button>
              <Button onClick={handleManualSearch} disabled={loading || !searchLocation.trim()}>
                {loading ? 'Searching...' : 'Search'}
              </Button>
              <Button variant="outline" onClick={testWithMockLocation} disabled={loading}>
                Test Location
              </Button>
            </div>
            {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
          </CardContent>
        </Card>

        {/* Location Permission Help */}
        {(showLocationHelp || locationPermission === 'denied') && (
          <LocationPermissionHelper 
            onRetry={useGPS}
            onDismiss={() => setShowLocationHelp(false)}
          />
        )}

        {/* Map Placeholder */}
        <Card className="mb-6">
          <CardContent className="p-0">
            <div className="h-64 bg-gray-200 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">Interactive Map View</p>
                {coords ? (
                  <p className="text-sm text-gray-500">Your position: {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}</p>
                ) : (
                  <p className="text-sm text-gray-500">Grant location access to find nearby mechanics</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mechanics List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Nearby Mechanics</h2>
            <div className="flex items-center gap-2">
              {loading && <span className="text-sm text-gray-600">Loading…</span>}
              <Badge variant="secondary">{mechanics.length} found</Badge>
            </div>
          </div>

          {mechanics.map((mechanic) => (
            <Card key={mechanic.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold">{mechanic.name}</h3>
                      <Badge className="bg-green-100 text-green-800">Open</Badge>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{km(mechanic.distanceMeters)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>{(4 + ((mechanic.distanceMeters % 50) / 100)).toFixed(1)} ({Math.floor((mechanic.distanceMeters % 200) + 20)} reviews)</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>ETA: {Math.max(10, Math.round(mechanic.distanceMeters / 80))} mins</span>
                      </div>
                    </div>

                    <p className="text-gray-600 mb-3">{mechanic.address || "Address unavailable"}</p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge variant="outline" className="text-xs">
                        <Wrench className="h-3 w-3 mr-1" />
                        Car Repair
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleGetDirections(mechanic.address || `${mechanic.lat},${mechanic.lng}`)}>
                    <Navigation className="h-4 w-4 mr-2" />
                    Directions
                  </Button>
                  {mechanic.phone ? (
                    <Button size="sm" onClick={() => handleEmergencyCall(mechanic.phone!)}>
                      <Phone className="h-4 w-4 mr-2" />
                      Call Now
                    </Button>
                  ) : (
                    <Button size="sm" variant="secondary" disabled>
                      <Phone className="h-4 w-4 mr-2" />
                      Phone N/A
                    </Button>
                  )}
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
