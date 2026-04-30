import { useState } from 'react';

import api from '../../lib/axios';

import BottomSheet from './BottomSheet';
import CodeInput from '../elements/CodeInput';
import SubmitButton from '../elements/SubmitButton';

import type { JSX, SubmitEvent } from 'react';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export default function JoinGroupSheet({ isOpen, onClose, onSuccess }: Props): JSX.Element {
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const handleClose = () => {
    setPin('');
    onClose();
  };

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (pin.length !== 8) {
      return;
    }

    setIsLoading(true);

    try {
      await api.post('/conversations/join', { pin });

      setPin('');
      onSuccess();
      handleClose();
    } catch {
      /** empty */
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={handleClose} title="Join Group">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex flex-col gap-3">
          <p className="text-sm text-platinum/60 text-center">
            Enter the 8-character PIN to join a group
          </p>
          <CodeInput type="pin" length={8} onComplete={(code) => setPin(code)} boxSize="sm" />
        </div>
        <SubmitButton label="Join Group" mt={2} is_loading={isLoading} />
      </form>
    </BottomSheet>
  );
}
