// src/components/__test__/StoreMap.test.tsx
import { render, screen } from '@testing-library/react';
import StoreMap from '../StoreMap';
import L from 'leaflet';

type StoreMapProps = {
  userLocation: { lat: number; lng: number } | null;
  stores: {
    id: number;
    name: string;
    address: string;
    lat: number;
    lng: number;
  }[];
};

// Mock react-leaflet
jest.mock('react-leaflet', () => ({
  MapContainer: ({ children, ...props }: any) => (
    <div data-testid="map-container" {...props}>
      {children}
    </div>
  ),
  TileLayer: () => <div data-testid="tile-layer" />,
  Marker: ({ children }: any) => <div data-testid="marker">{children}</div>,
  Popup: ({ children }: any) => <div data-testid="popup">{children}</div>,
}));

// Mock leaflet - แก้ตรงนี้ให้สมบูรณ์!
jest.mock('leaflet', () => ({
  icon: jest.fn(() => ({ options: {} })),
  // สำคัญมาก! ต้อง mock L.Icon ให้เป็น constructor
  Icon: class {
    constructor() {
      return {
        createIcon: () => {
          const div = document.createElement('div');
          div.className = 'leaflet-marker-icon';
          return div;
        },
        createShadow: () => null,
      };
    }
  },
}));

const mockStores: StoreMapProps['stores'] = [
  {
    id: 1,
    name: 'สาขาสยามพารากอน',
    address: '991 Rama I Rd, Pathum Wan, Bangkok',
    lat: 13.7465,
    lng: 100.5347,
  },
  {
    id: 2,
    name: 'สาขาเซ็นทรัลเวิลด์',
    address: '4 Ratchadamri Rd, Pathum Wan, Bangkok',
    lat: 13.7478,
    lng: 100.5399,
  },
];

describe('StoreMap', () => {
  it('render แผนที่และ TileLayer ถูกต้อง', () => {
    render(<StoreMap userLocation={null} stores={[]} />);
    
    const map = screen.getByTestId('map-container');
    expect(map).toBeInTheDocument();
    expect(screen.getByTestId('tile-layer')).toBeInTheDocument();
    expect(map).toHaveStyle('height: 300px');
  });

  it('แสดง marker ผู้ใช้เมื่อมี userLocation', () => {
    render(
      <StoreMap userLocation={{ lat: 13.7563, lng: 100.5018 }} stores={[]} />
    );

    expect(screen.getAllByTestId('marker')).toHaveLength(1);
    expect(screen.getByText('ตำแหน่งของคุณ')).toBeInTheDocument();
  });

  it('แสดง marker ร้านค้าตามจำนวน stores', () => {
    render(<StoreMap userLocation={null} stores={mockStores} />);

    const markers = screen.getAllByTestId('marker');
    expect(markers).toHaveLength(2);

    expect(screen.getByText('สาขาสยามพารากอน')).toBeInTheDocument();
    expect(screen.getByText('สาขาเซ็นทรัลเวิลด์')).toBeInTheDocument();
  });

  it('แสดงทั้ง marker ผู้ใช้และร้านค้าเมื่อมีข้อมูลครบ', () => {
    render(
      <StoreMap
        userLocation={{ lat: 13.75, lng: 100.50 }}
        stores={mockStores}
      />
    );

    expect(screen.getAllByTestId('marker')).toHaveLength(3);
    expect(screen.getByText('ตำแหน่งของคุณ')).toBeInTheDocument();
    expect(screen.getByText('สาขาสยามพารากอน')).toBeInTheDocument();
  });
});