import { AppShell } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import React, { useEffect } from 'react';
import './App.css';
import Header from './components/Header';
import Navbar from './components/Navbar';
import RouterSwitcher from './components/RouterSwitcher';
import { useAuth } from './context/AuthProvider';
import { navbarItems } from './data/navbarItems';
import { notifications } from './data/notificationData';
import Login from './pages/Login';
import LoadingScreen from './components/LoadingScreen';

function App() {
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);
  const { loading, checkAuth, user } = useAuth();

  const mainNavItems = navbarItems.filter((item) => item.label !== 'Paramètres');
  const settingsItem = navbarItems.find((item) => item.label === 'Paramètres');

  useEffect(() => {
    checkAuth();
  }, []);

  return loading ? <LoadingScreen /> : !user ? <Login /> : (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 300,
        breakpoint: 'sm',
        collapsed: { mobile: !mobileOpened, desktop: !desktopOpened },
      }}
      padding="md"
    >
      <Header
        mobileOpened={mobileOpened}
        desktopOpened={desktopOpened}
        toggleMobile={toggleMobile}
        toggleDesktop={toggleDesktop}
        notifications={notifications}
      />
      <Navbar mainNavItems={mainNavItems} settingsItem={settingsItem} />
      <AppShell.Main className="main-element">
        <RouterSwitcher />
      </AppShell.Main>
    </AppShell>
  );
}

export default App;
