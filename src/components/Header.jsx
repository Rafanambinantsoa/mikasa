import React from 'react';
import { Group, Burger, AppShell } from '@mantine/core';
import NotificationMenu from './NotificationMenu';
import AvatarMenu from './AvatarMenu';

import '../styles/header.css'

const Header = ({ mobileOpened, desktopOpened, toggleMobile, toggleDesktop, notifications }) => (
    <AppShell.Header>
        <Group h="100%" px="md" align="center" style={{ justifyContent: 'space-between' }}>
            <Group>
                <Burger
                    opened={mobileOpened}
                    onClick={toggleMobile}
                    hiddenFrom="sm"
                    size="sm"
                />
                <Burger
                    opened={desktopOpened}
                    onClick={toggleDesktop}
                    visibleFrom="sm"
                    size="sm"
                />
                <div className="logo">
                    <h2 className="bold-title">ArchiPilot</h2>
                </div>
            </Group>

            {/* Right side group: notification and avatar */}
            <Group className="group-right" spacing="md">
                <NotificationMenu notifications={notifications} style={{ margin: 0, padding: 0 }} />
                <AvatarMenu />
            </Group>

        </Group>
    </AppShell.Header>
);

export default Header;
