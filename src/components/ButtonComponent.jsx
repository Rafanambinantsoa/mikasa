import { Button } from '@mantine/core';

export default function ButtonComponent({ fieldname, rightIcon, onClick, disabled }) {
    return (
        <Button
            onClick={onClick}
            rightSection={rightIcon}
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
            disabled={disabled}
        >
            {fieldname}
        </Button>
    );
}