import { isNumber } from 'radash';

import { Input } from '@zougui/react.ui';

export const RewardInput = ({ icon, alt, value, onChange }: RewardInputProps) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(event.currentTarget.value);

    if (isNumber(value)) {
      onChange(value);
    }
  }

  const handleFocus = (element: React.FocusEvent<HTMLInputElement>) => {
    if (value === 0) {
      element.currentTarget.select();
    }
  }

  return (
    <div className="flex items-center gap-4">
      <div>
        <img src={icon} alt={alt} />
      </div>
      <div>
        <Input
          className="w-[10ch]"
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
        />
      </div>
    </div>
  );
}

export interface RewardInputProps {
  icon: string;
  alt: string;
  value: number;
  onChange: (value: number) => void;
}
