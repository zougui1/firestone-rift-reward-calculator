import { Typography } from '@zougui/react.ui';

export const Reward = ({ icon, alt, value, className }: RewardProps) => {
  return (
    <div className="flex items-center gap-1">
      <div>
        <img src={icon} alt={alt} />
      </div>
      <div>
        <Typography.Span className={className}>{value}</Typography.Span>
      </div>
    </div>
  );
}

export interface RewardProps {
  icon: string;
  alt: string;
  value: number;
  className?: string;
}
