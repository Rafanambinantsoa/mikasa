import { Text, Image, ScrollArea, Tabs } from "@mantine/core";
import noResultFound from '../assets/images/no_results.webp';
import ButtonComponent from "../components/ButtonComponent";
import { Add } from "iconsax-react";
import { ExecutionGanttChart } from "../components/gantt-chart/ExecutionGanttChart";
import Expenses from "../components/Expenses";
import KanbanBoard from "../components/KanbanBoard";

export default function ExecPage({ project, onRefresh }) {
    // Get the validated quote (devis) for the project
    const validatedQuote = project.devis.find(devis => devis.etat_devis === 'validé');

    // Get works (ouvrages) from the validated quote
    const projectWorks = validatedQuote?.ouvrages || [];


    // Get tasks (taches) for a specific work
    const getWorkTasks = (ouvrage_id) => {
        const work = projectWorks.find(ouvrage => ouvrage.id === ouvrage_id);
        return work?.taches || [];
    };

    return (
        <>
            <section className="main-title-cta">
                <div className="main-title-section" style={{ padding: 0, marginBottom: 24 }}>
                    <h1 className="main-title">Réalisation</h1>
                    <Text className="main-subtitle" c="dimmed">
                        Suivi de la réalisation du projet: {project.nom_projet}
                    </Text>
                </div>
            </section>
            <section className="gantt-section">
                {validatedQuote ? (
                    <div className="gantt-section-content">
                        <Tabs defaultValue="planning-gantt">
                            <Tabs.List>
                                <Tabs.Tab value="planning-gantt">Planning Gantt</Tabs.Tab>
                                <Tabs.Tab value="depenses">Dépenses</Tabs.Tab>
                                <Tabs.Tab value="kanban">Kanban</Tabs.Tab>
                            </Tabs.List>

                            <Tabs.Panel value="planning-gantt">
                                <ExecutionGanttChart
                                    projectWorks={projectWorks}
                                    getWorkTasks={getWorkTasks}
                                    onRefresh={onRefresh}
                                />
                            </Tabs.Panel>

                            <Tabs.Panel value="depenses">
                                <Expenses
                                    projectWorks={projectWorks}
                                    onRefresh={onRefresh}
                                />
                            </Tabs.Panel>

                            <Tabs.Panel value="kanban">
                                <KanbanBoard
                                    project={project}
                                    onRefresh={onRefresh}
                                />
                            </Tabs.Panel>
                        </Tabs>
                    </div>
                ) : (
                    <div className="not-found">
                        <Image src={noResultFound} alt="No results found" />
                        <Text>No valid quote found for this project.</Text>
                    </div>
                )}
            </section>
        </>
    );
}