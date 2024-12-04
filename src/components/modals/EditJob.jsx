import { Button, Modal, TextInput } from '@mantine/core'
import { useState, useEffect } from 'react'
import { useJobStore } from '../../stores/jobStore'
import { notifications } from '@mantine/notifications';
import { IconCheck } from '@tabler/icons-react';
import { rem } from '@mantine/core';

export default function EditJob({ editOpened, editClose, selectedRow }) {
    const [jobName, setJobName] = useState('');
    const { updateJob, getJobs } = useJobStore();

    useEffect(() => {
        if (selectedRow) {
            setJobName(selectedRow.name || '');
        }
    }, [selectedRow]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            console.log('Updating job:', selectedRow.id, jobName); // Debug log
            const result = await updateJob(selectedRow.id, { name: jobName });
            console.log('Update result:', result); // Debug log

            await getJobs();

            notifications.show({
                title: 'Succès',
                message: 'Le poste a été mis à jour avec succès!',
                color: 'teal',
                icon: <IconCheck style={{ width: rem(20), height: rem(20) }} />,
                autoClose: 5000,
            });

            editClose(); // Close modal after successful update
        } catch (error) {
            console.error('Error updating job:', error); // Log the actual error
            notifications.show({
                title: 'Erreur',
                message: error.message || 'Il y a eu un problème lors de la mise à jour du poste',
                color: 'red'
            });
        }
    }

    return (
        <Modal
            opened={editOpened}
            onClose={editClose}
            title="Modifier un Poste"
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
                        Mettre à jour
                    </Button>
                </div>
            </form>
        </Modal>
    )
}