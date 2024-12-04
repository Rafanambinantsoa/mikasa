import React from 'react';
import { Menu, Indicator, Text, Divider } from '@mantine/core';
import { Notification } from 'iconsax-react';

const NotificationMenu = ({ notifications }) => (
    <Menu shadow="md" width={250}>
        <Menu.Target>
            <Indicator color="red" size={8} offset={5} position="top-end">
                <Notification size={24} style={{ cursor: 'pointer' }} />
            </Indicator>
        </Menu.Target>
        <Menu.Dropdown>
            <Text size="sm" className="bold-title" m="sm">
                Notifications
            </Text>
            {/* Render notifications */}
            {notifications.length > 0 ? (
                notifications.map((notification) => (
                    <React.Fragment key={notification.id}> {/* Add key here */}
                        <Divider />
                        <Menu.Item key={notification.id}>{notification.message}</Menu.Item> {/* Add key here */}
                    </React.Fragment>
                ))
            ) : (
                <Menu.Item>Pas de nouvelles notifications</Menu.Item>
            )}
        </Menu.Dropdown>
    </Menu>
);

export default NotificationMenu;
