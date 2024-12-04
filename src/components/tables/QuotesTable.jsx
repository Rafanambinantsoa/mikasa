
import { Text } from '@mantine/core';
import { MantineReactTable } from 'mantine-react-table';
import { useMemo } from 'react';

export default function QuotesTable({ quoteData, clientData, projectData }) {
    console.log("projct data : ", projectData)
    // Combine data to get validated quotes with project and client info
    const validatedQuotesData = useMemo(() => {
        return quoteData
            .filter(quote => quote.etat_devis === "validé")
            .map(quote => {
                const project = projectData?.find(p => p.id === quote.projet_id);
                const client = project
                    ? clientData?.find(c => c.id === project.client_id)
                    : null;
                return {
                    ...quote,
                    projectName: project?.nom_projet || 'N/A',
                    clientName: client?.nom_client || 'N/A',
                    clientEmail: client?.email || 'N/A',
                    clientPhone: client?.contact_client || 'N/A',
                    projectRevenue: project?.chiffre_affaire || 0,
                    projectAddress: project?.adresse_chantier || 'N/A'
                };
            });
    }, [quoteData, clientData, projectData]);

    console.log("Validés : ", validatedQuotesData)

    // Define columns for the table
    const columns = useMemo(
        () => [
            {
                header: 'Date de création',
                accessorKey: 'date_creation',
                Cell: ({ cell }) => new Date(cell.getValue()).toLocaleDateString('fr-FR'),
            },
            {
                header: 'Projet',
                accessorKey: 'projectName',
            },
            {
                header: 'Client',
                accessorKey: 'clientName',
            },
            {
                header: 'Contact',
                accessorKey: 'clientEmail',
                Cell: ({ row }) => (
                    <div>
                        <div>{row.original.clientEmail}</div>
                        <Text size="sm" c="dimmed">{row.original.clientPhone}</Text>
                    </div>
                ),
            },
            {
                header: 'Chiffre d\'affaires',
                accessorKey: 'projectRevenue',
                Cell: ({ cell }) => new Intl.NumberFormat('fr-FR', {
                    style: 'currency',
                    currency: 'EUR'
                }).format(cell.getValue()),
            },
            {
                header: 'Adresse',
                accessorKey: 'projectAddress',
            },
        ],
        [],
    );
    return (
        <div className="table-container">
            <MantineReactTable
                columns={columns}
                data={validatedQuotesData}
                enableColumnFilters={true}
                enableSorting={true}
                enablePagination={true}
                initialState={{
                    sorting: [{ id: 'date_creation', desc: true }],
                    pagination: { pageSize: 10 },
                }}
                mantineTableProps={{
                    highlightOnHover: true,
                    // withBorder: true,
                }}
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

    )
}