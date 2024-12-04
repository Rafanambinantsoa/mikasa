import React, { useState } from 'react';
import { Table, Badge, Text } from '@mantine/core';
import { More } from 'iconsax-react';
import noResultFound from '../../assets/images/no_results.webp';

const ProjectQuotesTable = ({
    quotes,
    project,
    works,
    tasks,
    budgets,
    clients,
    onQuoteSelect
}) => {
    // Add sorting state
    const [sortConfig, setSortConfig] = useState({
        key: null,
        direction: 'asc'
    });

    const getClientName = (client_id) => {
        const client = clients.find(client => client.id === client_id);
        return client ? client.nom_client : 'Client inconnu';
    };

    const calculateQuoteTotal = (devis_id) => {
        const quoteWorks = works.filter(work => work.devis_id === devis_id);
        return quoteWorks.reduce((total, work) => {
            const workTasks = tasks.filter(task => task.ouvrage_id === work.id);
            const workTotal = workTasks.reduce((taskTotal, task) => {
                const taskBudgets = budgets.filter(budget =>
                    budget.tache_id === task.id &&
                    budget.type === 'previsionnel'
                );

                const taskSum = taskBudgets.reduce((sum, budget) =>
                    sum + (budget.prix_unitaire * budget.quantite), 0);

                return taskTotal + taskSum;
            }, 0);
            return total + workTotal;
        }, 0);
    };

    const formatQuoteNumber = (quote) => {
        if (!quote || !quote.date_creation) {
            return 'N/A';
        }

        const date = new Date(quote.date_creation);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `D${year}${month}${day}${quote.id}`;
    };

    const StatusBadge = ({ status }) => {
        const colorMap = {
            'validé': 'green',
            'refuse': 'red',
            'en attente': 'yellow'
        };

        return (
            <Badge color={colorMap[status]}>
                {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
            </Badge>
        );
    };

    // Add sorting function
    const sortQuotes = (quotes) => {
        if (!sortConfig.key) return quotes;

        return [...quotes].sort((a, b) => {
            let aValue, bValue;

            switch (sortConfig.key) {
                case 'number':
                    aValue = formatQuoteNumber(a);
                    bValue = formatQuoteNumber(b);
                    break;
                case 'project':
                    aValue = project.nom_projet;
                    bValue = project.nom_projet;
                    break;
                case 'amount':
                    aValue = calculateQuoteTotal(a.id);
                    bValue = calculateQuoteTotal(b.id);
                    break;
                case 'client':
                    aValue = getClientName(project.client_id);
                    bValue = getClientName(project.client_id);
                    break;
                case 'date':
                    aValue = new Date(a.date_creation);
                    bValue = new Date(b.date_creation);
                    break;
                case 'status':
                    aValue = a.etat_devis;
                    bValue = b.etat_devis;
                    break;
                default:
                    return 0;
            }

            if (aValue < bValue) {
                return sortConfig.direction === 'asc' ? -1 : 1;
            }
            if (aValue > bValue) {
                return sortConfig.direction === 'asc' ? 1 : -1;
            }
            return 0;
        });
    };

    // Add sort handler
    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    // Add sort indicator styles
    const getSortIndicator = (key) => {
        if (sortConfig.key === key) {
            return sortConfig.direction === 'asc' ? ' ↑' : ' ↓';
        }
        return '';
    };

    // Cursor pointer style for sortable headers
    const sortableHeaderStyle = {
        cursor: 'pointer',
        userSelect: 'none'
    };

    return (
        <Table.ScrollContainer>
            <Table verticalSpacing="md" withTableBorder>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th
                            className='bold-title'
                            style={sortableHeaderStyle}
                            onClick={() => requestSort('number')}
                        >
                            Numéro{getSortIndicator('number')}
                        </Table.Th>
                        <Table.Th
                            className='bold-title'
                            style={sortableHeaderStyle}
                            onClick={() => requestSort('project')}
                        >
                            Projet{getSortIndicator('project')}
                        </Table.Th>
                        <Table.Th
                            className='bold-title'
                            style={sortableHeaderStyle}
                            onClick={() => requestSort('amount')}
                        >
                            Montant{getSortIndicator('amount')}
                        </Table.Th>
                        <Table.Th
                            className='bold-title'
                            style={sortableHeaderStyle}
                            onClick={() => requestSort('client')}
                        >
                            Client{getSortIndicator('client')}
                        </Table.Th>
                        <Table.Th
                            className='bold-title'
                            style={sortableHeaderStyle}
                            onClick={() => requestSort('date')}
                        >
                            Date de création{getSortIndicator('date')}
                        </Table.Th>
                        <Table.Th
                            className='bold-title'
                            style={sortableHeaderStyle}
                            onClick={() => requestSort('status')}
                        >
                            État{getSortIndicator('status')}
                        </Table.Th>
                        <Table.Th className='bold-title'>Actions</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {quotes.length > 0 ? (
                        sortQuotes(quotes).map(quote => (
                            <Table.Tr key={quote.id}>
                                <Table.Td>{formatQuoteNumber(quote)}</Table.Td>
                                <Table.Td>{project.nom_projet}</Table.Td>
                                <Table.Td>{calculateQuoteTotal(quote.id).toLocaleString('fr-FR')} €</Table.Td>
                                <Table.Td>{getClientName(project.client_id)}</Table.Td>
                                <Table.Td>{new Date(quote.date_creation).toLocaleDateString('fr-FR')}</Table.Td>
                                <Table.Td><StatusBadge status={quote.etat_devis} /></Table.Td>
                                <Table.Td>
                                    <div className="table-action-buttons">
                                        <More
                                            size="24"
                                            className='table-action-button-item'
                                            onClick={() => onQuoteSelect(quote)}
                                        />
                                    </div>
                                </Table.Td>
                            </Table.Tr>
                        ))
                    ) : (
                        <Table.Tr>
                            <Table.Td colSpan={7} style={{ textAlign: 'center' }}>
                                <img src={noResultFound} alt="No quotes found" style={{ maxWidth: '200px' }} />
                                <Text>Aucun devis trouvé</Text>
                            </Table.Td>
                        </Table.Tr>
                    )}
                </Table.Tbody>
            </Table>
        </Table.ScrollContainer>
    );
};

export default ProjectQuotesTable;