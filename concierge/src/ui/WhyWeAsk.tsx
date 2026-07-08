interface WhyWeAskProps {
  text: string;
}

export function WhyWeAsk({ text }: WhyWeAskProps) {
  return (
    <details className="why-we-ask">
      <summary>Why we ask</summary>
      <p>{text}</p>
    </details>
  );
}
