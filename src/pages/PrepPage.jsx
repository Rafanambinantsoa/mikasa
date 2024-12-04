import { Text, Image, ScrollArea, Tabs } from "@mantine/core";
import noResultFound from '../assets/images/no_results.webp';
import BudgetChatbot from "../components/BudgetChatbot";
import { PlanningGanttChart } from "../components/gantt-chart/PlanningGanttChart";
import Schedule from "../components/schedule/Schedule";

export default function PrepPage({ project, onRefresh }) {
    // Get the validated quote (devis) for the project
    const validatedQuote = project.devis.find(devis => devis.etat_devis === 'validé');

    // Get works (ouvrages) from the validated quote
    const projectWorks = validatedQuote?.ouvrages || [];

    // Get tasks (taches) for a specific work
    const getWorkTasks = (ouvrage_id) => {
        const work = projectWorks.find(ouvrage => ouvrage.id === ouvrage_id);
        return work?.taches || [];
    };

    console.log("project works : ", projectWorks);

    return (
        <>
            <section className="main-title-cta">
                <div className="main-title-section" style={{ padding: 0, marginBottom: 24 }}>
                    <h1 className="main-title">Préparation</h1>
                    <Text className="main-subtitle" c="dimmed">
                        Préparation du projet: {project.nom_projet}
                    </Text>
                </div>
            </section>
            <section className="gantt-section">
                {validatedQuote ? (
                    <div className="gantt-section-content">
                        <Tabs defaultValue="planning-gantt">
                            <Tabs.List>
                                <Tabs.Tab value="planning-gantt">Planning Gantt</Tabs.Tab>
                                <Tabs.Tab value="emploi-du-temps">Emploi du temps</Tabs.Tab>
                            </Tabs.List>

                            <Tabs.Panel value="planning-gantt">
                                <PlanningGanttChart
                                    projectWorks={projectWorks}
                                    getWorkTasks={getWorkTasks}
                                    onRefresh={onRefresh}
                                />
                            </Tabs.Panel>

                            <Tabs.Panel value="emploi-du-temps">
                                <Schedule />
                            </Tabs.Panel>
                        </Tabs>
                    </div>
                ) : (
                    <div className="not-found">
                        <Image src={noResultFound} alt="No results found" />
                        <Text>Aucun devis trouvé pour ce projet.</Text>
                    </div>
                )}
            </section>
            {validatedQuote && (<BudgetChatbot projectWorks={projectWorks} />)}
        </>
    );
}