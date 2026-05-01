import type { JSX } from 'react';

export default function ErrorValue({ text }: { text: string }): JSX.Element {
  return (
    <span className="h-5 flex items-center mx-2 font-normal xxs:text-xs xs:text-[0.81rem] s:text-sm text-nowrap text-red-500">
      {text && `*${text}`}
    </span>
  );
}
