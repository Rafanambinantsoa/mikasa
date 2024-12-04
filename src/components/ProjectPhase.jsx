import { Button } from '@mantine/core';

export default function ProjectPhase({ fieldname, leftIcon, onClick, variant, color }) {
    return (
        <Button
            onClick={onClick}
            leftSection={leftIcon}
            styles={{
                root: {
                    borderRadius: '32px',
                    padding: '0px 24px 0px 24px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                },
                rightIcon: { marginLeft: '8px' },
            }}
            variant={variant}
            color={color}
        >
            {fieldname}
        </Button>
    );
}