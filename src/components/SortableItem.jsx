import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, Text } from '@mantine/core';

export function SortableItem({ id, task }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    if (!task) return null;

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
        >
            <Card
                withBorder
                radius="md"
                mb="xs"
                shadow="xs"
            >
                <Text fw={500}>{task.nom_tache}</Text>
                <Text size="xs" c="dimmed">
                    Ouvrage: {task.ouvrage?.nom_ouvrage || 'Non spécifié'}
                </Text>
            </Card>
        </div>
    );
}