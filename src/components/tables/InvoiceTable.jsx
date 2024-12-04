import React from 'react';
import {
    MantineReactTable,
    useMantineReactTable,
} from 'mantine-react-table';
import { ActionIcon, Paper, Text, Group, Stack, Badge } from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';
import { modals } from '@mantine/modals';

const InvoiceTable = ({ data, onDeleteInvoice }) => {
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR'
        }).format(amount);
    };

    const handleDeleteClick = (invoiceId) => {
        modals.openConfirmModal({
            title: 'Confirmer la suppression',
            children: (
                <Text size="sm">
                    Êtes-vous sûr de vouloir supprimer cette facture ? Cette action est irréversible.
                </Text>
            ),
            labels: { confirm: 'Supprimer', cancel: 'Annuler' },
            confirmProps: { color: 'red' },
            onConfirm: () => onDeleteInvoice(invoiceId),
        });
    };

    const renderDetailPanel = ({ row }) => {
        const invoice = row.original;

        return (
            <Paper p="md" radius="md" withBorder>
                {invoice.ouvrages.map((ouvrage) => (
                    <Stack key={ouvrage.id} spacing="xs" mb="md">
                        <Group position="apart">
                            <Text weight={700} size="lg">{ouvrage.nom_ouvrage}</Text>
                        </Group>
                        <Text size="sm" color="dimmed">{ouvrage.description_ouvrage}</Text>

                        {ouvrage.taches.map((tache) => (
                            <Paper key={tache.id} p="sm" radius="sm" withBorder>
                                <Stack spacing="xs">
                                    <Text weight={600}>{tache.nom_tache}</Text>
                                    {tache.budgets.map((budget) => (
                                        <Group key={budget.id} position="apart">
                                            <Badge
                                                color={budget.subtype === 'budget_materiel' ? 'blue' : 'green'}
                                                variant="light"
                                            >
                                                {budget.subtype === 'budget_materiel' ? 'Matériel' : 'Sous-traitance'}
                                            </Badge>
                                            <Group spacing="xs">
                                                <Text size="sm">
                                                    {formatCurrency(budget.prix_unitaire)} × {budget.quantite}
                                                </Text>
                                                <Text weight={600}>
                                                    = {formatCurrency(budget.prix_unitaire * budget.quantite)}
                                                </Text>
                                            </Group>
                                        </Group>
                                    ))}
                                </Stack>
                            </Paper>
                        ))}
                    </Stack>
                ))}
            </Paper>
        );
    };

    const columns = [
        {
            accessorKey: 'id',
            header: 'N° Facture',
            size: 100,
        },
        {
            accessorKey: 'projet_id',
            header: 'N° Projet',
            size: 100,
        },
        {
            accessorKey: 'created_at',
            header: 'Date de création',
            Cell: ({ cell }) => formatDate(cell.getValue()),
            size: 200,
        },
        {
            accessorKey: 'montant_total',
            header: 'Montant total',
            Cell: ({ cell }) => formatCurrency(cell.getValue()),
            size: 150,
        },
        {
            id: 'actions',
            header: 'Actions',
            size: 100,
            Cell: ({ row }) => (
                <ActionIcon
                    color="red"
                    onClick={() => handleDeleteClick(row.original.id)}
                    variant="subtle"
                >
                    <IconTrash size={16} />
                </ActionIcon>
            ),
        },
    ];

    const table = useMantineReactTable({
        columns,
        data,
        enableColumnActions: false,
        enableColumnFilters: false,
        enablePagination: true,
        enableSorting: true,
        enableTopToolbar: true,
        enableBottomToolbar: true,
        enableRowActions: false,
        enableRowSelection: false,
        initialState: {
            density: 'md',
            pagination: { pageSize: 10, pageIndex: 0 },
            sorting: [{ id: 'created_at', desc: true }],
        },
        mantineTableProps: {
            withBorder: true,
            striped: true,
            highlightOnHover: true,
        },
        renderDetailPanel,
        positionExpandColumn: 'last',
        displayColumnDefOptions: {
            'mrt-row-expand': {
                size: 40,
            },
        },
    });

    return (
        <div style={{ height: '100%', width: '100%' }}>
            <MantineReactTable table={table} />
        </div>
    );
};

export default InvoiceTable;