import { Button, Divider, Drawer, Select, Text, TextInput, Textarea, rem } from "@mantine/core";
import { useForm } from '@mantine/form';
import { modals } from "@mantine/modals";
import { notifications } from '@mantine/notifications';
import { IconCheck } from '@tabler/icons-react';
import { useClientStore } from "../../stores/clientStore";
import { useProjectStore } from "../../stores/projectStore";
import '../../styles/modal.css';

import LocationAutocomplete from "../LocationAutocomplete";

export default function EditProject({ opened, onClose, projectData }) {
    console.log("EditProject - Received Project Data:", projectData);

    const { clients: clientData } = useClientStore()
    const clientOptions = clientData.map(client => ({
        value: client.id.toString(),
        label: client.nom_client
    }));
    const { updateProject, deleteProject, getProjects } = useProjectStore();

    const form = useForm({
        initialValues: {
            nom_projet: projectData.nom_projet || '',
            description_projet: projectData.description_projet || '',
            client_id: projectData.client_id?.toString() || '',
            adresse_chantier: projectData.adresse_chantier || '',
            latitude: projectData.latitude || null,
            longitude: projectData.longitude || null
        },
        validate: {
            nom_projet: (value) => !value ? 'Le nom du projet est requis' : null,
            client_id: (value) => !value ? 'Le client est requis' : null,
            adresse_chantier: (value) => !value ? "L'adresse du chantier est requise" : null,
        }
    });

    const handleSubmit = async (values) => {
        await updateProject(projectData.id, values);
        await getProjects();
        notifications.show({
            title: 'Succès',
            message: 'Les modifications ont été enregistrées avec succès!',
            color: 'teal',
            icon: <IconCheck style={{ width: rem(20), height: rem(20) }} />,
            autoClose: 3000,
            withCloseButton: true,
            styles: (theme) => ({
                root: {
                    backgroundColor: theme.colors.teal[0],
                    borderColor: theme.colors.teal[6],
                },
                title: {
                    color: theme.colors.teal[9],
                },
                description: {
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
        onClose();
    };

    // Check if all required fields are filled
    const isFormValid = form.isValid() &&
        form.values.nom_projet &&
        form.values.client_id &&
        form.values.adresse_chantier &&
        form.values.latitude !== null &&
        form.values.longitude !== null;

    // Trigger confirm delete modal
    // Trigger confirm delete modal
    const openDeleteModal = () =>
        modals.openConfirmModal({
            title: <Text className="main-title">Supprimer le projet</Text>,
            centered: true,
            children: (
                <Text size="sm">
                    Êtes-vous sûr de vouloir supprimer ce projet ? Cette action est irréversible,
                    et toutes les données associées à ce projet seront définitivement perdues.
                </Text>
            ),
            labels: { confirm: 'Supprimer', cancel: "Non, ne pas poursuivre" },
            confirmProps: { color: 'red' },
            onCancel: () => console.log('Cancel'),
            onConfirm: async () => {
                await deleteProject(projectData.id);
                await getProjects();
                notifications.show({
                    title: 'Succès',
                    message: 'Toutes les informations sur ce projet ont été supprimées avec succès',
                    color: 'teal',
                    icon: <IconCheck style={{ width: rem(20), height: rem(20) }} />,
                    autoClose: 3000,
                    withCloseButton: true,
                    styles: (theme) => ({
                        root: {
                            backgroundColor: theme.colors.teal[0],
                            borderColor: theme.colors.teal[6],
                        },
                        title: {
                            color: theme.colors.teal[9],
                        },
                        description: {
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
                onClose();
            },
        });

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
                        <h1 className="main-title">Modifier le projet</h1>
                        <Text className="main-subtitle" c="dimmed" size='sm' mt='12'>
                            Modifier les informations du projet
                        </Text>
                    </section>
                    <Divider className="divider" />
                    <div className="modal-datainput-content">
                        <div className="modal-form-section">
                            <TextInput
                                label="Nom du projet"
                                placeholder="Nom du projet"
                                withAsterisk
                                {...form.getInputProps('nom_projet')}
                            />
                            <Textarea
                                label="Description du projet"
                                placeholder="Description du projet"
                                {...form.getInputProps('description_projet')}
                            />
                            <Select
                                label="Nom du client"
                                placeholder="Sélectionner le nom du client"
                                data={clientOptions}
                                withAsterisk
                                {...form.getInputProps('client_id')}
                            />
                            <LocationAutocomplete
                                value={form.values.adresse_chantier}
                                onChange={(locationData) => {
                                    form.setFieldValue('adresse_chantier', locationData.adresse_chantier);
                                    form.setFieldValue('latitude', locationData.latitude);
                                    form.setFieldValue('longitude', locationData.longitude);
                                }}
                            />
                        </div>
                        <div className="modal-action-button">
                            <Button.Group>
                                <Button
                                    fullWidth
                                    size="md"
                                    color="blue"
                                    type="submit"
                                    disabled={!isFormValid}
                                >
                                    Enregistrer les modifications
                                </Button>
                                <Button
                                    fullWidth
                                    size="md"
                                    color='red'
                                    variant="outline"
                                    onClick={openDeleteModal}  // Add this line
                                >
                                    Supprimer
                                </Button>
                            </Button.Group>
                        </div>
                    </div>
                </div>
            </form>
        </Drawer>


    );
}