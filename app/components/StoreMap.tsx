// src/components/StoreMap.tsx
'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';

// แก้ปัญหาไอคอนหายใน React
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// แทนที่ไอคอนเริ่มต้น
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x.src,
  iconUrl: markerIcon.src,
  shadowUrl: markerShadow.src,
});

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

export default function StoreMap({ userLocation, stores }: StoreMapProps) {
  const [mapCenter, setMapCenter] = useState<[number, number]>([13.7563, 100.5018]); // [lat, lng]
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
      {/* Tile จาก OpenStreetMap */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Marker ผู้ใช้ */}
      {userLocation && (
        <Marker position={[userLocation.lat, userLocation.lng]}>
          <Popup>
            <div className="font-bold text-gray-900">ตำแหน่งของคุณ</div>
          </Popup>
        </Marker>
      )}

      {/* Marker ร้านค้า */}
      {stores.map((store) => (
        <Marker key={store.id} position={[store.lat, store.lng]}>
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