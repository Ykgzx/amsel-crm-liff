// jest.setup.ts
import '@testing-library/jest-dom';

// Mock environment variables
process.env.NEXT_PUBLIC_LIFF_ID = '1234567890-abcde';

// Mock leaflet CSS import
jest.mock('leaflet/dist/leaflet.css', () => ({}));

// ปิด warning scrollWheelZoom + อื่น ๆ ของ react-leaflet ใน test อย่างถาวร
beforeEach(() => {
  const originalError = console.error;
  const originalWarn = console.warn;

  console.error = ((...args: any[]) => {
    const message = args[0] as string;

    // ซ่อน warning scrollWheelZoom และ unknown props อื่น ๆ ของ react-leaflet
    if (
      typeof message === 'string' &&
      (message.includes('React does not recognize the `scrollWheelZoom` prop') ||
        message.includes('React does not recognize the') ||
        message.includes('eventKeys') ||
        message.includes('onKeyPress'))
    ) {
      return;
    }

    return originalError.apply(console, args);
  }) as any;

  console.warn = ((...args: any[]) => {
    const message = args[0] as string;
    if (
      typeof message === 'string' &&
      message.includes('React does not recognize the')
    ) {
      return;
    }
    return originalWarn.apply(console, args);
  }) as any;
});

// คืนค่าเดิมหลัง test เสร็จ (optional แต่ดี)
afterEach(() => {
  jest.restoreAllMocks();
});