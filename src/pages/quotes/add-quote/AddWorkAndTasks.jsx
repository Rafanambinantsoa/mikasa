import { Text, TextInput, Textarea, Select, ActionIcon, Paper, Stack, Group } from '@mantine/core';
import { Plus, Trash } from 'lucide-react';

const AddWorkAndTasks = ({ form }) => {
    const { values, setFieldValue } = form;

    const addWork = () => {
        const newWorkId = Math.max(0, ...values.works.map(w => w.id)) + 1;
        setFieldValue('works', [
            ...values.works,
            {
                id: newWorkId,
                name: '',
                description_ouvrage: '',
                tasks: [{
                    id: 1,
                    name: '',
                    budgets: [{
                        id: 1,
                        type: '',
                        unitPrice: '',
                        quantity: ''
                    }]
                }]
            }
        ]);
    };

    const removeWork = (ouvrage_id) => {
        if (values.works.length > 1) {
            setFieldValue('works', values.works.filter(work => work.id !== ouvrage_id));
        }
    };

    const addTask = (ouvrage_id) => {
        setFieldValue('works', values.works.map(work => {
            if (work.id === ouvrage_id) {
                const newTaskId = Math.max(0, ...work.tasks.map(t => t.id)) + 1;
                return {
                    ...work,
                    tasks: [
                        ...work.tasks,
                        {
                            id: newTaskId,
                            name: '',
                            budgets: [{
                                id: 1,
                                type: '',
                                unitPrice: '',
                                quantity: ''
                            }]
                        }
                    ]
                };
            }
            return work;
        }));
    };

    const removeTask = (ouvrage_id, tache_id) => {
        setFieldValue('works', values.works.map(work => {
            if (work.id === ouvrage_id && work.tasks.length > 1) {
                return {
                    ...work,
                    tasks: work.tasks.filter(task => task.id !== tache_id)
                };
            }
            return work;
        }));
    };

    const addBudget = (ouvrage_id, tache_id) => {
        setFieldValue('works', values.works.map(work => {
            if (work.id === ouvrage_id) {
                return {
                    ...work,
                    tasks: work.tasks.map(task => {
                        if (task.id === tache_id && task.budgets.length < 4) {
                            const newBudgetId = Math.max(0, ...task.budgets.map(b => b.id)) + 1;
                            return {
                                ...task,
                                budgets: [
                                    ...task.budgets,
                                    {
                                        id: newBudgetId,
                                        type: '',
                                        unitPrice: '',
                                        quantity: ''
                                    }
                                ]
                            };
                        }
                        return task;
                    })
                };
            }
            return work;
        }));
    };

    // Helper function to get available budget types for a task
    const getAvailableBudgetTypes = (task, currentBudgetId) => {
        const allTypes = [
            { value: 'budget_mo_previsionnel', label: 'Main d\'oeuvre' },
            { value: 'budget_materiaux_previsionnel', label: 'Matériaux' },
            { value: 'budget_materiel_previsionnel', label: 'Matériel' },
            { value: 'budget_sous_traitance_previsionnel', label: 'Sous-traitance' },
        ];
        const usedTypes = task.budgets
            .filter(b => b.id !== currentBudgetId) // Exclude current budget's type
            .map(b => b.type)
            .filter(t => t !== '');
        return allTypes.filter(type => !usedTypes.includes(type.value));
    };

    const removeBudget = (ouvrage_id, tache_id, budgetId) => {
        setFieldValue('works', values.works.map(work => {
            if (work.id === ouvrage_id) {
                return {
                    ...work,
                    tasks: work.tasks.map(task => {
                        if (task.id === tache_id && task.budgets.length > 1) {
                            return {
                                ...task,
                                budgets: task.budgets.filter(budget => budget.id !== budgetId)
                            };
                        }
                        return task;
                    })
                };
            }
            return work;
        }));
    };

    const updateWork = (ouvrage_id, field, value) => {
        setFieldValue('works', values.works.map(work =>
            work.id === ouvrage_id ? { ...work, [field]: value } : work
        ));
    };

    const updateTask = (ouvrage_id, tache_id, value) => {
        setFieldValue('works', values.works.map(work => {
            if (work.id === ouvrage_id) {
                return {
                    ...work,
                    tasks: work.tasks.map(task =>
                        task.id === tache_id ? { ...task, name: value } : task
                    )
                };
            }
            return work;
        }));
    };

    const updateBudget = (ouvrage_id, tache_id, budgetId, field, value) => {
        setFieldValue('works', values.works.map(work => {
            if (work.id === ouvrage_id) {
                return {
                    ...work,
                    tasks: work.tasks.map(task => {
                        if (task.id === tache_id) {
                            return {
                                ...task,
                                budgets: task.budgets.map(budget =>
                                    budget.id === budgetId ? { ...budget, [field]: value } : budget
                                )
                            };
                        }
                        return task;
                    })
                };
            }
            return work;
        }));
    };

    return (
        <Stack spacing="xl">
            {values.works.map((work) => (
                <Paper key={work.id} p="md" withBorder>
                    <Stack spacing="md">
                        <Group position="apart">
                            <Text className="bold-title" size="lg">Ouvrage {work.id}</Text>
                            <ActionIcon
                                color="red"
                                variant="subtle"
                                onClick={() => removeWork(work.id)}
                                disabled={values.works.length === 1}
                            >
                                <Trash size={18} />
                            </ActionIcon>
                        </Group>

                        <TextInput
                            label="Nom de l'ouvrage"
                            placeholder="Nom de l'ouvrage"
                            required
                            value={work.name}
                            onChange={(e) => updateWork(work.id, 'name', e.target.value)}
                        />

                        <Textarea
                            label="Description de l'ouvrage"
                            placeholder="Description de l'ouvrage"
                            value={work.description_ouvrage}
                            onChange={(e) => updateWork(work.id, 'description_ouvrage', e.target.value)}
                        />

                        <Stack spacing="md">
                            {work.tasks.map((task) => (
                                <Paper key={task.id} p="md" withBorder>
                                    <Stack spacing="md">
                                        <Group position="apart">
                                            <Text weight={500}>Tâche {task.id}</Text>
                                            <ActionIcon
                                                color="red"
                                                variant="subtle"
                                                onClick={() => removeTask(work.id, task.id)}
                                                disabled={work.tasks.length === 1}
                                            >
                                                <Trash size={18} />
                                            </ActionIcon>
                                        </Group>

                                        <TextInput
                                            placeholder="Nom de la tâche"
                                            required
                                            value={task.name}
                                            onChange={(e) => updateTask(work.id, task.id, e.target.value)}
                                        />

                                        <Stack spacing="xs">
                                            {task.budgets.map((budget) => (
                                                <Group key={budget.id} grow>
                                                    <Select
                                                        placeholder="Type"
                                                        data={getAvailableBudgetTypes(task, budget.id)}
                                                        value={budget.type}
                                                        onChange={(value) => updateBudget(work.id, task.id, budget.id, 'type', value)}
                                                        required
                                                    />
                                                    <TextInput
                                                        placeholder={budget.type === 'budget_mo_previsionnel' ? 'Tarif horaire' : 'Prix unitaire'}
                                                        rightSection='€'
                                                        value={budget.unitPrice}
                                                        onChange={(e) => updateBudget(work.id, task.id, budget.id, 'unitPrice', e.target.value)}
                                                        required
                                                    />
                                                    <TextInput
                                                        placeholder="Quantité"
                                                        rightSection={budget.type === 'budget_mo_previsionnel' ? 'h' : '€'}
                                                        value={budget.quantity}
                                                        onChange={(e) => updateBudget(work.id, task.id, budget.id, 'quantity', e.target.value)}
                                                        required
                                                    />
                                                    <ActionIcon
                                                        color="red"
                                                        variant="subtle"
                                                        onClick={() => removeBudget(work.id, task.id, budget.id)}
                                                        disabled={task.budgets.length === 1}
                                                    >
                                                        <Trash size={18} />
                                                    </ActionIcon>
                                                </Group>
                                            ))}
                                        </Stack>

                                        <Group justify="center">
                                            <ActionIcon
                                                size="lg"
                                                color="blue"
                                                variant="light"
                                                onClick={() => addBudget(work.id, task.id)}
                                                disabled={task.budgets.length >= 4}
                                                radius="xl"
                                            >
                                                <Plus size={20} />
                                            </ActionIcon>
                                        </Group>
                                    </Stack>
                                </Paper>
                            ))}
                        </Stack>

                        <Group justify="center">
                            <ActionIcon
                                size="lg"
                                color="blue"
                                variant="light"
                                onClick={() => addTask(work.id)}
                                radius="xl"
                            >
                                <Plus size={20} />
                            </ActionIcon>
                        </Group>
                    </Stack>
                </Paper>
            ))}

            <Group justify="center">
                <ActionIcon
                    size="lg"
                    color="blue"
                    variant="light"
                    onClick={addWork}
                    radius="xl"
                >
                    <Plus size={20} />
                </ActionIcon>
            </Group>
        </Stack>
    );
};

export default AddWorkAndTasks;