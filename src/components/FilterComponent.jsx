import { useState } from 'react';
import { Popover, MultiSelect } from '@mantine/core';
import ButtonComponent from '../components/ButtonComponent';
import { Filter } from 'iconsax-react';

export default function FilterComponent({ filterCategory, onChange, value }) {
    const [opened, setOpened] = useState(false);

    const handleChange = (selectedValues) => {
        onChange(selectedValues);
    };

    return (
        <Popover
            width={300}
            position="bottom"
            withArrow
            shadow="md"
            opened={opened}
            onChange={setOpened}
            closeOnClickOutside
            trapFocus
        >
            <Popover.Target>
                <div onClick={() => setOpened((prev) => !prev)}>
                    <ButtonComponent
                        fieldname={'Filtrer'}
                        rightIcon={<Filter size="16" />}
                        variant={value?.length > 0 ? "filled" : "default"}
                    />
                </div>
            </Popover.Target>

            <Popover.Dropdown>
                <MultiSelect
                    label="Filtrer par catégorie"
                    placeholder="Sélectionnez"
                    data={filterCategory}
                    value={value}
                    onChange={handleChange}
                    searchable
                    clearable
                    withinPortal={false}
                    comboboxProps={{
                        withinPortal: false,
                        onDropdownClose: (e) => {
                            e?.preventDefault();
                            e?.stopPropagation();
                        },
                        position: "bottom",
                        shadow: "md",
                        width: "target"
                    }}
                />
            </Popover.Dropdown>
        </Popover>
    );
}