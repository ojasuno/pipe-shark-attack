"use client"
import "leaflet/dist/leaflet.css"
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import L from "leaflet"

// Fix for default marker icons in Leaflet with Next.js
const icon = L.icon({
  iconUrl: "/marker-icon.png",
  iconRetinaUrl: "/marker-icon-2x.png",
  shadowUrl: "/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

// Approximate country centers
const countryCoordinates: { [key: string]: [number, number] } = {
  US: [37.0902, -95.7129],
  GB: [55.3781, -3.436],
  DE: [51.1657, 10.4515],
  FR: [46.2276, 2.2137],
  CN: [35.8617, 104.1954],
  JP: [36.2048, 138.2529],
  KR: [35.9078, 127.7669],
  IN: [20.5937, 78.9629],
  BR: [14.235, -51.9253],
  RU: [61.524, 105.3188],
  ID: [-0.7893, 113.9213],
  KH: [12.5657, 104.991],
  VN: [14.0583, 108.2772],
  MY: [4.2105, 101.9758],
  HK: [22.3193, 114.1694],
  IR: [32.4279, 53.688],
  SC: [-4.6796, 55.492],
  VE: [6.4238, -66.5897],
  MX: [23.6345, -102.5528],
  MA: [31.7917, -7.0926],
  KZ: [48.0196, 66.9237],
  // Add more countries as needed
}

type Location = {
  ip: string
  country: string
  countryCode: string
  city: string
}

type MapProps = {
  locations: Location[]
}

export default function Map({ locations }: MapProps) {
  // Group locations by country
  const locationsByCountry = locations.reduce(
    (acc, location) => {
      if (!acc[location.countryCode]) {
        acc[location.countryCode] = []
      }
      acc[location.countryCode].push(location)
      return acc
    },
    {} as { [key: string]: Location[] },
  )

  return (
    <div className="h-[400px] w-full rounded-lg overflow-hidden">
      <MapContainer center={[20, 0]} zoom={2} scrollWheelZoom={true} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {Object.entries(locationsByCountry).map(([countryCode, ips]) => {
          const coordinates = countryCoordinates[countryCode]
          if (!coordinates) return null

          return (
            <Marker key={countryCode} position={coordinates} icon={icon}>
              <Popup>
                <div className="max-w-xs">
                  <h3 className="font-bold mb-2">{ips[0].country}</h3>
                  <p className="text-sm text-muted-foreground mb-1">Banned IPs: {ips.length}</p>
                  <div className="max-h-32 overflow-y-auto text-sm">
                    {ips.map((ip, index) => (
                      <div key={index} className="font-mono">
                        {ip.ip}
                      </div>
                    ))}
                  </div>
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>
    </div>
  )
}
