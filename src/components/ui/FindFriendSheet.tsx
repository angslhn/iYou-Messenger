import { useState } from 'react';

import api from '../../lib/axios';

import BottomSheet from './BottomSheet';
import UserResultCard from './UserResultCard';
import CodeInput from '../elements/CodeInput';
import SubmitButton from '../elements/SubmitButton';

import type { JSX, SubmitEvent } from 'react';

type Tab = 'username' | 'phone' | 'pin';

type UserResult = {
  id: string;
  username: string;
  fullname: string | null;
  avatar_url: string | null;
  about: string | null;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

const TABS: { key: Tab; label: string }[] = [
  { key: 'username', label: 'Username' },
  { key: 'phone', label: 'Phone' },
  { key: 'pin', label: 'PIN' },
];

export default function FindFriendSheet({ isOpen, onClose }: Props): JSX.Element {
  const [tab, setTab] = useState<Tab>('username');

  const [usernameQuery, setUsernameQuery] = useState('');
  const [usernameResults, setUsernameResults] = useState<UserResult[]>([]);
  const [usernameLoading, setUsernameLoading] = useState(false);
  const [usernameSearched, setUsernameSearched] = useState(false);

  const [phone, setPhone] = useState('');
  const [phoneResult, setPhoneResult] = useState<UserResult | null>(null);
  const [phoneLoading, setPhoneLoading] = useState(false);
  const [phoneNotFound, setPhoneNotFound] = useState(false);

  const [pin, setPin] = useState('');
  const [pinResult, setPinResult] = useState<UserResult | null>(null);
  const [pinLoading, setPinLoading] = useState(false);
  const [pinNotFound, setPinNotFound] = useState(false);

  const resetAll = () => {
    setUsernameQuery('');
    setUsernameResults([]);
    setUsernameSearched(false);
    setPhone('');
    setPhoneResult(null);
    setPhoneNotFound(false);
    setPin('');
    setPinResult(null);
    setPinNotFound(false);
  };

  const handleTabSwitch = (newTab: Tab) => {
    setTab(newTab);
  };

  const handleClose = () => {
    resetAll();
    onClose();
  };

  const handleUsernameSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!usernameQuery.trim() || usernameQuery.trim().length < 3) return;

    setUsernameLoading(true);
    setUsernameResults([]);
    setUsernameSearched(false);

    try {
      const { data } = await api.get('/users/search', {
        params: { q: usernameQuery.trim() },
      });
      setUsernameResults(data);
    } catch {
      /** empty */
    } finally {
      setUsernameSearched(true);
      setUsernameLoading(false);
    }
  };

  const handlePhoneSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!phone.trim()) return;

    setPhoneLoading(true);
    setPhoneResult(null);
    setPhoneNotFound(false);

    try {
      const { data } = await api.post('/users/find/phone', { phone });

      if (data) {
        setPhoneResult(data);
      } else {
        setPhoneNotFound(true);
      }
    } catch {
      setPhoneNotFound(true);
    } finally {
      setPhoneLoading(false);
    }
  };

  const handlePinSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (pin.length !== 8) return;

    setPinLoading(true);
    setPinResult(null);
    setPinNotFound(false);

    try {
      const { data } = await api.post('/users/find/pin', { pin });
      setPinResult(data);
    } catch {
      setPinNotFound(true);
    } finally {
      setPinLoading(false);
    }
  };

  const handleAction = async (identifier: string, actionType: 'send_request' | 'add_by_pin') => {
    try {
      if (actionType === 'add_by_pin') {
        await api.post('/friendships/pin', { pin: identifier });
      } else {
        await api.post('/friendships/request', { identifier });
      }

      handleClose();
    } catch {
      /** empty */
    }
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={handleClose} title="Find Friend">
      <div className="flex gap-1.5 mb-4 p-1 bg-dark-deep rounded-xl border border-ebony-light">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => handleTabSwitch(key)}
            className={`flex-1 py-2 rounded-lg font-semibold text-sm transition-all hover:cursor-pointer ${
              tab === key
                ? 'bg-platinum/85 text-dark-charcoal'
                : 'text-platinum/60 hover:text-platinum/85'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      {tab === 'username' && (
        <div className="flex flex-col gap-4">
          <form onSubmit={handleUsernameSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <p className="text-sm text-platinum/60 text-center">Search users by their username</p>
              <div className="relative">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  className="size-4 absolute left-3 top-1/2 -translate-y-1/2 fill-platinum/40 pointer-events-none"
                >
                  <path d="M18.031 16.6168L22.3137 20.8995L20.8995 22.3137L16.6168 18.031C15.0769 19.263 13.124 20 11 20C6.032 20 2 15.968 2 11C2 6.032 6.032 2 11 2C15.968 2 20 6.032 20 11C20 13.124 19.263 15.0769 18.031 16.6168ZM16.0247 15.8748C17.2475 14.6146 18 12.8956 18 11C18 7.1325 14.8675 4 11 4C7.1325 4 4 7.1325 4 11C4 14.8675 7.1325 18 11 18C12.8956 18 14.6146 17.2475 15.8748 16.0247L16.0247 15.8748Z" />
                </svg>
                <input
                  type="text"
                  placeholder="e.g. septian_dev"
                  value={usernameQuery}
                  onChange={(e) => {
                    setUsernameQuery(e.target.value);
                    if (usernameSearched) {
                      setUsernameResults([]);
                      setUsernameSearched(false);
                    }
                  }}
                  minLength={3}
                  maxLength={32}
                  className="w-full h-12 pl-10 pr-4 outline-none rounded-xl bg-dark-deep border border-ebony-light text-platinum/85 placeholder:text-platinum/35 text-sm focus:border-platinum/40 transition-all"
                />
              </div>
              <span className="px-1 text-xs text-platinum/40">
                Minimum 3 characters. Up to 20 results will be shown.
              </span>
            </div>
            <SubmitButton label="Search" mt={0} is_loading={usernameLoading} />
          </form>
          {usernameSearched && (
            <div className="flex flex-col mt-1">
              {usernameResults.length > 0 ? (
                <>
                  <h3 className="text-xs font-semibold text-platinum/50 tracking-wider mb-1">
                    RESULTS ({usernameResults.length})
                  </h3>
                  <div className="flex flex-col max-h-72 overflow-y-auto [scrollbar-width:none]">
                    {usernameResults.map((user) => (
                      <UserResultCard
                        key={user.id}
                        user={user}
                        actionType="send_request"
                        onAction={() => handleAction(user.username, 'send_request')}
                      />
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-1 py-4">
                  <span className="text-platinum/40 text-sm">No user found</span>
                  <span className="text-platinum/30 text-xs">Try a different username</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      {tab === 'phone' && (
        <form onSubmit={handlePhoneSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <p className="text-sm text-platinum/60 text-center">
              Enter phone number in international format
            </p>
            <input
              type="tel"
              placeholder="+6281234567890"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="h-12 outline-none rounded-xl px-4 bg-dark-deep border border-ebony-light text-platinum/85 placeholder:text-platinum/35 text-sm tracking-wide focus:border-platinum/40 transition-all"
            />
            <span className="px-1 text-xs text-platinum/40">
              Start with country code, e.g. +62 for Indonesia
            </span>
          </div>
          <SubmitButton label="Find Friend" mt={0} is_loading={phoneLoading} />
          {phoneResult && (
            <div className="mt-1">
              <h3 className="text-xs font-semibold text-platinum/50 tracking-wider mb-1">RESULT</h3>
              <UserResultCard
                user={phoneResult}
                actionType="send_request"
                onAction={() => handleAction(phoneResult.username, 'send_request')}
              />
            </div>
          )}
          {phoneNotFound && (
            <div className="flex flex-col items-center gap-1 py-2">
              <span className="text-platinum/40 text-sm">No user found</span>
              <span className="text-platinum/30 text-xs">Double check the phone number</span>
            </div>
          )}
        </form>
      )}
      {tab === 'pin' && (
        <form onSubmit={handlePinSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-3">
            <p className="text-sm text-platinum/60 text-center">
              Enter the 8-character PIN from your friend
            </p>
            <CodeInput type="pin" length={8} onComplete={(code) => setPin(code)} boxSize="sm" />
          </div>
          <SubmitButton label="Find Friend" mt={0} is_loading={pinLoading} />
          {pinResult && (
            <div className="mt-1">
              <h3 className="text-xs font-semibold text-platinum/50 tracking-wider mb-1">RESULT</h3>
              <UserResultCard
                user={pinResult}
                actionType="add_by_pin"
                onAction={() => handleAction(pin, 'add_by_pin')}
              />
            </div>
          )}
          {pinNotFound && (
            <div className="flex flex-col items-center gap-1 py-2">
              <span className="text-platinum/40 text-sm">No user found</span>
              <span className="text-platinum/30 text-xs">Double check the PIN</span>
            </div>
          )}
        </form>
      )}
    </BottomSheet>
  );
}
