import { ActionIcon, Button, Divider, Drawer, Group, Image, rem, Select, Text, TextInput } from "@mantine/core";
import { IMAGE_MIME_TYPE, Dropzone as MantineDropzone } from '@mantine/dropzone';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconPhoto, IconTrash, IconUpload, IconX } from '@tabler/icons-react';
import { useState } from 'react';

import { useUserStore } from '../../stores/userStore';
import '../../styles/modal.css';

export default function AddWorker({ addOpened, addClose, jobs, fetchData }) {
    const [previewImage, setPreviewImage] = useState(null);

    const { createUser } = useUserStore();

    const form = useForm({
        initialValues: {
            name: '',
            firstname: '',
            jobId: '',
            photo: null,
        },
        validate: {
            name: (value) => !value ? 'Le nom est requis' : null,
            firstname: (value) => !value ? 'Le prénom est requis' : null,
            jobId: (value) => !value ? 'Le poste est requis' : null,
            photo: (value) => !value ? 'Une photo de profil est requise' : null,
        }
    });

    const handleSubmit = async(values) => {
        const newWorker = {
            ...values,
            created_at: new Date().toISOString().split('T')[0],
        };
        const formData = new FormData();
        formData.append('name', newWorker.name);
        formData.append('firstname', newWorker.firstname);
        formData.append('jobId', newWorker.jobId);
        formData.append('photo', newWorker.photo);
        formData.append('created_at', newWorker.created_at);

        await createUser(formData);

        notifications.show({
            title: 'Succès',
            message: 'Le nouvel ouvrier a été ajouté avec succès!',
            color: 'teal',
            icon: <IconCheck style={{ width: rem(20), height: rem(20) }} />,
            autoClose: 5000,
            withCloseButton: true,
            styles: (theme) => ({
                root: { backgroundColor: theme.colors.teal[0], borderColor: theme.colors.teal[6] },
                title: { color: theme.colors.teal[9] },
                description: { color: theme.colors.teal[9] },
                closeButton: {
                    color: theme.colors.teal[9],
                    '&:hover': { backgroundColor: theme.colors.teal[1] },
                },
            }),
        });
        addClose();
        fetchData();
    };

    const handleImageDrop = (files) => {
        if (files.length > 0) {
            const file = files[0];
            form.setFieldValue('photo', file);
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const handleRemoveImage = () => {
        setPreviewImage(null);
        form.setFieldValue('photo', null);
    };

    return (
        <Drawer
            opened={addOpened}
            onClose={addClose}
            className="popup-modal"
            size="auto"
            position="right"
        >
            <form onSubmit={form.onSubmit(handleSubmit)}>
                <div className="modal-content">
                    <section className="modal-title-section">
                        <h1 className="main-title">Ajouter un ouvrier</h1>
                        <Text className="main-subtitle" c="dimmed" size='sm' mt='12'>
                            Ajouter un nouvel ouvrier à votre équipe
                        </Text>
                    </section>
                    <Divider className="divider" />
                    <div className="modal-datainput-content">
                        <div className="modal-form-section">
                            <TextInput
                                label="Nom"
                                placeholder="Nom de l'ouvrier"
                                withAsterisk
                                {...form.getInputProps('name')}
                            />
                            <TextInput
                                label="Prénom"
                                placeholder="Prénom de l'ouvrier"
                                withAsterisk
                                {...form.getInputProps('firstname')}
                            />
                            <Select
                                label="Poste"
                                placeholder="Sélectionner le poste"
                                withAsterisk
                                data={jobs.map((job) => ({
                                    value: job.id.toString(),
                                    label: job.name,
                                }))}
                                {...form.getInputProps('jobId')}
                            />

                            {previewImage ? (
                                <div style={{ position: 'relative', width: 'fit-content', marginTop: '32px' }}>
                                    <Image
                                        src={previewImage}
                                        alt="Preview"
                                        width={150}
                                        height={150}
                                        radius="md"
                                        fit="cover"
                                    />
                                    <ActionIcon
                                        color="red"
                                        variant="filled"
                                        size="sm"
                                        style={{
                                            position: 'absolute',
                                            top: -10,
                                            right: -10,
                                            zIndex: 1
                                        }}
                                        onClick={handleRemoveImage}
                                    >
                                        <IconTrash size={16} />
                                    </ActionIcon>
                                </div>
                            ) : (
                                <MantineDropzone
                                    onDrop={handleImageDrop}
                                    onReject={(files) => console.log('rejected files', files)}
                                    maxSize={5 * 1024 ** 2}
                                    accept={IMAGE_MIME_TYPE}
                                    style={{ marginTop: '32px' }}
                                >
                                    <Group justify="center" gap="xl" mih={220} style={{ pointerEvents: 'none' }}>
                                        <MantineDropzone.Accept>
                                            <IconUpload
                                                style={{ width: rem(52), height: rem(52), color: 'var(--mantine-color-blue-6)' }}
                                                stroke={1.5}
                                            />
                                        </MantineDropzone.Accept>
                                        <MantineDropzone.Reject>
                                            <IconX
                                                style={{ width: rem(52), height: rem(52), color: 'var(--mantine-color-red-6)' }}
                                                stroke={1.5}
                                            />
                                        </MantineDropzone.Reject>
                                        <MantineDropzone.Idle>
                                            <IconPhoto
                                                style={{ width: rem(52), height: rem(52), color: 'var(--mantine-color-dimmed)' }}
                                                stroke={1.5}
                                            />
                                        </MantineDropzone.Idle>

                                        <div>
                                            <Text size="xl" inline>
                                                Déposez une photo ici ou cliquez pour sélectionner
                                            </Text>
                                            <Text size="sm" c="dimmed" inline mt={7}>
                                                Chaque fichier ne doit pas dépasser 5mb
                                            </Text>
                                        </div>
                                    </Group>
                                </MantineDropzone>
                            )}
                        </div>
                        <div className="modal-action-button">
                            <Button
                                fullWidth
                                size="md"
                                type="submit"
                                disabled={!form.isValid()}
                            >
                                Ajouter
                            </Button>
                        </div>
                    </div>
                </div>
            </form>
        </Drawer>
    );
}