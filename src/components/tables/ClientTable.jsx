import { Text } from '@mantine/core';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { MantineReactTable } from 'mantine-react-table';
import React, { useState } from 'react';

import { IconCheck } from '@tabler/icons-react';
import { Edit, Trash } from 'iconsax-react';
import { Calendar, Mail, Phone, User2 } from 'lucide-react';

import { useDisclosure } from '@mantine/hooks';
import { useClientStore } from '../../stores/clientStore';
import EditClient from '../modals/EditClient';

const ClientTable = ({ clients }) => {
    const [selectedRow, setSelectedRow] = useState('');
    const [editOpened, { open: editOpen, close: editClose }] = useDisclosure(false);

    const { deleteClient, getClients } = useClientStore()
    // const { setClientData } = useData();

    // Trigger confirm delete modal
    const openDeleteModal = (row) =>
        modals.openConfirmModal({
            title: <Text className="bold-title">Supprimer</Text>,
            centered: true,
            children: (
                <p>
                    Êtes-vous sûr de vouloir supprimer les informations pour ce client ?
                    Cette action est irréversible, et toutes les données et projets associés seront définitivement perdus.
                </p>
            ),
            labels: { confirm: 'Supprimer', cancel: 'Non, revenir' },
            confirmProps: { color: 'red' },
            onCancel: () => console.log('Cancel'),
            onConfirm: async () => {
                await deleteClient(row.id);
                getClients();
                // setClientData(response.data.data);
                // Perform your deletion logic here
                notifications.show({
                    title: 'Succès',
                    message: 'Toutes les informations sur ce client ont été supprimées',
                    color: 'teal',
                    icon: <IconCheck />,
                    autoClose: 3000,
                    withCloseButton: true,
                });
            },
            closeOnConfirm: true,
        });

    const columns = React.useMemo(
        () => [
            {
                accessorKey: 'nom_client',
                header: 'Nom',
                Cell: ({ renderedCellValue, row }) => (
                    <div className="table-header">
                        <div className="table-header-icon">
                            <User2 size={16} />
                        </div>
                        <div className="table-header-name">{renderedCellValue}</div>
                    </div>
                ),
                grow: true
            },
            {
                accessorKey: 'email',
                header: 'Adresse e-mail',
                Cell: ({ renderedCellValue, row }) => (
                    <div className="table-header">
                        <div className="table-header-icon">
                            <Mail size={16} />
                        </div>
                        <div className="table-header-name">{renderedCellValue}</div>
                    </div>
                ),
                grow: true
            },
            {
                accessorKey: 'contact_client',
                header: 'Téléphone',
                Cell: ({ renderedCellValue, row }) => (
                    <div className="table-header">
                        <div className="table-header-icon">
                            <Phone size={16} />
                        </div>
                        <div className="table-header-name">{renderedCellValue}</div>
                    </div>
                ),
                grow: true
            },
            {
                accessorKey: 'created_at',
                header: 'Ajouté le',
                Cell: ({ renderedCellValue, row }) => (
                    <div className="table-header">
                        <div className="table-header-icon">
                            <Calendar size={16} />
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
                                // Open the EditClient drawer and pass the selected row data
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
                    data={clients}
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
                    renderTopToolbarCustomActions={({ table }) => (
                        <div className="table-actions">
                            {/* Add any additional actions or buttons here */}
                        </div>
                    )}

                />
            </div>

            <EditClient
                editOpened={editOpened}
                editClose={editClose}
                selectedRow={selectedRow}
            />
        </>
    );
};

export default ClientTable;