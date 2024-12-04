import { useDisclosure } from "@mantine/hooks";
import { useData } from "../../../context/DataProvider";
import { useState } from "react";
import { Avatar, Button, Group, Modal, MultiSelect } from "@mantine/core";

export default function TaskAssignmentModal({ task, onAssign }) {
    const [opened, { open, close }] = useDisclosure(false);
    const { users } = useData();
    const [selectedWorkers, setSelectedWorkers] = useState([]);

    const handleSubmit = () => {
        onAssign(task.id, selectedWorkers);
        close();
        setSelectedWorkers([]);
    };

    const data = users.map((member) => ({
        value: member.id.toString(),
        label: `${member.firstname} ${member.name}`,
        photo: member.photo
    }));

    return (
        <>
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
        </>
    );
};