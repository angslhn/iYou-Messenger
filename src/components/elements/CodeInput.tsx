import { useRef, useState, useEffect } from 'react';

import type { KeyboardEvent } from 'react';

type Props = {
  type: 'otp' | 'pin';
  length?: number;
  onComplete: (code: string) => void;
  boxSize?: 'sm' | 'md';
};

const CodeInput = ({ type, length = 4, onComplete, boxSize = 'md' }: Props) => {
  const [code, setCode] = useState<string[]>(new Array(length).fill(''));

  const inputRefs = useRef<HTMLInputElement[]>([]);

  useEffect(() => {
    const fullCode = code.join('');
    if (fullCode.length === length && code.every((c) => c !== '')) {
      onComplete(fullCode);
    }
  }, [code, length, onComplete]);

  const focusToNextInput = (index: number) => {
    if (index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const focusToPrevInput = (index: number) => {
    if (index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').slice(0, length);

    // Validasi jika OTP harus angka
    if (type === 'otp' && !/^\d+$/.test(pasteData)) return;

    const newCode = [...code];
    pasteData.split('').forEach((char, i) => {
      if (i < length) newCode[i] = char;
    });

    setCode(newCode);

    // Fokus ke input terakhir yang terisi
    const targetIndex = Math.min(pasteData.length, length - 1);
    inputRefs.current[targetIndex]?.focus();

    if (newCode.every((digit) => digit !== '')) {
      onComplete(newCode.join(''));
    }
  };

  const handleTextChange = (value: string, index: number) => {
    const char = value.slice(-1);

    let clearValue;

    if (type === 'otp') {
      clearValue = char.replace(/[^0-9]/g, '');
    } else {
      clearValue = char.toUpperCase().replace(/[^A-Z0-9]/g, '');
    }

    if (char !== '' && clearValue === '') return;

    const newCode = [...code];

    newCode[index] = clearValue;

    setCode(newCode);

    if (clearValue && index < length - 1) {
      focusToNextInput(index);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace') {
      if (code[index] === '' && index > 0) {
        focusToPrevInput(index);
      }
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      focusToNextInput(index);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      focusToPrevInput(index);
    } else if (
      e.key.length === 1 &&
      type === 'otp' &&
      !/[0-9]/.test(e.key) &&
      !e.ctrlKey &&
      !e.metaKey
    ) {
      e.preventDefault();
    }
  };

  const handleInputOnFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.setSelectionRange(0, e.target.value.length);
  };

  return (
    <div
      className={`w-full flex justify-center items-center ${boxSize === 'sm' ? 'gap-1.5' : 'gap-4'}`}
    >
      {code.map((digit, index) => (
        <input
          key={index}
          type="text"
          maxLength={1}
          value={digit}
          placeholder="-"
          inputMode={type === 'otp' ? 'numeric' : 'text'}
          pattern={type === 'otp' ? '[0-9]*' : undefined}
          onPaste={handlePaste}
          onChange={(e) => handleTextChange(e.target.value, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onFocus={handleInputOnFocus}
          ref={(ref) => {
            inputRefs.current[index] = ref as HTMLInputElement;
          }}
          className={`text-center border-[0.05rem] border-platinum/70 font-bold text-platinum rounded-sm outline-none ${{ sm: 'size-8 text-[0.95rem]', md: 'size-10 text-[1.15rem]' }[boxSize]}`}
        />
      ))}
    </div>
  );
};

export default CodeInput;
