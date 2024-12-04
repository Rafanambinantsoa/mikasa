import { useState, useMemo } from 'react';
import { Drawer, Divider, Text, NumberInput, Select, Button } from "@mantine/core";
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconCheck } from '@tabler/icons-react';
import { useBudgetStore } from '../../stores/budgetStore';

export default function AddExpense({ opened, onClose, projectWorks, onSuccess }) {
    const { createBudget } = useBudgetStore();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Create select data for tasks
    const selectData = useMemo(() => {
        return projectWorks.map(work => ({
            group: work.nom_ouvrage,
            items: work.taches.map(task => ({
                value: task.id.toString(),
                label: task.nom_tache,
                task: task
            }))
        })).filter(group => group.items.length > 0);
    }, [projectWorks]);

    // Budget type options
    const budgetTypes = [
        { value: 'budget_mo', label: "Main d'œuvre" },
        { value: 'budget_materiaux', label: 'Matériaux' },
        { value: 'budget_materiel', label: 'Matériel' },
        { value: 'budget_sous_traitance', label: 'Sous-traitance' },
    ];

    const form = useForm({
        initialValues: {
            tache_id: '',
            subtype: '',
            prix_unitaire: 0,
            quantite: 1,
        },
        validate: {
            tache_id: (value) => !value ? 'La tâche est requise' : null,
            subtype: (value) => !value ? 'Le type de budget est requis' : null,
            prix_unitaire: (value) => value <= 0 ? 'Le prix unitaire doit être supérieur à 0' : null,
            quantite: (value) => value < 1 ? 'La quantité doit être au moins 1' : null,
        }
    });

    const handleSubmit = async (values) => {
        setIsSubmitting(true);
        try {
            const budgetData = {
                ...values,
                type: 'reel',
                tache_id: parseInt(values.tache_id),
            };

            await createBudget(budgetData);

            notifications.show({
                title: 'Succès',
                message: 'La dépense a été ajoutée avec succès!',
                color: 'teal',
                icon: <IconCheck style={{ width: 20, height: 20 }} />,
                autoClose: 3000,
                withCloseButton: true,
                styles: (theme) => ({
                    root: {
                        backgroundColor: theme.colors.teal[0],
                        borderColor: theme.colors.teal[6],
                    },
                    title: { color: theme.colors.teal[9] },
                    description: { color: theme.colors.teal[9] },
                    closeButton: {
                        color: theme.colors.teal[9],
                        '&:hover': { backgroundColor: theme.colors.teal[1] },
                    },
                }),
            });

            form.reset();
            await onSuccess();
        } catch (error) {
            console.error('Error creating budget:', error);
            notifications.show({
                title: 'Erreur',
                message: 'Une erreur est survenue lors de l\'ajout de la dépense.',
                color: 'red',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Drawer
            opened={opened}
            onClose={onClose}
            className="popup-modal"
            size="auto"
            position="right"
        >
            <form onSubmit={form.onSubmit(handleSubmit)}>
                <div className="modal-content">
                    <section className="modal-title-section">
                        <h1 className="main-title">Ajouter une dépense</h1>
                        <Text className="main-subtitle" c="dimmed" size="sm" mt="12">
                            Ajouter une nouvelle dépense au projet
                        </Text>
                    </section>
                    <Divider className="divider" />
                    <div className="modal-datainput-content">
                        <div className="modal-form-section">
                            <Select
                                label="Sélectionnez une tâche"
                                placeholder="Choisir une tâche"
                                data={selectData}
                                searchable
                                withAsterisk
                                {...form.getInputProps('tache_id')}
                            />

                            <Select
                                label="Type de dépense"
                                placeholder="Sélectionner le type"
                                data={budgetTypes}
                                withAsterisk
                                {...form.getInputProps('subtype')}
                            />

                            <NumberInput
                                label="Prix unitaire"
                                placeholder="Entrer le prix unitaire"
                                min={0}
                                withAsterisk
                                allowDecimal
                                decimalScale={2}
                                {...form.getInputProps('prix_unitaire')}
                            />

                            <NumberInput
                                label="Quantité"
                                placeholder="Entrer la quantité"
                                min={1}
                                withAsterisk
                                {...form.getInputProps('quantite')}
                            />
                        </div>
                        <div className="modal-action-button">
                            <Button
                                fullWidth
                                size="md"
                                type="submit"
                                disabled={!form.isValid() || isSubmitting}
                                loading={isSubmitting}
                            >
                                {isSubmitting ? 'Ajout en cours...' : 'Ajouter'}
                            </Button>
                        </div>
                    </div>
                </div>
            </form>
        </Drawer>
    );
}