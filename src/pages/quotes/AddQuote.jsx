import { ActionIcon, Alert, Button, Group, Modal, Paper, ScrollArea, Select, Stack, Stepper, Table, Text, TextInput, Textarea, rem } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconCheck } from '@tabler/icons-react';
import { AlertCircle, Plus, Trash } from 'lucide-react';
import React, { useState } from 'react';
import { useQuoteStore } from '../../stores/quoteStore';

const AddQuote = ({ addOpened, closeAdd, projet_id, hasValidatedQuote, onQuoteAdded }) => {
    const [active, setActive] = useState(0);
    const { createQuote, getQuotes } = useQuoteStore()

    const form = useForm({
        initialValues: {
            projet_id: projet_id,
            date_creation: new Date().toISOString().split('T')[0],
            etat_devis: 'en attente',
            works: [{
                name: '',
                description_ouvrage: '',
                tasks: [{
                    name: '',
                    budgets: [{
                        type: 'budget_mo',
                        unitPrice: '',
                        quantity: ''
                    }]
                }]
            }]
        },
        validate: {
            works: {
                name: (value) => (!value ? 'Le nom est requis' : null),
                tasks: {
                    name: (value) => (!value ? 'Le nom est requis' : null),
                    budgets: {
                        unitPrice: (value) => (!value ? 'Le prix unitaire est requis' : null),
                        quantity: (value) => (!value ? 'La quantité est requise' : null)
                    }
                }
            }
        }
    });

    const isFormValid = () => {
        const works = form.values.works;
        return works.every(work =>
            work.name && work.tasks.every(task =>
                task.name && task.budgets.every(budget =>
                    budget.unitPrice && budget.quantity
                )
            )
        );
    };

    // Budget type mapping functions
    const getBudgetType = (type) => {
        const typeMap = {
            'budget_mo': "Main d'oeuvre",
            'budget_materiaux': "Matériaux",
            'budget_materiel': "Matériel",
            'budget_sous_traitance': "Sous-traitance"
        };
        return typeMap[type] || type;
    };

    const getBudgetSubtype = (type) => {
        const subtypeMap = {
            'budget_mo_previsionnel': 'budget_mo',
            'budget_materiaux_previsionnel': 'budget_materiaux',
            'budget_materiel_previsionnel': 'budget_materiel',
            'budget_sous_traitance_previsionnel': 'budget_sous_traitance'
        };
        return subtypeMap[type] || type;
    };

    // CRUD operations for works, tasks, and budgets
    const addWork = () => {
        form.insertListItem('works', {
            name: '',
            description_ouvrage: '',
            tasks: [{
                name: '',
                budgets: [{
                    type: 'budget_mo',
                    unitPrice: '',
                    quantity: ''
                }]
            }]
        });
    };

    const removeWork = (index) => {
        form.removeListItem('works', index);
    };

    const addTask = (workIndex) => {
        form.insertListItem(`works.${workIndex}.tasks`, {
            name: '',
            budgets: [{
                type: 'budget_mo',
                unitPrice: '',
                quantity: ''
            }]
        });
    };

    const removeTask = (workIndex, taskIndex) => {
        form.removeListItem(`works.${workIndex}.tasks`, taskIndex);
    };

    const addBudget = (workIndex, taskIndex) => {
        form.insertListItem(`works.${workIndex}.tasks.${taskIndex}.budgets`, {
            type: 'budget_mo',
            unitPrice: '',
            quantity: ''
        });
    };

    const removeBudget = (workIndex, taskIndex, budgetIndex) => {
        form.removeListItem(`works.${workIndex}.tasks.${taskIndex}.budgets`, budgetIndex);
    };

    const getAvailableBudgetTypes = (task, currentBudget) => {
        const usedTypes = task.budgets
            .filter(budget => budget !== currentBudget)
            .map(budget => budget.type);

        const allTypes = [
            { value: 'budget_mo', label: "Main d'oeuvre" },
            { value: 'budget_materiaux', label: "Matériaux" },
            { value: 'budget_materiel', label: "Matériel" },
            { value: 'budget_sous_traitance', label: "Sous-traitance" }
        ];

        return allTypes.filter(type => !usedTypes.includes(type.value));
    };

    const handleSave = async () => {
        console.log('Form values:', form.values);
        await createQuote({ ...form.values, montant_total: calculateBudgets(form.values.works) });
        notifications.show({
            title: 'Succès',
            message: 'Le devis a été créé avec succès!',
            color: 'teal',
            icon: <IconCheck style={{ width: rem(20), height: rem(20) }} />,
            autoClose: 5000, // Will close after 5 seconds
            withCloseButton: true,
            styles: (theme) => ({
                root: {
                    backgroundColor: theme.colors.teal[0],
                    borderColor: theme.colors.teal[6],
                },
                title: {
                    color: theme.colors.teal[9],
                },
                description_ouvrage: {
                    color: theme.colors.teal[9],
                },
                closeButton: {
                    color: theme.colors.teal[9],
                    '&:hover': {
                        backgroundColor: theme.colors.teal[1],
                    },
                },
            }),
        });
        await onQuoteAdded()
    };

    const calculateBudgets = (budgets) => {
        return budgets.reduce((acc, work) => acc + work.tasks.reduce((acc, task) => acc + task.budgets.reduce((acc, budget) => acc + parseFloat(budget.unitPrice) * parseFloat(budget.quantity), 0), 0), 0);
    };

    const renderSummaryTable = () => (
        <Table>
            <Table.Thead>
                <Table.Tr>
                    <Table.Th className='bold-title'>Ouvrage</Table.Th>
                    <Table.Th className='bold-title'>Tâche</Table.Th>
                    <Table.Th className='bold-title'>Type de budget</Table.Th>
                    <Table.Th className='bold-title'>Prix unitaire</Table.Th>
                    <Table.Th className='bold-title'>Quantité</Table.Th>
                    <Table.Th className='bold-title'>Total</Table.Th>
                </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
                {form.values.works.flatMap((work, workIndex) =>
                    work.tasks.flatMap((task, taskIndex) =>
                        task.budgets.map((budget, budgetIndex) => (
                            <Table.Tr key={`${workIndex}-${taskIndex}-${budgetIndex}`}>
                                <Table.Td>{work.name}</Table.Td>
                                <Table.Td>{task.name}</Table.Td>
                                <Table.Td>{getBudgetType(budget.type)}</Table.Td>
                                <Table.Td>{budget.unitPrice}€</Table.Td>
                                <Table.Td>{budget.quantity}</Table.Td>
                                <Table.Td>{(parseFloat(budget.unitPrice) * parseFloat(budget.quantity)).toFixed(2)}€</Table.Td>
                            </Table.Tr>
                        ))
                    )
                )}
            </Table.Tbody>
        </Table>
    );

    return (
        <Modal
            opened={addOpened}
            onClose={closeAdd}
            title={<Text size="xl" weight={700} className='bold-title'>Nouveau devis</Text>}
            size="90%"
            centered
        >
            {!hasValidatedQuote() &&
                <Stepper active={active} onStepClick={setActive}>
                    <Stepper.Step label="Créer les ouvrages et les tâches">
                        <ScrollArea h={500} offsetScrollbars>
                            <Stack spacing="xl">
                                {form.values.works.map((work, workIndex) => (
                                    <Paper key={workIndex} p="md" withBorder>
                                        <Stack spacing="md">
                                            <Group position="apart">
                                                <Text weight={700}>Ouvrage {workIndex + 1}</Text>
                                                <ActionIcon
                                                    color="red"
                                                    variant="subtle"
                                                    onClick={() => removeWork(workIndex)}
                                                    disabled={form.values.works.length === 1}
                                                >
                                                    <Trash size={18} />
                                                </ActionIcon>
                                            </Group>

                                            <TextInput
                                                label="Nom de l'ouvrage"
                                                required
                                                {...form.getInputProps(`works.${workIndex}.name`)}
                                            />

                                            <Textarea
                                                label="Description"
                                                {...form.getInputProps(`works.${workIndex}.description_ouvrage`)}
                                            />

                                            {work.tasks.map((task, taskIndex) => (
                                                <Paper key={taskIndex} p="md" withBorder>
                                                    <Stack spacing="md">
                                                        <Group position="apart">
                                                            <Text weight={500}>Tâche {taskIndex + 1}</Text>
                                                            <ActionIcon
                                                                color="red"
                                                                variant="subtle"
                                                                onClick={() => removeTask(workIndex, taskIndex)}
                                                                disabled={work.tasks.length === 1}
                                                            >
                                                                <Trash size={18} />
                                                            </ActionIcon>
                                                        </Group>

                                                        <TextInput
                                                            placeholder="Nom de la tâche"
                                                            required
                                                            {...form.getInputProps(`works.${workIndex}.tasks.${taskIndex}.name`)}
                                                        />

                                                        {task.budgets.map((budget, budgetIndex) => (
                                                            <Group key={budgetIndex} grow>
                                                                <Select
                                                                    data={getAvailableBudgetTypes(task, budget)}
                                                                    required
                                                                    placeholder="Sélectionner un type de budget"
                                                                    {...form.getInputProps(`works.${workIndex}.tasks.${taskIndex}.budgets.${budgetIndex}.type`)}
                                                                />
                                                                <TextInput
                                                                    placeholder="Prix unitaire"
                                                                    required
                                                                    rightSection="€"
                                                                    {...form.getInputProps(`works.${workIndex}.tasks.${taskIndex}.budgets.${budgetIndex}.unitPrice`)}
                                                                />
                                                                <TextInput
                                                                    placeholder="Quantité"
                                                                    required
                                                                    rightSection={budget.type === 'budget_mo_previsionnel' ? 'h' : 'u'}
                                                                    {...form.getInputProps(`works.${workIndex}.tasks.${taskIndex}.budgets.${budgetIndex}.quantity`)}
                                                                />
                                                                <ActionIcon
                                                                    color="red"
                                                                    variant="subtle"
                                                                    onClick={() => removeBudget(workIndex, taskIndex, budgetIndex)}
                                                                    disabled={task.budgets.length === 1}
                                                                >
                                                                    <Trash size={18} />
                                                                </ActionIcon>
                                                            </Group>
                                                        ))}

                                                        <Group justify="center">
                                                            <ActionIcon
                                                                size="lg"
                                                                color="blue"
                                                                variant="light"
                                                                onClick={() => addBudget(workIndex, taskIndex)}
                                                                disabled={task.budgets.length >= 4}
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
                                                    onClick={() => addTask(workIndex)}
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
                        </ScrollArea>
                    </Stepper.Step>

                    <Stepper.Step label="Récapitulatif">
                        <ScrollArea h={500}>
                            {renderSummaryTable()}
                        </ScrollArea>
                    </Stepper.Step>
                </Stepper>
            }
            {
                hasValidatedQuote() &&
                <Alert
                    icon={<AlertCircle />}
                    color="red"
                    variant="light"
                    mb="md"
                >
                    Un devis a déjà été validé. Si vous souhaitez ajouter un nouveau devis, veuillez tout d'abord annuler le devis validé et procédez à la création de devis.
                </Alert>
            }


            <Group justify='space-between' mt="xl">
                <Button variant="default" onClick={closeAdd}>
                    Annuler
                </Button>

                <Group spacing="md">
                    {active !== 0 && (
                        <Button variant="default" onClick={() => setActive(active - 1)}>
                            Précédent
                        </Button>
                    )}
                    {active === 0 ? (
                        <Button onClick={() => setActive(1)} disabled={!isFormValid()}>
                            Suivant
                        </Button>
                    ) : (
                        <Button onClick={handleSave}>
                            Créer le devis
                        </Button>
                    )}
                </Group>
            </Group>
        </Modal>
    );
};

export default AddQuote;