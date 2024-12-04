// TextInputComponent.jsx
import { MantineProvider, TextInput } from "@mantine/core"

export default function TextInputComponent({ fieldname, rightIcon, value, onChange }) {
    return (
        <MantineProvider
            withGlobalStyles
            withNormalizeCSS
        >
            <TextInput
                placeholder={fieldname}
                rightSection={rightIcon}
                value={value}
                onChange={onChange}
                styles={{
                    input: { borderRadius: '32px', padding: '16px 32px 16px 24px' },
                    section: { padding: '0px 8px 0px 8px' }
                }}
            />
        </MantineProvider>
    )
}