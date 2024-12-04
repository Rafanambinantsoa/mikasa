import React from 'react';
import { NavLink, AppShell } from '@mantine/core';
import { Link } from 'react-router-dom';

const Navbar = ({ mainNavItems, settingsItem }) => {
    const renderNavLink = ({ icon, label, path }) => (
        <NavLink
            key={label}
            leftSection={icon}
            label={label}
            component={Link}
            to={path}
            p="md"
            styles={{
                root: {
                    borderRadius: '0.75rem',
                },
            }}
        />
    );

    return (
        <AppShell.Navbar p="md">
            <AppShell.Section grow my="md">
                {mainNavItems.map(renderNavLink)}
            </AppShell.Section>

            <AppShell.Section>
                {settingsItem && renderNavLink(settingsItem)}
            </AppShell.Section>
        </AppShell.Navbar>
    );
};

export default Navbar;
