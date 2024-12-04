// FinalStep.jsx
import { Table, Text } from '@mantine/core';

const FinalStep = ({ worksData }) => {
    const formatPrice = (value) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR'
        }).format(value);
    };

    const getBudgetAmount = (budget) => {
        return parseFloat(budget.unitPrice) * parseFloat(budget.quantity) || 0;
    };

    const calculateTaskTotals = (budgets) => {
        const totals = {
            moTotal: 0,
            materiauxTotal: 0,
            materielTotal: 0,
            sousTraitanceTotal: 0
        };

        budgets.forEach(budget => {
            const amount = getBudgetAmount(budget);
            switch (budget.type) {
                case 'budget_mo_previsionnel':
                    totals.moTotal += amount;
                    break;
                case 'budget_materiaux_previsionnel':
                    totals.materiauxTotal += amount;
                    break;
                case 'budget_materiel_previsionnel':
                    totals.materielTotal += amount;
                    break;
                case 'budget_sous_traitance_previsionnel':
                    totals.sousTraitanceTotal += amount;
                    break;
            }
        });

        totals.total = totals.moTotal + totals.materiauxTotal +
            totals.materielTotal + totals.sousTraitanceTotal;
        return totals;
    };

    const calculateWorkTotals = (work) => {
        const totals = {
            moTotal: 0,
            materiauxTotal: 0,
            materielTotal: 0,
            sousTraitanceTotal: 0,
            total: 0
        };

        work.tasks.forEach(task => {
            const taskTotals = calculateTaskTotals(task.budgets);
            totals.moTotal += taskTotals.moTotal;
            totals.materiauxTotal += taskTotals.materiauxTotal;
            totals.materielTotal += taskTotals.materielTotal;
            totals.sousTraitanceTotal += taskTotals.sousTraitanceTotal;
        });

        totals.total = totals.moTotal + totals.materiauxTotal +
            totals.materielTotal + totals.sousTraitanceTotal;
        return totals;
    };

    const calculateGrandTotal = () => {
        const totals = {
            moTotal: 0,
            materiauxTotal: 0,
            materielTotal: 0,
            sousTraitanceTotal: 0,
            total: 0
        };

        worksData.forEach(work => {
            const workTotals = calculateWorkTotals(work);
            totals.moTotal += workTotals.moTotal;
            totals.materiauxTotal += workTotals.materiauxTotal;
            totals.materielTotal += workTotals.materielTotal;
            totals.sousTraitanceTotal += workTotals.sousTraitanceTotal;
        });

        totals.total = totals.moTotal + totals.materiauxTotal +
            totals.materielTotal + totals.sousTraitanceTotal;
        return totals;
    };

    return (
        <div className="modal-form-section" style={{ minWidth: '900px' }}>
            <Table verticalSpacing="sm" withTableBorder withColumnBorders>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th className='bold-title'>Ouvrage / Tâche</Table.Th>
                        <Table.Th className='bold-title'>Main d'oeuvre</Table.Th>
                        <Table.Th className='bold-title'>Matériaux</Table.Th>
                        <Table.Th className='bold-title'>Matériel</Table.Th>
                        <Table.Th className='bold-title'>Sous-traitance</Table.Th>
                        <Table.Th className='bold-title'>Total</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {worksData.map(work => (
                        <>
                            <Table.Tr key={work.id} style={{ backgroundColor: '#f8f9fa' }}>
                                <Table.Td colSpan={6} style={{ fontWeight: 'bold' }} className='bold-title'>
                                    {work.name}
                                </Table.Td>
                            </Table.Tr>
                            {work.tasks.map(task => {
                                const taskTotals = calculateTaskTotals(task.budgets);
                                return (
                                    <Table.Tr key={`${work.id}-${task.id}`}>
                                        <Table.Td style={{ paddingLeft: '2rem' }}>{task.name}</Table.Td>
                                        <Table.Td>{formatPrice(taskTotals.moTotal)}</Table.Td>
                                        <Table.Td>{formatPrice(taskTotals.materiauxTotal)}</Table.Td>
                                        <Table.Td>{formatPrice(taskTotals.materielTotal)}</Table.Td>
                                        <Table.Td>{formatPrice(taskTotals.sousTraitanceTotal)}</Table.Td>
                                        <Table.Td>{formatPrice(taskTotals.total)}</Table.Td>
                                    </Table.Tr>
                                );
                            })}
                            {work.tasks.length > 1 && (
                                <Table.Tr style={{ backgroundColor: '#f8f9fa' }}>
                                    <Table.Td style={{ paddingLeft: '2rem', fontWeight: 'bold' }}>
                                        Sous-total {work.name}
                                    </Table.Td>
                                    {Object.values(calculateWorkTotals(work)).map((total, index) => (
                                        <Table.Td key={index} style={{ fontWeight: 'bold' }}>
                                            {formatPrice(total)}
                                        </Table.Td>
                                    ))}
                                </Table.Tr>
                            )}
                        </>
                    ))}
                </Table.Tbody>
                <Table.Tfoot>
                    <Table.Tr style={{ backgroundColor: '#f8f9fa' }}>
                        <Table.Td style={{ fontWeight: 'bold' }} className='bold-title'>
                            Total Général
                        </Table.Td>
                        {Object.values(calculateGrandTotal()).map((total, index) => (
                            <Table.Td key={index} style={{ fontWeight: 'bold' }} className='bold-title'>
                                {formatPrice(total)}
                            </Table.Td>
                        ))}
                    </Table.Tr>
                </Table.Tfoot>
            </Table>
        </div>
    );
};

export default FinalStep;