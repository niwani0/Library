interface MessageBubbleProps {
  role: 'concierge' | 'customer';
  text: string;
}

export function MessageBubble({ role, text }: MessageBubbleProps) {
  const isConcierge = role === 'concierge';
  return (
    <li className={isConcierge ? 'bubble bubble-concierge' : 'bubble bubble-customer'}>
      <span className="visually-hidden">{isConcierge ? 'Meridian: ' : 'You: '}</span>
      {text}
    </li>
  );
}
