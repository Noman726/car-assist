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

        const address =
          tags["addr:full"] ||
          [tags["addr:housenumber"], tags["addr:street"], tags["addr:city"], tags["addr:state"], tags["addr:postcode"]]
            .filter(Boolean)
            .join(", ") || null

        return {
          id: `${el.type}/${el.id}`,
          name: tags["name"] || "Mechanic / Car Repair",
          lat: center.lat,
          lng: center.lon,
          distanceMeters: haversineMeters(lat, lng, center.lat, center.lon),
          address,
          phone: tags["phone"] || tags["contact:phone"] || null,
          openingHours: tags["opening_hours"] || null,
        } as Mechanic
      })
      .filter(Boolean) as Mechanic[]

    items.sort((a, b) => a.distanceMeters - b.distanceMeters)

    return NextResponse.json({ results: items })
  } catch (err: any) {
    return NextResponse.json({ error: "Unexpected error", message: err?.message || String(err) }, { status: 500 })
  }
}
