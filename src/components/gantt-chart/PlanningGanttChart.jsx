import { BaseGanttChart } from "./BaseGanttChart";

export const PlanningGanttChart = ({ projectWorks, getWorkTasks, onRefresh }) => {
    return (
        <BaseGanttChart
            projectWorks={projectWorks}
            getWorkTasks={getWorkTasks}
            showRealTasks={false}
            isPrevisionalEditable={true}
            title="Diagramme de Gantt"
            onRefresh={onRefresh}
        />
    );
};