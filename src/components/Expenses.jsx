import { Text, Button, Drawer, Loader } from "@mantine/core";
import '../styles/projects/expenses.css';
import ExpensesTable from "./tables/ExpensesTable";
import { useDisclosure } from "@mantine/hooks";
import AddExpense from "./modals/AddExpense";
import { useState } from 'react';

export default function Expenses({ projectWorks, onRefresh }) {
    const [isLoading, setIsLoading] = useState(false);
    const [addOpened, { open: openAdd, close: closeAdd }] = useDisclosure(false);

    const handleRefresh = async () => {
        setIsLoading(true);
        try {
            await onRefresh();
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddExpenseSuccess = async () => {
        closeAdd();
        await handleRefresh();
    };

    return (
        <div className="expenses-container">
            <div className="expenses-header">
                <div className="expenses-title">
                    <Text className='bold-title' size="xl">Dépenses</Text>
                    <Text c="dimmed">Liste des dépenses en phase de réalisation</Text>
                </div>
                <Button onClick={openAdd}>Ajouter une dépense</Button>
            </div>
            <div className="expenses-content">
                {isLoading ? (
                    <div className="flex items-center justify-center p-8">
                        <Loader size="lg" />
                    </div>
                ) : (
                    <ExpensesTable projectWorks={projectWorks} />
                )}
                <AddExpense
                    opened={addOpened}
                    onClose={closeAdd}
                    projectWorks={projectWorks}
                    onSuccess={handleAddExpenseSuccess}
                />
            </div>
        </div>
    );
}