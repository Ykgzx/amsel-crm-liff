// app/components/__test__/Navbar.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import Navbar from '../Navbar';
import liff from '@line/liff';
import { act } from 'react';

jest.mock('@line/liff', () => ({
  init: jest.fn(),
  isLoggedIn: jest.fn(),
  getProfile: jest.fn(),
}));

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    const { priority, ...rest } = props;
    return <img {...rest} alt={props.alt} />;
  },
}));

describe('Navbar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NEXT_PUBLIC_LIFF_ID = '1234567890';

    // ทำให้ liff.init เป็น async จริง ๆ → loading จะมีเวลาอยู่
    (liff.init as jest.Mock).mockImplementation(() =>
      new Promise(resolve => setTimeout(resolve, 50))
    );
  });

  it('แสดงโลโก้ AMSel ถูกต้อง', async () => {
    (liff.isLoggedIn as jest.Mock).mockReturnValue(false);

    await act(async () => {
      render(<Navbar />);
    });

    const logo = screen.getByAltText('AMSEL');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('src', '/logo-amsel.png');
  });

  it('แสดง loading skeleton ตอนเริ่มต้น', async () => {
    await act(async () => {
      render(<Navbar />);
    });

    const avatar = screen.getByTestId('profile-avatar');

    await waitFor(() => {
      const pulseDiv = avatar.querySelector('.animate-pulse');
      expect(pulseDiv).toBeInTheDocument();
    });
  });

  it('แสดงไอคอนผู้ใช้เมื่อไม่ล็อกอินหรือ error', async () => {
    (liff.isLoggedIn as jest.Mock).mockReturnValue(false);

    await act(async () => {
      render(<Navbar />);
    });

    await waitFor(() => {
      const avatar = screen.getByTestId('profile-avatar');
      expect(avatar.querySelector('i.fa-user')).toBeInTheDocument();
    });
  });

  it('แสดงรูปโปรไฟล์จริงเมื่อ login สำเร็จ', async () => {
    (liff.isLoggedIn as jest.Mock).mockReturnValue(true);
    (liff.getProfile as jest.Mock).mockResolvedValue({
      pictureUrl: 'https://profile.line.me/12345',
    });

    await act(async () => {
      render(<Navbar />);
    });

    await waitFor(() => {
      const img = screen.getByAltText('Profile');
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src', 'https://profile.line.me/12345');
    });
  });

  it('ลิงก์โปรไฟล์ชี้ไปที่ /editprofile', async () => {
    await act(async () => {
      render(<Navbar />);
    });

    const avatar = screen.getByTestId('profile-avatar');
    const profileLink = avatar.closest('a') as HTMLAnchorElement;

    expect(profileLink).toBeInTheDocument();
    expect(profileLink.getAttribute('href')).toBe('/editprofile');
    expect(profileLink.href).toContain('/editprofile');
  });

  it('มี gradient background และ shadow ที่สวยงาม', async () => {
    await act(async () => {
      render(<Navbar />);
    });

    const navbar = screen.getByRole('navigation');
    expect(navbar).toHaveClass('bg-gradient-to-r');
    expect(navbar).toHaveClass('from-amber-500');
    expect(navbar).toHaveClass('to-orange-500');
    expect(navbar).toHaveClass('shadow-lg');
    expect(navbar).toHaveClass('fixed');
    expect(navbar).toHaveClass('z-50');
  });
});