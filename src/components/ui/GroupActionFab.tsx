import { useState } from 'react';

import type { JSX } from 'react';

type Props = {
  onCreateClick: () => void;
  onJoinClick: () => void;
};

export default function GroupActionFab({ onCreateClick, onJoinClick }: Props): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);

  const handleCreate = () => {
    setIsOpen(false);
    onCreateClick();
  };

  const handleJoin = () => {
    setIsOpen(false);
    onJoinClick();
  };

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full h-18 xs:max-w-90 s:max-w-97.5 s-medium:max-w-112.5 max-w-md z-20 pointer-events-none">
      <div className="absolute bottom-23 right-6 flex flex-col items-end gap-4 z-50 pointer-events-auto">
        <div
          className={`flex flex-col items-end gap-3 transition-all duration-300 origin-bottom ${
            isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="bg-dark-deep border border-ebony-light text-platinum/85 px-3 py-1.5 rounded-lg text-sm font-semibold shadow-lg">
              Join Group
            </span>
            <button
              type="button"
              onClick={handleJoin}
              className="size-12 flex justify-center items-center rounded-full bg-dark-deep border border-ebony-light shadow-lg hover:bg-ebony hover:cursor-pointer active:scale-95 transition-transform"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 256 256"
                className="size-5 fill-platinum/85"
              >
                <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm40-88a8,8,0,0,1-8,8H136v24a8,8,0,0,1-16,0V136H96a8,8,0,0,1,0-16h24V96a8,8,0,0,1,16,0v24h24A8,8,0,0,1,168,128Z" />
              </svg>
            </button>
          </div>
          <div className="flex items-center gap-3">
            <span className="bg-dark-deep border border-ebony-light text-platinum/85 px-3 py-1.5 rounded-lg text-sm font-semibold shadow-lg">
              Create Group
            </span>
            <button
              type="button"
              onClick={handleCreate}
              className="size-12 flex justify-center items-center rounded-full bg-dark-deep border border-ebony-light shadow-lg hover:bg-ebony hover:cursor-pointer active:scale-95 transition-transform"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 256 256"
                className="size-5 fill-platinum/85"
              >
                <path d="M227.31,73.37,182.63,28.68a16,16,0,0,0-22.63,0L36.69,152A15.86,15.86,0,0,0,32,163.31V208a16,16,0,0,0,16,16H92.69A15.86,15.86,0,0,0,104,219.31L227.31,96a16,16,0,0,0,0-22.63ZM92.69,208H48V163.31l88-88L180.69,120ZM192,108.68,147.31,64l24-24L216,84.68Z" />
              </svg>
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`size-12 flex justify-center items-center rounded-full shadow-xl hover:cursor-pointer active:scale-95 transition-all duration-300 ${
            isOpen ? 'bg-dark-deep border border-ebony-light rotate-45' : 'bg-platinum/85'
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 640 640"
            className={`size-6 transition-colors duration-300 ${isOpen ? 'fill-platinum/85' : 'fill-dark-charcoal'}`}
          >
            <path d="M352 128L352 96L288 96L288 288L96 288L96 352L288 352L288 544L352 544L352 352L544 352L544 288L352 288L352 128z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
