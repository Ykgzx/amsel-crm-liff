// __tests__/components/AdminSidebar.test.tsx
import { render, screen } from '@testing-library/react';
import { usePathname } from 'next/navigation';
import AdminSidebar from '../AdminSidebar';

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href} data-testid={`link-${href}`}>
      {children}
    </a>
  );
});

// วิธีที่ดีที่สุดสำหรับ lucide-react
const MockIcon = ({ 'data-testid': testId }: { 'data-testid': string }) => (
  <svg data-testid={testId} className="w-5 h-5" />
);

jest.mock('lucide-react', () => ({
  Home: () => <MockIcon data-testid="icon-home" />,
  CheckSquare: () => <MockIcon data-testid="icon-checksquare" />,
  Users: () => <MockIcon data-testid="icon-users" />,
  Gift: () => <MockIcon data-testid="icon-gift" />,
  LogOut: () => <MockIcon data-testid="icon-logout" />,
}));

describe('AdminSidebar', () => {
  const mockUsePathname = usePathname as jest.Mock;

  beforeEach(() => {
    mockUsePathname.mockReset();
  });

  // ... ทุก test เดิมของคุณยังใช้ได้ปกติ
  // แค่เปลี่ยนการ query ไอคอนเป็น getByTestId แทน

  it('renders icons correctly', () => {
    mockUsePathname.mockReturnValue('/admin');
    render(<AdminSidebar />);
    
    expect(screen.getByTestId('icon-home')).toBeInTheDocument();
    expect(screen.getByTestId('icon-checksquare')).toBeInTheDocument();
    expect(screen.getByTestId('icon-logout')).toBeInTheDocument();
  });

  // ฯลฯ
});