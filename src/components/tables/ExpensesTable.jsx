import React from 'react';
import { Table, Text } from "@mantine/core";

const ExpensesTable = ({ projectWorks }) => {
    // Helper function to format price in EUR
    const formatPrice = (price) => {
        return price.toLocaleString('fr-FR') + ' €';
    };

    // Helper function to calculate totals for all works
    const calculateTotals = () => {
        let moTotal = 0;
        let materiauxTotal = 0;
        let materielsTotal = 0;
        let sousTraitanceTotal = 0;

        projectWorks.forEach(work => {
            work.taches.forEach(task => {
                moTotal += task.budget_reel.mo;
                materiauxTotal += task.budget_reel.materiaux;
                materielsTotal += task.budget_reel.materiels;
                sousTraitanceTotal += task.budget_reel.sous_traitance;
            });
        });

        return {
            moTotal,
            materiauxTotal,
            materielsTotal,
            sousTraitanceTotal,
            total: moTotal + materiauxTotal + materielsTotal + sousTraitanceTotal
        };
    };

    return (
        <div className="w-full overflow-x-auto">
            <Table withTableBorder withColumnBorders verticalSpacing="sm">
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th className="font-bold">Ouvrage / Tâche</Table.Th>
                        <Table.Th className="font-bold">Main d'oeuvre</Table.Th>
                        <Table.Th className="font-bold">Matériaux</Table.Th>
                        <Table.Th className="font-bold">Matériel</Table.Th>
                        <Table.Th className="font-bold">Sous-traitance</Table.Th>
                        <Table.Th className="font-bold">Total</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {projectWorks.map(work => (
                        <React.Fragment key={work.id}>
                            <Table.Tr style={{ backgroundColor: '#f8f9fa' }}>
                                <Table.Td colSpan={6} className='bold-title'>
                                    {work.nom_ouvrage}
                                </Table.Td>
                            </Table.Tr>
                            {work.taches.map(task => {
                                const totalBudget =
                                    task.budget_reel.mo +
                                    task.budget_reel.materiaux +
                                    task.budget_reel.materiels +
                                    task.budget_reel.sous_traitance;

                                return (
                                    <Table.Tr key={task.id}>
                                        <Table.Td className="pl-8">
                                            <div>
                                                <Text>{task.nom_tache}</Text>
                                                <Text size="xs" c="dimmed">
                                                    {task.etat_tache.charAt(0).toUpperCase() + task.etat_tache.slice(1)}
                                                </Text>
                                            </div>
                                        </Table.Td>
                                        <Table.Td>{formatPrice(task.budget_reel.mo)}</Table.Td>
                                        <Table.Td>{formatPrice(task.budget_reel.materiaux)}</Table.Td>
                                        <Table.Td>{formatPrice(task.budget_reel.materiels)}</Table.Td>
                                        <Table.Td>{formatPrice(task.budget_reel.sous_traitance)}</Table.Td>
                                        <Table.Td>{formatPrice(totalBudget)}</Table.Td>
                                    </Table.Tr>
                                );
                            })}
                        </React.Fragment>
                    ))}
                </Table.Tbody>
                <Table.Tfoot>
                    <Table.Tr style={{ backgroundColor: '#f8f9fa' }}>
                        <Table.Td className='bold-title' >Total</Table.Td>
                        <Table.Td className='bold-title' >{formatPrice(calculateTotals().moTotal)}</Table.Td>
                        <Table.Td className='bold-title' >{formatPrice(calculateTotals().materiauxTotal)}</Table.Td>
                        <Table.Td className='bold-title' >{formatPrice(calculateTotals().materielsTotal)}</Table.Td>
                        <Table.Td className='bold-title' >{formatPrice(calculateTotals().sousTraitanceTotal)}</Table.Td>
                        <Table.Td className='bold-title' >{formatPrice(calculateTotals().total)}</Table.Td>
                    </Table.Tr>
                </Table.Tfoot>
            </Table>
        </div>
    );
};

export default ExpensesTable;