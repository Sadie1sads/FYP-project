'use client'

import { useEffect } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"


const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
})

type TrendingLocation = {
  location: string
  count: number
  latitude: number
  longitude: number
  posts: { _id: string; title: string; images?: string[] }[]
}


function FlyTo({ selected }: { selected: TrendingLocation | null }) {
  const map = useMap()
  useEffect(() => {
    console.log("FlyTo received:", selected?.location, selected?.latitude, selected?.longitude)
    if (selected?.latitude && selected?.longitude) {
      map.flyTo([Number(selected.latitude), Number(selected.longitude)], 10, { duration: 1.2 })
    }
  }, [selected, map])
  return null
}

export default function DiscoverMap({
  locations,
  selected,
  onSelect,
}: {
  locations: TrendingLocation[]
  selected: TrendingLocation | null
  onSelect: (loc: TrendingLocation) => void
}) {
  // Filter out locations without coordinates
  const withCoords = locations.filter((l) => 
  l.latitude != null && 
  l.longitude != null && 
  !isNaN(Number(l.latitude)) && 
  !isNaN(Number(l.longitude))
)

  const center: [number, number] = withCoords.length > 0
    ? [withCoords[0].latitude, withCoords[0].longitude]
    : [20, 0]  

  return (
    <MapContainer
      center={center}
      zoom={3}
      style={{ height: "100%", width: "100%", borderRadius: "12px" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <FlyTo selected={selected} />

      {withCoords.map((item) => (
        <Marker
            key={item.location}
            position={[Number(item.latitude), Number(item.longitude)]} 
            icon={icon}
            eventHandlers={{ click: () => onSelect(item) }}
            >
          <Popup>
            <strong>📍 {item.location}</strong>
            <br />
            {item.count} posts
            <br />
            {item.posts[0]?.images?.[0] && (
              <img
                src={item.posts[0].images[0]}
                alt={item.location}
                style={{ width: 120, marginTop: 6, borderRadius: 6 }}
              />
            )}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}