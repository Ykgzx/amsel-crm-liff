// src/components/StoreMap.tsx
'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useState, useEffect } from 'react';
import L from 'leaflet';

export type Store = {
  id: number;
  name: string;
  address: string;
  lat: number;
  lng: number;
};

type StoreMapProps = {
  userLocation: { lat: number; lng: number } | null;
  stores: Store[];
};

// สร้างไอคอนโดยใช้ L.Icon
const createIcon = () =>
  new L.Icon({
    iconUrl: '/marker-icon.png',
    iconRetinaUrl: '/marker-icon-2x.png',
    shadowUrl: '/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

const userIcon = createIcon();
const storeIcon = createIcon();

export default function StoreMap({ userLocation, stores }: StoreMapProps) {
  const [mapCenter, setMapCenter] = useState<[number, number]>([13.7563, 100.5018]);
  const [zoom, setZoom] = useState(12);

  useEffect(() => {
    if (userLocation) {
      setMapCenter([userLocation.lat, userLocation.lng]);
      setZoom(13);
    }
  }, [userLocation]);

  return (
    <MapContainer
      center={mapCenter}
      zoom={zoom}
      scrollWheelZoom={false}
      style={{
        width: '100%',
        height: '300px',
        borderRadius: '1.5rem',
        border: '2px solid #fed7aa',
        zIndex: 0,
      }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {userLocation && (
        <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
          <Popup>
            <div className="font-bold text-gray-900">ตำแหน่งของคุณ</div>
          </Popup>
        </Marker>
      )}

      {stores.map((store) => (
        <Marker key={store.id} position={[store.lat, store.lng]} icon={storeIcon}>
          <Popup>
            <div>
              <h4 className="font-bold text-gray-900">{store.name}</h4>
              <p className="text-sm text-gray-600">{store.address}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}