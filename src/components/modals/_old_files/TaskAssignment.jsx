import { Modal, MultiSelect, Group, Button, Avatar } from "@mantine/core";

export default function TaskAssignment() {
    return (
        <Modal
            opened={opened}
            onClose={close}
            title={`Assigner un ouvrier à ${task.nom_tache}`}
            size="md"
        >
            <MultiSelect
                data={data}
                value={selectedWorkers}
                onChange={setSelectedWorkers}
                label="Sélectionner les ouvriers"
                placeholder="Choisir les ouvriers"
                searchable
                nothingFound="Aucun ouvrier trouvé"
                maxDropdownHeight={200}
                renderOption={({ option, defaultProps }) => (
                    <div {...defaultProps}>
                        <Group>
                            <Avatar src={option.photo} radius="xl" size="sm" />
                            <div>{option.label}</div>
                        </Group>
                    </div>
                )}
            />
            <Group position="right" mt="md">
                <Button variant="light" onClick={close}>Annuler</Button>
                <Button onClick={handleSubmit}>Confirmer</Button>
            </Group>
        </Modal>
    )
}