import type { ChangeEvent, JSX } from 'react';

type Props = {
  is_checked: boolean;
  handleChange: (e: ChangeEvent<HTMLInputElement>) => void;
};

export default function SwitchButton({ is_checked, handleChange }: Props): JSX.Element {
  return (
    <div className="relative inline-block w-11 h-5">
      <input
        id="switch-read-receipt"
        checked={is_checked}
        onChange={handleChange}
        type="checkbox"
        className="peer appearance-none w-11 h-5 bg-ebony-light rounded-full checked:bg-platinum/85 cursor-pointer transition-colors duration-300"
      />
      <label
        htmlFor="switch-read-receipt"
        className="absolute top-0.5 left-[0.130rem] size-4 bg-spanish-gray rounded-full shadow-sm transition-transform duration-300 peer-checked:translate-x-6 peer-checked:bg-night cursor-pointer"
      ></label>
    </div>
  );
}
