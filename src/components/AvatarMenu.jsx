import React from 'react';
import { Menu, Avatar, Divider } from '@mantine/core';
import { User, Logout } from 'iconsax-react';

const AvatarMenu = () => (
    <Menu shadow="md" width={200} withArrow>
        <Menu.Target>
            <Avatar
                src="path-to-avatar.jpg" // Replace with actual path
                radius="xl"
                alt="User avatar"
                size="md"
                style={{ cursor: 'pointer' }}
            />
        </Menu.Target>
        <Menu.Dropdown>
            <Menu.Item icon={<User size={16} />}>Profil</Menu.Item>
            <Divider />
            <Menu.Item color="red" icon={<Logout size={16} />}>
                Se déconnecter
            </Menu.Item>
        </Menu.Dropdown>
    </Menu>
);

export default AvatarMenu;
