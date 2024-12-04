import { Modal, TextInput } from '@mantine/core'
import { useState } from 'react'
import { useJobStore } from '../../stores/jobStore'
import { Button } from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { rem } from '@mantine/core';

export default function AddJob({ addOpened, addClose }) {
    const [jobName, setJobName] = useState('');
    const { createJob, getJobs } = useJobStore();

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            console.log('Creating job:', jobName); // Debug log
            const result = await createJob({ name: jobName });
            console.log('Create result:', result); // Debug log

            notifications.show({
                title: 'Succès',
                message: 'Le poste a été créé avec succès!',
                color: 'teal',
                icon: <IconCheck style={{ width: rem(20), height: rem(20) }} />,
                autoClose: 5000,
            });

            await getJobs();

            setJobName('');
            addClose(); // Close modal after successful creation
        } catch (error) {
            console.error('Error creating job:', error); // Log the actual error
            notifications.show({
                title: 'Erreur',
                message: error.message || 'Il y a eu un problème lors de la création du poste',
                color: 'red'
            });
        }
    }

    return (
        <Modal
            opened={addOpened}
            onClose={addClose}
            title="Ajouter un Poste"
            centered
        >
            <form onSubmit={handleSubmit}>
                <TextInput
                    label="Nom du Poste"
                    placeholder="Entrez le nom du poste"
                    value={jobName}
                    onChange={(event) => setJobName(event.currentTarget.value)}
                    required
                />
                <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button type="submit">
                        Ajouter
                    </Button>
                </div>
            </form>
        </Modal>
    )
}