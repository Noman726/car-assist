import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

type Mechanic = {
  id: string
  name: string
  lat: number
  lng: number
  distanceMeters: number
  address?: string | null
  phone?: string | null
  openingHours?: string | null
}

function toRad(v: number) {
  return (v * Math.PI) / 180
}

function haversineMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371000 // meters
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const lat = parseFloat(url.searchParams.get("lat") || "")
    const lng = parseFloat(url.searchParams.get("lng") || "")
    const radius = parseInt(url.searchParams.get("radius") || "3000", 10) // meters

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return NextResponse.json({ error: "lat and lng are required numeric query params" }, { status: 400 })
    }

    // Overpass QL: find mechanics/car repair within radius around point
    const overpassQuery = `
[out:json][timeout:25];
(
  node["amenity"="car_repair"](around:${radius},${lat},${lng});
  node["shop"="car_repair"](around:${radius},${lat},${lng});
  way["amenity"="car_repair"](around:${radius},${lat},${lng});
  relation["amenity"="car_repair"](around:${radius},${lat},${lng});
);
out center tags 50;
`

    const resp = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      // Send as url-encoded body per Overpass recommendations
      body: new URLSearchParams({ data: overpassQuery }).toString(),
      cache: "no-store",
    })

    if (!resp.ok) {
      const text = await resp.text().catch(() => "")
      return NextResponse.json({ error: "Overpass API error", details: text }, { status: 502 })
    }

    const json = (await resp.json()) as {
      elements: Array<{
        id: number
        type: "node" | "way" | "relation"
        lat?: number
        lon?: number
        center?: { lat: number; lon: number }
        tags?: Record<string, string>
      }>
    }

    const items: Mechanic[] = (json.elements || [])
      .map((el) => {
        const center = el.type === "node" ? { lat: el.lat!, lon: el.lon! } : el.center
        if (!center) return null
        const tags = el.tags || {}

        const distance = haversineMeters(lat, lng, center.lat, center.lon)
        
        // Additional safety check: ensure the mechanic is actually within the requested radius
        if (distance > radius) {
          console.log(`🚫 Filtering out ${tags.name || 'Mechanic'} - distance ${Math.round(distance)}m exceeds radius ${radius}m`)
          return null
        }

        const address =
          tags["addr:full"] ||
          [
            tags["addr:housenumber"], 
            tags["addr:street"], 
            tags["addr:suburb"] || tags["addr:neighbourhood"],
            tags["addr:city"], 
            tags["addr:state"] || tags["addr:province"], 
            tags["addr:postcode"]
          ].filter(Boolean).join(", ") ||
          tags["addr:street"] ||
          null

        // Try to get more phone number variations
        const phone = 
          tags["phone"] || 
          tags["contact:phone"] || 
          tags["telephone"] ||
          tags["mobile"] ||
          null

        const mechanic = {
          id: `${el.type}/${el.id}`,
          name: tags["name"] || "Mechanic / Car Repair",
          lat: center.lat,
          lng: center.lon,
          distanceMeters: distance,
          address,
          phone,
          openingHours: tags["opening_hours"] || null,
        } as Mechanic

        console.log(`✅ Found mechanic: ${mechanic.name} at ${Math.round(distance)}m${phone ? ` | Phone: ${phone}` : ' | No phone'}${address ? ` | Address: ${address.substring(0, 50)}...` : ' | No address'}`)
        return mechanic
      })
      .filter(Boolean) as Mechanic[]

    items.sort((a, b) => a.distanceMeters - b.distanceMeters)
    
    console.log(`📍 Returning ${items.length} mechanics within ${radius}m of (${lat}, ${lng})`)
    if (items.length > 0) {
      console.log(`📏 Closest mechanic: ${items[0].name} at ${Math.round(items[0].distanceMeters)}m`)
      console.log(`📏 Furthest mechanic: ${items[items.length-1].name} at ${Math.round(items[items.length-1].distanceMeters)}m`)
    }

    // Limit to closest 10 mechanics to keep results manageable and truly "nearby"
    const limitedResults = items.slice(0, 10)

    return NextResponse.json({ results: limitedResults })
  } catch (err: any) {
    return NextResponse.json({ error: "Unexpected error", message: err?.message || String(err) }, { status: 500 })
  }
}
