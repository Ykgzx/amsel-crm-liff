'use client';

import { useState, useEffect } from 'react';
import ReactMapGL, { Marker, Popup, ViewStateChangeEvent } from 'react-map-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

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
  const [viewport, setViewport] = useState({
    latitude: userLocation?.lat || 13.7563,
    longitude: userLocation?.lng || 100.5018,
    zoom: 12,
  });

  const [selectedStore, setSelectedStore] = useState<Store | null>(null);

  useEffect(() => {
    if (userLocation) {
      setViewport({
        latitude: userLocation.lat,
        longitude: userLocation.lng,
        zoom: 13,
      });
    }
  }, [userLocation]);

  return (
    <ReactMapGL
      {...viewport}
      onMove={(evt: ViewStateChangeEvent) => setViewport(evt.viewState)}
      mapStyle="https://tiles.stadiamaps.com/styles/alidade_smooth.json"
      mapLib={require('maplibre-gl')}
      style={{
        width: '100%',
        height: '300px',
        borderRadius: '1.5rem',
        border: '2px solid #fed7aa',
      }}
      attributionControl={false}
    >
      {userLocation && (
        <Marker latitude={userLocation.lat} longitude={userLocation.lng}>
          <div className="w-6 h-6 bg-blue-600 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white text-xs font-bold">
            คุณ
          </div>
        </Marker>
      )}

      {stores.map((store) => (
        <Marker
          key={store.id}
          latitude={store.lat}
          longitude={store.lng}
          onClick={(e: { originalEvent: MouseEvent }) => {
            e.originalEvent.stopPropagation();
            setSelectedStore(store);
          }}
        >
          <div className="w-6 h-6 bg-orange-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white text-xs font-bold cursor-pointer">
            {store.id}
          </div>
        </Marker>
      ))}

      {selectedStore && (
        <Popup
          latitude={selectedStore.lat}
          longitude={selectedStore.lng}
          onClose={() => setSelectedStore(null)}
          closeButton={true}
          closeOnClick={false}
        >
          <div>
            <h4 className="font-bold text-gray-900">{selectedStore.name}</h4>
            <p className="text-sm text-gray-600">{selectedStore.address}</p>
          </div>
        </Popup>
      )}
    </ReactMapGL>
  );
}