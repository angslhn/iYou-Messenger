import type { JSX } from 'react';

type Props = {
  id: string;
  name: string;
  placeholder: string;
};

export default function SearchBar({ id, name, placeholder }: Props): JSX.Element {
  return (
    <form role="search" onSubmit={(e) => e.preventDefault()} className="h-14 flex items-center">
      <div className="relative w-full">
        <label htmlFor={id} className="sr-only">
          {placeholder}
        </label>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          className="size-4.5 absolute left-3 top-1/2 -translate-y-1/2 fill-platinum/50 pointer-events-none"
        >
          <path d="M18.031 16.6168L22.3137 20.8995L20.8995 22.3137L16.6168 18.031C15.0769 19.263 13.124 20 11 20C6.032 20 2 15.968 2 11C2 6.032 6.032 2 11 2C15.968 2 20 6.032 20 11C20 13.124 19.263 15.0769 18.031 16.6168ZM16.0247 15.8748C17.2475 14.6146 18 12.8956 18 11C18 7.1325 14.8675 4 11 4C7.1325 4 4 7.1325 4 11C4 14.8675 7.1325 18 11 18C12.8956 18 14.6146 17.2475 15.8748 16.0247L16.0247 15.8748Z"></path>
        </svg>

        <input
          type="text"
          id={id}
          name={name}
          placeholder={placeholder}
          autoComplete="off"
          className="w-full h-12 outline-none border border-ebony-light rounded-xl pr-4 pl-10 
                     bg-dark-deep text-platinum/85 text-sm placeholder:text-platinum/60 placeholder:select-none
                     focus:border-platinum/40 focus:ring-1 focus:ring-platinum/10 transition-all"
        />
      </div>
    </form>
  );
}
