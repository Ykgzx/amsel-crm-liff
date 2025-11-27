// app/components/__mocks__/react-leaflet.tsx   <-- ต้องเป็น .tsx เท่านั้น!
import * as React from 'react';

export const MapContainer = ({ children, ...props }: any) => (
  <div data-testid="map-container" {...props}>
    {children}
  </div>
);

export const TileLayer = () => <div data-testid="tile-layer" />;

export const Marker = ({ children }: { children?: React.ReactNode }) => (
  <div data-testid="marker">{children}</div>
);

export const Popup = ({ children }: { children?: React.ReactNode }) => (
  <div data-testid="popup">{children}</div>
);