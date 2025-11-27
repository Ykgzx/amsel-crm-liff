// app/components/__mocks__/leaflet.ts
// วิธีที่ใช้ได้จริง 100% กับ new L.Icon() ใน Jest + TypeScript + Next.js

// สร้าง class จริงที่ใช้ new ได้
class Icon {
  constructor(options: any) {
    // ส่งคืน object ที่ leaflet คาดหวัง
    return {
      options: options || {},
      createIcon: () => {
        const div = document.createElement('div');
        div.className = 'leaflet-marker-icon';
        return div;
      },
      createShadow: () => null,
      _getIconUrl: () => '',
    } as any;
  }
}

// สร้าง L object ที่สมบูรณ์
const L = {
  Icon: Icon as any,                    // สำคัญที่สุด!
  icon: jest.fn((options: any) => ({
    createIcon: () => document.createElement('div'),
    options,
  })),
  marker: jest.fn(() => ({
    addTo: jest.fn().mockReturnThis(),
    bindPopup: jest.fn().mockReturnThis(),
    setLatLng: jest.fn().mockReturnThis(),
  })),
  map: jest.fn(() => ({
    setView: jest.fn(),
    on: jest.fn(),
    remove: jest.fn(),
  })),
  tileLayer: jest.fn(() => ({
    addTo: jest.fn(),
  })),
} as any;

export default L;