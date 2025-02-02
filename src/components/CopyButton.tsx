import { useState } from 'react';
import { Copy, Check, X } from 'lucide-react';

import { Button } from '@zougui/react.ui';
import { copyText } from '../utils';

const Status = {
  idle: 'idle',
  success: 'success',
  error: 'error',
} as const;

const Icons = {
  idle: <Copy className="h-6 w-6 mr-2" />,
  success: <Check className="h-6 w-6 mr-2 text-green-400" />,
  error: <X className="h-6 w-6 mr-2 text-destructive" />,
};

export const CopyButton = ({ getTextContent, children }: CopyButtonProps) => {
  const [status, setStatus] = useState<keyof typeof Status>(Status.idle);

  const handleClick = async () => {
    const textContent = getTextContent();

    try {
      await copyText(textContent);
    } catch (error) {
      console.error('Copy error:', error);
      setStatus(Status.error);
    } finally {
      setTimeout(() => {
        setStatus(Status.idle);
      }, 1500);
    }

    setStatus(Status.success);
  }

  return (
    <Button onClick={handleClick}>
      {Icons[status]}
      <span>{children}</span>
    </Button>
  );
}

export interface CopyButtonProps {
  getTextContent: () => string;
  children?: React.ReactNode;
}
