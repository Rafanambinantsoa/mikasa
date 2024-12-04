import { BaseGanttChart } from "./BaseGanttChart";

export const ExecutionGanttChart = ({ projectWorks, getWorkTasks, onRefresh }) => {
    return (
        <BaseGanttChart
            projectWorks={projectWorks}
            getWorkTasks={getWorkTasks}
            showRealTasks={true}
            isPrevisionalEditable={false}
            title="Diagramme de Gantt"
            onRefresh={onRefresh}
        />
    );
};