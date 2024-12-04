import { Button, Divider, Drawer, Select, Text, TextInput, Textarea, rem } from "@mantine/core";
import { useForm } from '@mantine/form';
import '../../styles/modal.css';

import { notifications } from '@mantine/notifications';
import { IconCheck } from '@tabler/icons-react';
import { useClientStore } from "../../stores/clientStore";
import { useProjectStore } from "../../stores/projectStore";

import LocationAutocomplete from "../LocationAutocomplete";

export default function AddProject({ opened, onClose }) {
    const { clients: clientData } = useClientStore()
    const clientOptions = clientData.map(client => ({
        value: client.id.toString(),
        label: client.nom_client
    }));

    const { createProject, getProjects } = useProjectStore()

    const form = useForm({
        initialValues: {
            nom_projet: '',
            description_projet: '',
            client_id: '',
            adresse_chantier: '',
            latitude: null,
            longitude: null
        },
        validate: {
            nom_projet: (value) => !value ? 'Le nom du projet est requis' : null,
            client_id: (value) => !value ? 'Le client est requis' : null,
            adresse_chantier: (value) => !value ? "L'adresse du chantier est requise" : null,
        }
    });

    const handleSubmit = async (values) => {
        await createProject(values);
        getProjects();
        notifications.show({
            title: 'Succès',
            message: 'Le projet a été créé avec succès!',
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
                        <h1 className="main-title">Créer un projet</h1>
                        <Text className="main-subtitle" c="dimmed" size='sm' mt='12'>
                            Ajouter un projet à gérer dans votre liste de projets
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
                            <Button
                                fullWidth
                                size="md"
                                type="submit"
                                disabled={!isFormValid}
                            >
                                Créer le projet
                            </Button>
                        </div>
                    </div>
                </div>
            </form>
        </Drawer>
    );
}