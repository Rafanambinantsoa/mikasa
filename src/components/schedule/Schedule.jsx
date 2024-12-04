import { Select } from "@mantine/core";
import { Calendar, dayjsLocalizer } from "react-big-calendar";
import dayjs from "dayjs";
import React, { useState, useMemo, useCallback, useEffect } from "react";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useUserStore } from "../../stores/userStore"; // Adjust the import path
import "dayjs/locale/fr";
import localeData from "dayjs/plugin/localeData";
import weekday from "dayjs/plugin/weekday";

// Register dayjs plugins
dayjs.extend(localeData);
dayjs.extend(weekday);
dayjs.locale("fr");

const localizer = dayjsLocalizer(dayjs);

export default function Schedule() {
    const [myEventsList, setMyEventsList] = useState([]);
    const [selectedWorker, setSelectedWorker] = useState(null);

    const { users, loading, getUsers, getUser } = useUserStore();

    // Fetch users when the component mounts
    useEffect(() => {
        getUsers().catch(console.error);
    }, [getUsers]);

    // Log users when updated
    useEffect(() => {
        console.log("Updated users: ", users);
    }, [users]);

    // Transform users into data suitable for the <Select> component
    const workersData = useMemo(() => {
        return users.map((user) => ({
            value: user.id.toString(),
            label: user.name || user.username, // Adjust based on your user object structure
        }));
    }, [users]);

    // Update the event list when a worker is selected
    useEffect(() => {
        if (selectedWorker) {
            getUser(selectedWorker).then((user) => {
                if (user && user.taches) {
                    // Transform tasks into calendar events
                    const events = user.taches.map((tache) => ({
                        id: tache.id,
                        title: tache.nom_tache,
                        start: dayjs(`${tache.pivot.date_edt}T${tache.pivot.heure_debut}`).toDate(),
                        end: dayjs(`${tache.pivot.date_edt}T${tache.pivot.heure_fin}`).toDate(),
                    }));
                    setMyEventsList(events);
                } else {
                    setMyEventsList([]); // No tasks for the selected worker
                }
            }).catch(console.error);
        } else {
            // If no worker is selected, clear the calendar
            setMyEventsList([]);
        }
    }, [selectedWorker, getUser]);

    // Handle worker selection
    const handleSelectWorker = useCallback((value) => {
        setSelectedWorker(value);
        console.log("Selected worker ID: ", value); // Log the selected worker ID
    }, []);

    // Calendar localization messages
    const messages = {
        allDay: "Journée",
        previous: "Préc.",
        next: "Suiv.",
        today: "Aujourd'hui",
        month: "Mois",
        week: "Semaine",
        day: "Jour",
        agenda: "Agenda",
        date: "Date",
        time: "Heure",
        event: "Événement",
        showMore: (total) => `+ ${total} événement(s) supplémentaire(s)`,
    };

    return (
        <div className="gantt-wrapper">
            <div className="gantt-header">
                <div className="gantt-title">
                    <Select
                        placeholder={loading ? "Chargement..." : "Sélectionner un ouvrier..."}
                        data={workersData}
                        value={selectedWorker}
                        onChange={handleSelectWorker}
                        disabled={loading}
                    />
                </div>
            </div>
            <div className="gantt-container">
                <Calendar
                    localizer={localizer}
                    events={myEventsList}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: 500 }}
                    messages={messages}
                />
            </div>
        </div>
    );
}
