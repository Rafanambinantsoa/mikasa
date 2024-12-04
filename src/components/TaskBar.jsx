import { Avatar, Group, Tooltip } from "@mantine/core";

// Enhanced Task component to show assigned workers
export default function TaskBar({ task, workers }) {
    return (
        <Tooltip
            label={
                <div>
                    <div>{task.nom_tache}</div>
                    {workers?.length > 0 && (
                        <div>
                            <div>Ouvriers assignés:</div>
                            <Group spacing="xs">
                                {workers.map((worker) => (
                                    <Avatar
                                        key={worker.id}
                                        src={worker.photo}
                                        radius="xl"
                                        size="sm"
                                        title={`${worker.firstname} ${worker.name}`}
                                    />
                                ))}
                            </Group>
                        </div>
                    )}
                </div>
            }
            position="top"
            withArrow
        >
            <div style={{ height: '100%', width: '100%' }}>
                {task.name}
            </div>
        </Tooltip>
    );
};