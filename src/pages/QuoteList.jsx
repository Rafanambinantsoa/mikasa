import { Tabs, Text, Tooltip } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { Add, Calendar } from 'iconsax-react';
import { useEffect, useState } from 'react';
import ButtonComponent from '../components/ButtonComponent';

import ProjectQuotesTable from '../components/tables/ProjectQuotesTable';
import { useClientStore } from '../stores/clientStore';
import { useProjectStore } from '../stores/projectStore';
import AddQuote from './quotes/AddQuote';
import QuoteDetails from './quotes/QuoteDetails';


export default function QuoteList({ project: initialProject }) {
    const [project, setProject] = useState(initialProject);
    const [dateRange, setDateRange] = useState([null, null]);
    const [drawerOpened, setDrawerOpened] = useState(false);
    const [selectedQuote, setSelectedQuote] = useState(null);
    const [addQuoteOpened, setAddQuoteOpened] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const { getProject } = useProjectStore(); // Add this

    // Destructure quotes, ouvrages (works), taches (tasks) from current project state
    const quotes = project.devis || [];
    const works = quotes.flatMap(quote => quote.ouvrages || []);
    const tasks = works.flatMap(work => work.taches || []);

    const {
        clients = [],
        loading: clientsLoading,
        getClients
    } = useClientStore();

    const refreshProjectData = async () => {
        try {
            const updatedProject = await getProject(project.id);
            setProject(updatedProject);
        } catch (error) {
            console.error('Error refreshing project data:', error);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                await Promise.all([
                    getClients(),
                ]);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const filterQuotesByDate = (quotes) => {
        if (!dateRange[0] || !dateRange[1]) return quotes;

        const startDate = new Date(dateRange[0]);
        const endDate = new Date(dateRange[1]);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);

        return quotes.filter(quote => {
            const quoteDate = new Date(quote.date_creation);
            return quoteDate >= startDate && quoteDate <= endDate;
        });
    };

    const hasValidatedQuote = () => {
        return quotes.some(quote => quote.etat_devis === 'validé');
    };

    const getClientName = () => {
        const client = clients?.find(client => client.id === project.client_id);
        return client ? client.nom_client : 'Client inconnu';
    };

    const getClientEmail = () => {
        const client = clients?.find(client => client.id === project.client_id);
        return client ? client.email : 'Email non spécifié';
    };

    // Get budget data for a specific quote
    const getQuoteBudgetData = () => {
        return tasks.map(task => ({
            tache_id: task.id,
            type: 'previsionnel',
            subtype: 'budget_mo',
            prix_unitaire: task.budget_previsionnel.mo,
            quantite: 1
        })).concat(
            tasks.map(task => ({
                tache_id: task.id,
                type: 'previsionnel',
                subtype: 'budget_materiaux',
                prix_unitaire: task.budget_previsionnel.materiaux,
                quantite: 1
            }))
        ).concat(
            tasks.map(task => ({
                tache_id: task.id,
                type: 'previsionnel',
                subtype: 'budget_materiel',
                prix_unitaire: task.budget_previsionnel.materiels,
                quantite: 1
            }))
        ).concat(
            tasks.map(task => ({
                tache_id: task.id,
                type: 'previsionnel',
                subtype: 'budget_sous_traitance',
                prix_unitaire: task.budget_previsionnel.sous_traitance,
                quantite: 1
            }))
        );
    };

    return (
        <>
            <section className="main-title-cta">
                <div
                    className="main-title-section"
                    style={{
                        padding: 0,
                        marginBottom: 24
                    }}>
                    <h1 className="main-title">Devis</h1>
                    <Text className="main-subtitle" c="dimmed">
                        Liste de devis pour le projet: {project.nom_projet}
                    </Text>
                </div>
                <div className="add-quote-section">
                    <Tooltip
                        label="Un devis validé existe déjà pour ce projet"
                        position="bottom"
                        disabled={!hasValidatedQuote()}
                    >
                        <div>
                            <ButtonComponent
                                fieldname={'Ajouter un devis'}
                                rightIcon={<Add size={24} />}
                                onClick={() => setAddQuoteOpened(true)}
                            />
                        </div>
                    </Tooltip>
                </div>
            </section>

            <section className="project-phase-content">
                <div className="projects-filter-section">
                    <DatePickerInput
                        leftSection={<Calendar size={16} />}
                        dropdownType="modal"
                        type="range"
                        radius='xl'
                        placeholder="Sélectionner une période"
                        value={dateRange}
                        onChange={setDateRange}
                        locale="fr"
                        clearable
                        style={{
                            width: '400px'
                        }}
                    />
                </div>

                <Tabs defaultValue="tous">
                    <Tabs.List>
                        <Tabs.Tab value="tous">Tous</Tabs.Tab>
                        <Tabs.Tab value="validé">Validés</Tabs.Tab>
                        <Tabs.Tab value="refuse">Refusés</Tabs.Tab>
                        <Tabs.Tab value="en attente">En attente</Tabs.Tab>
                    </Tabs.List>

                    {['tous', 'validé', 'refuse', 'en attente'].map((status) => (
                        <Tabs.Panel key={status} value={status}>
                            <ProjectQuotesTable
                                quotes={filterQuotesByDate(quotes).filter(
                                    status === 'tous' ?
                                        () => true :
                                        quote => quote.etat_devis === status
                                )}
                                project={project}
                                works={works}
                                tasks={tasks}
                                budgets={getQuoteBudgetData()}
                                clients={clients}
                                onQuoteSelect={(quote) => {
                                    setSelectedQuote(quote);
                                    console.log("Devis sélectionné : ", selectedQuote)
                                    setDrawerOpened(true);
                                }}
                            />
                        </Tabs.Panel>
                    ))}
                </Tabs>
            </section>

            <QuoteDetails
                opened={drawerOpened}
                onClose={() => {
                    setDrawerOpened(false);
                    setSelectedQuote(null);
                }}
                quote={selectedQuote}
                onQuoteDeleted={async () => {
                    await refreshProjectData();
                    setDrawerOpened(false);
                    setSelectedQuote(null);
                }}
                formatQuoteNumber={(quote) => {
                    if (!quote || !quote.date_creation) {
                        return 'N/A';
                    }
                    const date = new Date(quote.date_creation);
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const day = String(date.getDate()).padStart(2, '0');
                    return `D${year}${month}${day}${quote.id}`;
                }}
                clientName={getClientName()}
                clientEmail={getClientEmail()}
                projectName={project.nom_projet}
                projectPhase={project.phase_projet}
                works={works.filter(work => work.devis_id === selectedQuote?.id)}
                tasks={tasks.filter(task =>
                    works
                        .filter(work => work.devis_id === selectedQuote?.id)
                        .map(work => work.id)
                        .includes(task.ouvrage_id)
                )}
                budgets={selectedQuote ? getQuoteBudgetData() : []}
            />

            <AddQuote
                addOpened={addQuoteOpened}
                closeAdd={() => setAddQuoteOpened(false)}
                projet_id={project.id}
                hasValidatedQuote={hasValidatedQuote}
                onQuoteAdded={
                    // () => {
                    // // await refreshProjectData();
                    // setAddQuoteOpened(false);
                    // setSelectedQuote(null);
                    async () => {
                        await refreshProjectData();
                        setDrawerOpened(false);
                        setSelectedQuote(null);
                    }}
            />
        </>
    );
}