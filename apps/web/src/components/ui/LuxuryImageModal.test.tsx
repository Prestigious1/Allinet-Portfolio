// LuxuryImageModal.test.tsx
import { render, screen } from '@testing-library/react';
import { LuxuryImageModal } from './LuxuryImageModal';

describe('LuxuryImageModal', () => {
  it('renders without crashing', () => {
    const handleClose = vi.fn();
    render(
      <LuxuryImageModal
        isOpen={true}
        onClose={handleClose}
        imageUrl="/placeholder.jpg"
        alt="Test Image"
      />
    );
    const img = screen.getByRole('img');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/placeholder.jpg');
    expect(img).toHaveAttribute('alt', 'Test Image');
  });
});

describe('LuxuryImageModal additional tests', () => {
  it('does not render when closed', () => {
    const handleClose = vi.fn();
    render(
      <LuxuryImageModal
        isOpen={false}
        onClose={handleClose}
        imageUrl="/placeholder.jpg"
        alt="Test Image"
      />
    );
    const img = screen.queryByRole('img');
    expect(img).not.toBeInTheDocument();
  });

  it('calls onClose when close button clicked', () => {
    const handleClose = vi.fn();
    render(
      <LuxuryImageModal
        isOpen={true}
        onClose={handleClose}
        imageUrl="/placeholder.jpg"
        alt="Test Image"
      />
    );
    const closeBtn = screen.getByLabelText(/close/i);
    closeBtn.click();
    expect(handleClose).toHaveBeenCalled();
  });
});
