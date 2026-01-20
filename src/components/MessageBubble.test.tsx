import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import MessageBubble from './MessageBubble';

describe('MessageBubble', () => {
  const mockMessage = {
    id: '1',
    content: 'Hello, World!',
    sender: 'Alice',
    avatar: '/avatar.png',
    timestamp: '10:30',
    isOwn: false,
  };

  it('renders message content', () => {
    render(<MessageBubble {...mockMessage} />);
    expect(screen.getByText('Hello, World!')).toBeInTheDocument();
  });

  it('renders sender name for other messages', () => {
    render(<MessageBubble {...mockMessage} />);
    expect(screen.getByText('Alice')).toBeInTheDocument();
  });

  it('renders timestamp', () => {
    render(<MessageBubble {...mockMessage} />);
    expect(screen.getByText('10:30')).toBeInTheDocument();
  });

  it('applies own message styling when isOwn is true', () => {
    render(<MessageBubble {...mockMessage} isOwn={true} />);
    const bubble = screen.getByText('Hello, World!').closest('div');
    expect(bubble).toHaveClass('bg-blue-500');
  });

  it('applies other message styling when isOwn is false', () => {
    render(<MessageBubble {...mockMessage} isOwn={false} />);
    const bubble = screen.getByText('Hello, World!').closest('div');
    expect(bubble).toHaveClass('bg-gray-100');
  });
});
