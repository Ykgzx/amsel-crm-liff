// app/components/__test__/MemberCardCarousel.test.tsx
import { render, screen } from '@testing-library/react';
import MemberCardCarousel from '../MemberCardCarousel';

const mockProps = {
  fullName: "นาย สมชาย ใจดี",
  currentPoints: 1250,
  accumulatedPoints: 3800,
  currentTier: "GOLD" as const,
  userProfile: { email: "test@email.com", phoneNumber: "0812345678", birthDate: "1990-01-01" },
  showDetails: { SILVER: false, GOLD: false, PLATINUM: false },
  onToggleDetails: jest.fn(),
  onRefresh: jest.fn(),
  isRefreshing: false,
};

describe('MemberCardCarousel', () => {
  it('render 3 cards ถูกต้อง', () => {
    render(<MemberCardCarousel {...mockProps} />);
    expect(screen.getByText('Silver Tier')).toBeInTheDocument();
    expect(screen.getByText('Gold Tier')).toBeInTheDocument();
    expect(screen.getByText('Platinum Tier')).toBeInTheDocument();
  });

  it('แสดงชื่อและพอยต์ถูกต้อง', () => {
    render(<MemberCardCarousel {...mockProps} />);
    expect(screen.getAllByText("นาย สมชาย ใจดี")).toHaveLength(3);
    expect(screen.getAllByText("1,250")).toHaveLength(3);
  });

  it('Gold Tier มี border ส้มและ scale ขึ้น', () => {
    render(<MemberCardCarousel {...mockProps} />);
    const goldCard = screen.getByText('Gold Tier').closest('.flex-shrink-0') as HTMLElement;
    expect(goldCard).toHaveClass('border-orange-500');
    expect(goldCard).toHaveClass('scale-105');
  });

  it('มีปุ่ม Refresh อยู่', () => {
    render(<MemberCardCarousel {...mockProps} />);
    const refreshBtn = screen.getByRole('button', { name: '' }); // ปุ่มไม่มี text
    expect(refreshBtn.querySelector('svg')).toBeInTheDocument();
  });
});