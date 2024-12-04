import React, { useState, useEffect } from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
} from '@dnd-kit/core';
import {
    SortableContext,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Card, Group, Text } from '@mantine/core';
import { SortableItem } from './SortableItem';
import { useTaskStore } from '../stores/taskStore';
import { Droppable } from './Droppable';

const STATE_MAPPING = {
    todo: 'en attente',
    inProgress: 'en cours',
    done: 'termine'
};

const COLUMN_TITLES = {
    todo: 'À faire',
    inProgress: 'En cours',
    done: 'Terminé'
};

export default function KanbanBoard({ project, onRefresh }) {
    const [columns, setColumns] = useState({
        todo: [],
        inProgress: [],
        done: []
    });
    const [activeId, setActiveId] = useState(null);
    const [activeTask, setActiveTask] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);

    const { updateTask } = useTaskStore();

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor)
    );

    useEffect(() => {
        // Only update columns if not in the middle of a task update
        if (!isUpdating) {
            const validatedDevis = project.devis.find(devis => devis.etat_devis === 'validé');
            const allTasks = validatedDevis?.ouvrages.flatMap(work => {
                return (work.taches || []).map(task => ({
                    ...task,
                    ouvrage: work
                }));
            }) || [];

            const categorizedTasks = {
                todo: allTasks.filter(task => task.etat_tache === 'en attente'),
                inProgress: allTasks.filter(task => task.etat_tache === 'en cours'),
                done: allTasks.filter(task => task.etat_tache === 'termine')
            };

            setColumns(categorizedTasks);
        }
    }, [project, isUpdating]);

    const handleDragStart = (event) => {
        const { active } = event;
        setActiveId(active.id);

        const sourceColumnId = Object.keys(columns).find(columnId =>
            columns[columnId].some(task => task.id.toString() === active.id)
        );
        const task = columns[sourceColumnId].find(t => t.id.toString() === active.id);
        setActiveTask(task);
    };

    const handleDragEnd = async (event) => {
        const { active, over } = event;
        setActiveId(null);
        setActiveTask(null);

        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        const sourceColumnId = Object.keys(columns).find(columnId =>
            columns[columnId].some(task => task.id.toString() === activeId)
        );

        const destinationColumnId = overId;

        // Prevent drag-drop if the task is dropped onto the same column
        if (sourceColumnId === destinationColumnId) return;

        if (sourceColumnId && destinationColumnId && columns[destinationColumnId]) {
            const task = columns[sourceColumnId].find(t => t.id.toString() === activeId);

            try {
                setIsUpdating(true);
                // Update local state first (optimistic update)
                const newColumns = { ...columns };
                newColumns[sourceColumnId] = newColumns[sourceColumnId].filter(
                    t => t.id !== task.id
                );

                // Ensure destination column is an array before spreading
                newColumns[destinationColumnId] = [
                    ...(newColumns[destinationColumnId] || []),
                    { ...task, etat_tache: STATE_MAPPING[destinationColumnId] }
                ];

                setColumns(newColumns);
                // Prepare the update payload with all required fields
                const updatePayload = {
                    ouvrage_id: task.ouvrage_id,
                    nom_tache: task.nom_tache,
                    description_tache: task.description_tache,
                    date_debut_prevue: task.date_debut_prevue,
                    date_fin_prevue: task.date_fin_prevue,
                    date_debut_reelle: task.date_debut_reelle,
                    date_fin_reelle: task.date_fin_reelle,
                    etat_tache: STATE_MAPPING[destinationColumnId],
                    budget_previsionnel: task.budget_previsionnel,
                    budget_reel: task.budget_reel
                };

                // Update the task state in the backend
                await updateTask(task.id, updatePayload);

                // Only trigger refresh after a short delay to allow for animation
                setTimeout(() => {
                    if (onRefresh) {
                        onRefresh();
                    }
                    setIsUpdating(false);
                }, 500);

            } catch (error) {
                console.error('Error updating task state:', error);
                // Revert the optimistic update on error
                setIsUpdating(false);
                if (onRefresh) {
                    onRefresh();
                }
            }
        }
    };


    const handleDragCancel = () => {
        setActiveId(null);
        setActiveTask(null);
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
        >
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: '16px'
            }}>
                {Object.entries(columns).map(([columnId, tasks]) => (
                    <Droppable key={columnId} id={columnId}>
                        <Card
                            withBorder
                            radius="md"
                            style={{
                                flex: 1,
                                minHeight: '400px',
                                marginBottom: '16px'
                            }}
                        >
                            <Group justify="space-between" mb="md">
                                <Text fw={500}>{COLUMN_TITLES[columnId]}</Text>
                                <Text c="dimmed" size="sm">
                                    {tasks.length} tâches
                                </Text>
                            </Group>

                            <SortableContext
                                items={tasks.map(task => task.id.toString())}
                                strategy={verticalListSortingStrategy}
                            >
                                <div style={{ minHeight: '100px' }}>
                                    {tasks.map((task) => (
                                        <SortableItem
                                            key={task.id}
                                            id={task.id.toString()}
                                            task={task}
                                        />
                                    ))}
                                </div>
                            </SortableContext>
                        </Card>
                    </Droppable>
                ))}
            </div>

            <DragOverlay>
                {activeTask ? (
                    <Card
                        withBorder
                        radius="md"
                        mb="xs"
                        shadow="xs"
                    >
                        <Text fw={500}>{activeTask.nom_tache}</Text>
                        <Text size="xs" c="dimmed">
                            Ouvrage: {activeTask.ouvrage?.nom_ouvrage || 'Non spécifié'}
                        </Text>
                    </Card>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}