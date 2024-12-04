import { Text } from '@mantine/core';
import { modals } from '@mantine/modals';
import { MantineReactTable } from 'mantine-react-table';
import React, { useState, useEffect } from 'react';

import { Edit, Trash } from 'iconsax-react';
import { Briefcase } from 'lucide-react';

import { useDisclosure } from '@mantine/hooks';
import { useJobStore } from '../../stores/jobStore';
import EditJob from '../modals/EditJob';
import { notifications } from '@mantine/notifications';
import { IconCheck } from '@tabler/icons-react';
import { rem } from '@mantine/core';

const JobsTable = () => {
    const [selectedRow, setSelectedRow] = useState('');
    const [editOpened, { open: editOpen, close: editClose }] = useDisclosure(false);

    const { jobs, deleteJob, getJobs } = useJobStore();

    useEffect(() => {
        getJobs();
    }, []);

    // Trigger confirm delete modal
    const openDeleteModal = (row) =>
        modals.openConfirmModal({
            title: <Text className="bold-title">Supprimer</Text>,
            centered: true,
            children: (
                <p>
                    Êtes-vous sûr de vouloir supprimer ce poste ?
                    Cette action est irréversible.
                </p>
            ),
            labels: { confirm: 'Supprimer', cancel: 'Non, revenir' },
            confirmProps: { color: 'red' },
            onCancel: () => console.log('Cancel'),
            onConfirm: async () => {
                try {
                    console.log('Deleting job:', row.id); // Debug log
                    await deleteJob(row.id);

                    // Refresh jobs list
                    await getJobs();

                    // Show success notification
                    notifications.show({
                        title: 'Succès',
                        message: 'Le poste a été supprimé avec succès!',
                        color: 'teal',
                        icon: <IconCheck style={{ width: rem(20), height: rem(20) }} />,
                        autoClose: 5000,
                    });
                } catch (error) {
                    console.error('Error deleting job:', error); // Log the actual error
                    notifications.show({
                        title: 'Erreur',
                        message: error.message || 'Il y a eu un problème lors de la suppression du poste',
                        color: 'red'
                    });
                }
            },
            closeOnConfirm: true,
        });

    const columns = React.useMemo(
        () => [
            {
                accessorKey: 'name',
                header: 'Nom du Poste',
                Cell: ({ renderedCellValue, row }) => (
                    <div className="table-header">
                        <div className="table-header-icon">
                            <Briefcase size={16} />
                        </div>
                        <div className="table-header-name">{renderedCellValue}</div>
                    </div>
                ),
                grow: true
            },
            {
                accessorKey: 'actions',
                header: 'Actions',
                Cell: ({ row }) => (
                    <div className="table-action-buttons">
                        <Edit
                            size="24"
                            className="table-action-button-item"
                            id="edit-button"
                            onClick={() => {
                                editOpen();
                                setSelectedRow(row.original);
                            }}
                        />
                        <Trash
                            size="24"
                            className="table-action-button-item"
                            id="delete-button"
                            onClick={() => openDeleteModal(row.original)}
                        />
                    </div>
                ),
                grow: true
            },
        ],
        []
    );

    return (
        <>
            <div className="table-container">
                <MantineReactTable
                    columns={columns}
                    data={jobs}
                    enableColumnResizing
                    enableColumnOrdering
                    enablePagination

                    mantineTableContainerProps={{
                        style: {
                            width: '100%',
                            height: '100%',
                            maxHeight: '400px',
                            overflowX: 'auto',
                            overflowY: 'auto',
                        },
                    }}
                />
            </div>

            <EditJob
                editOpened={editOpened}
                editClose={editClose}
                selectedRow={selectedRow}
            />
        </>
    );
};

export default JobsTable;