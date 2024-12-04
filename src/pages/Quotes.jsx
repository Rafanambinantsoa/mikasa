import { Divider, Text, Loader } from '@mantine/core';

import QuotesTable from '../components/tables/QuotesTable';

import { useEffect, useState } from 'react';

import '../styles/quotes/quotes.css';

// Import Zustand stores
import { useProjectStore } from '../stores/projectStore';
import { useClientStore } from '../stores/clientStore';
import { useWorkStore } from '../stores/workStore';
import { useTaskStore } from '../stores/taskStore';
import { useQuoteStore } from '../stores/quoteStore';


export default function Quotes() {
    const [isLoading, setIsLoading] = useState(true);
    const [quotes, setQuotes] = useState([]);

    const {
        projects = [],
        loading: projectsLoading,
        getProjects
    } = useProjectStore();

    const {
        clients = [],
        loading: clientsLoading,
        getClients
    } = useClientStore();

    const {
        loading: quotesLoading,
        getQuotes
    } = useQuoteStore();

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [projectsData, clientsData, quotesData] = await Promise.all([
                    getProjects(),
                    getClients(),
                    getQuotes()
                ]);

                // Set the quotes data in the component state
                setQuotes(quotesData);
            } catch (error) {
                console.error('Error fetching data:', error);
                toast.error('Failed to load data');
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    return (
        <div className="quotes-page-container">
            <section className="main-title-section">
                <h1 className="main-title">Historique des devis</h1>
                <Text className="main-subtitle" c="dimmed">
                    Liste de tous les devis validés
                </Text>
            </section>
            <Divider className="divider" />
            <section className="quotes-list-table-section">
                <section className="quotes-datagrid">
                    {isLoading || projectsLoading || clientsLoading || quotesLoading ? (
                        <div className="loading-overlay">
                            <Loader size="xl" />
                        </div>
                    ) : (
                        <QuotesTable
                            quoteData={quotes}
                            clientData={clients}
                            projectData={projects}
                        />
                    )}
                </section>
            </section>
        </div>
    );
}
