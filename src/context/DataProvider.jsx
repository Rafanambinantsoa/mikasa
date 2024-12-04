import React, { createContext, useContext, useState } from 'react';

// Create the context
const DataContext = createContext();

// Create a custom hook to use the context
export const useData = () => {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};



// Create the provider component
export const DataProvider = ({ children }) => {
    // Initialize state for all data types

    const [projectData, setProjectData] = useState([]);

    const [clientData, setClientData] = useState([]);

    const [quoteData, setQuoteData] = useState([]);

    const [workData, setWorkData] = useState([
        {
            id: 1,
            devis_id: 1,
            nom_ouvrage: "Infrastructure",
            description_ouvrage: "Ouvrage concernant les infrastructures basiques",
        },
        {
            id: 2,
            devis_id: 1,
            nom_ouvrage: "Installation électrique",
            description_ouvrage: "Ouvrage concernant la mise en place du système électrique",
        },
        {
            id: 3,
            devis_id: 2,
            nom_ouvrage: "Isolement",
            description_ouvrage: "Isolement de la clinique",
        },
        // ... other work data
    ]);

    const [taskData, setTaskData] = useState([]);

    // Example of the budget data structure
    const [budgetData, setBudgetData] = useState([
        {
            id: 1,
            tache_id: 1,
            type: 'previsionnel',
            subtype: 'budget_mo',
            prix_unitaire: 100,
            quantite: 10
        },
        {
            id: 2,
            tache_id: 1,
            type: 'previsionnel',
            subtype: 'budget_materiaux',
            prix_unitaire: 100,
            quantite: 5
        },
        {
            id: 3,
            tache_id: 1,
            type: 'previsionnel',
            subtype: 'budget_materiel',
            prix_unitaire: 70,
            quantite: 10
        },
        {
            id: 4,
            tache_id: 1,
            type: 'previsionnel',
            subtype: 'budget_sous_traitance',
            prix_unitaire: 80,
            quantite: 10
        },
        {
            id: 5,
            tache_id: 2,
            type: 'previsionnel',
            subtype: 'budget_mo',
            prix_unitaire: 100,
            quantite: 10
        },
        {
            id: 6,
            tache_id: 2,
            type: 'previsionnel',
            subtype: 'budget_materiaux',
            prix_unitaire: 100,
            quantite: 5
        },
        {
            id: 7,
            tache_id: 2,
            type: 'previsionnel',
            subtype: 'budget_materiel',
            prix_unitaire: 70,
            quantite: 10
        },
        {
            id: 8,
            tache_id: 2,
            type: 'previsionnel',
            subtype: 'budget_sous_traitance',
            prix_unitaire: 80,
            quantite: 10
        },
        // ... similar entries for other real budgets
    ]);

    const [jobs, setJobs] = useState([]);

    const [users, setUsers] = useState([]);


    // Add this to your DataProvider.jsx
    const [messageData, setMessageData] = useState([
        {
            id: 1,
            content: "Bonjour! Je suis votre assistant d'optimisation budgétaire. Comment puis-je vous aider aujourd'hui?",
            isBot: true,
            timestamp: new Date('2024-01-01T09:00:00')
        },
        {
            id: 2,
            content: "Je peux vous aider à analyser les budgets prévisionnels et réels de vos projets pour identifier des opportunités d'optimisation.",
            isBot: true,
            timestamp: new Date('2024-01-01T09:00:01')
        }
    ]);

    // New schedule data state
    const [scheduleData, setScheduleData] = useState([
        // Example entry:
        {
            id: 1,                    // Unique identifier for the schedule entry
            tache_id: 1,                // References taskData.id
            ouvrier_id: 1,              // References users.id
            date_edt: "2024-10-31",    // The date of the assignment
            heure_debut: "08:00",      // Start time of the work
            heure_fin: "17:00",        // End time of the work
            created_at: "2024-10-25", // When this assignment was created
            status: "assigned"         // Status of the assignment (assigned, completed, cancelled)
        }
    ]);

    // Helper function to get workers assigned to a specific task
    const getTaskWorkers = (tache_id) => {
        const assignments = scheduleData.filter(schedule => schedule.tache_id === tache_id);
        return users.filter(worker =>
            assignments.some(assignment => assignment.ouvrier_id === worker.id)
        );
    };

    // Helper function to get tasks assigned to a specific worker
    const getWorkerTasks = (ouvrier_id) => {
        const assignments = scheduleData.filter(schedule => schedule.ouvrier_id === ouvrier_id);
        return taskData.filter(task =>
            assignments.some(assignment => assignment.tache_id === task.id)
        );
    };

    // Helper function to add new task assignments
    const assignWorkersToTask = (tache_id, workerIds, date, startTime = "08:00", endTime = "17:00") => {
        const newAssignments = workerIds.map(ouvrier_id => ({
            id: Math.max(0, ...scheduleData.map(s => s.id)) + 1, // Generate new ID
            tache_id,
            ouvrier_id,
            date_edt: date,
            heure_debut: startTime,
            heure_fin: endTime,
            created_at: new Date().toISOString().split('T')[0],
            status: "assigned"
        }));

        setScheduleData(prev => [...prev, ...newAssignments]);
        return newAssignments;
    };

    // Helper function to update assignment status
    const updateAssignmentStatus = (assignmentId, newStatus) => {
        setScheduleData(prev => prev.map(schedule =>
            schedule.id === assignmentId
                ? { ...schedule, status: newStatus }
                : schedule
        ));
    };

    // Helper function to remove assignments
    const removeAssignments = (tache_id, workerIds = null) => {
        setScheduleData(prev => prev.filter(schedule => {
            if (schedule.tache_id !== tache_id) return true;
            if (workerIds === null) return false;
            return !workerIds.includes(schedule.ouvrier_id);
        }));
    };

    // Create methods to update the data
    const addProject = (newProject) => {
        setProjectData(prev => [...prev, { ...newProject, id: prev.length + 1 }]);
    };

    const updateProject = (updatedProject) => {
        setProjectData(prev => prev.map(project =>
            project.id === updatedProject.id ? updatedProject : project
        ));
    };

    const deleteProject = (projet_id) => {
        setProjectData(prev => prev.filter(project => project.id !== projet_id));
    };

    const addTask = (newTask) => {
        setTaskData(prev => [...prev, { ...newTask, id: prev.length + 1 }]);
    };

    const updateTask = (updatedTask) => {
        setTaskData(prev => prev.map(task =>
            task.id === updatedTask.id ? updatedTask : task
        ));
    };

    const deleteTask = (tache_id) => {
        setTaskData(prev => prev.filter(task => task.id !== tache_id));
    };

    // Add similar methods for other data types as needed

    const getQuoteData = (devis_id) => {
        const quote = quoteData.find((q) => q.id === devis_id);
        const works = workData.filter((w) => w.devis_id === devis_id);
        const tasks = taskData.filter((t) => works.some((w) => w.id === t.ouvrage_id));
        const budgets = budgetData.filter((b) => tasks.some((t) => t.id === b.tache_id));

        return {
            quote,
            works,
            tasks,
            budgets,
        };
    };


    const value = {
        projectData,
        clientData,
        quoteData,
        workData,
        taskData,
        setTaskData,
        jobs,
        users,
        setUsers,
        budgetData,
        messageData,
        setMessageData,
        setClientData,
        setQuoteData,
        //SCHEDULING
        scheduleData,
        setScheduleData,
        // Helper functions
        getTaskWorkers,
        getWorkerTasks,
        assignWorkersToTask,
        updateAssignmentStatus,
        removeAssignments,
        setProjectData,
        setJobs,
        /////////////////
        addProject,
        updateProject,
        deleteProject,
        addTask,
        updateTask,
        deleteTask,
        // Add other methods as needed
        getQuoteData,
    };

    return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export default DataProvider;