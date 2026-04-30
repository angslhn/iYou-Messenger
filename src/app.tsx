import { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import PublicRoute from './routes/PublicRoute';
import ProtectedRoute from './routes/ProtectedRoute';
import PublicWithTokenRoute from './routes/PublicWithTokenRoute';

import { useDevice } from './hooks/useDevice';
import { useAuthStore } from './stores/useAuthStore';
import { useSocialStore } from './stores/useSocialStore';

import GetStarted from './pages/explore/GetStarted';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Verify from './pages/auth/Verify';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import Chat from './pages/main/chat/Chat';
import ChatRoom from './pages/main/chat/ChatRoom';
import UserProfil from './pages/main/user/UserProfile';
import ArchivedChats from './pages/main/chat/ArchivedChats';
import Group from './pages/main/group/Group';
import GroupRoom from './pages/main/group/GroupRoom';
import GroupProfile from './pages/main/group/GroupProfile';
import ArchivedGroups from './pages/main/group/ArchivedGroups';
import Story from './pages/main/Story';
import Friend from './pages/main/Friend';
import Account from './pages/main/account/Account';
import TooSmallViewport from './pages/other/TooSmallViewport';
import NotSupportedViewport from './pages/other/NotSupportedViewport';

import ConfirmAlert from './components/ui/ConfirmAlert';

import type { JSX } from 'react';

export default function App(): JSX.Element {
  const [width, setWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 0);

  const { isMobile } = useDevice();
  const { checkSession } = useAuthStore();
  const { fetchInitialCounts } = useSocialStore();

  useEffect(() => {
    const checkWidth = () => {
      setWidth(window.innerWidth);
    };

    window.addEventListener('resize', checkWidth);

    return () => {
      window.removeEventListener('resize', checkWidth);
    };
  }, []);

  useEffect(() => {
    if (!isMobile) return;

    const initApp = async () => {
      await checkSession();

      if (useAuthStore.getState().isLoggedIn) {
        await fetchInitialCounts();
      }
    };

    initApp();
  }, [checkSession, fetchInitialCounts, isMobile]);

  if (!isMobile) {
    return <NotSupportedViewport />;
  }

  if (width < 320) {
    return <TooSmallViewport />;
  }

  return (
    <BrowserRouter>
      <Toaster position="top-center" />
      <ConfirmAlert />
      <Routes>
        {/* Halaman landing page */}
        <Route path="/" element={<GetStarted />} />

        {/* Halaman autentikasi */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify" element={<Verify />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Route>

        {/* Halaman mengatur ulang kata sandi */}
        <Route path="/reset-password/:token" element={<PublicWithTokenRoute />}>
          <Route index element={<ResetPassword />} />
        </Route>

        {/* Halaman utama */}
        <Route element={<ProtectedRoute />}>
          <Route path="/chat" element={<Chat />} />
          <Route path="/chat/open" element={<ChatRoom />} />
          <Route path="/chat/profile" element={<UserProfil />} />
          <Route path="/chat/archived" element={<ArchivedChats />} />
          <Route path="/group" element={<Group />} />
          <Route path="/group/open" element={<GroupRoom />} />
          <Route path="/group/profile" element={<GroupProfile />} />
          <Route path="/group/archived" element={<ArchivedGroups />} />
          <Route path="/story" element={<Story />} />
          <Route path="/friend" element={<Friend />} />
          <Route path="/account" element={<Account />} />
          <Route path="/user/:userId" element={<UserProfil />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
