import React, { Component } from "react";
//import moment from 'moment'
//import 'moment/locale/zh-cn';
import moment from "moment";
import Scheduler, {
    SchedulerData,
    ViewTypes,
    DATE_FORMAT,
    DemoData,
} from "react-big-scheduler";
import withDragDropContext from "../context/withDnDContext";
import "react-big-scheduler/lib/css/style.css";

class Scheduler extends Component {
    constructor(props) {
        super(props);
        let resources = [
            {
                id: "r1",
                name: "Staff_Val",
            },
            {
                id: "r2",
                name: "Staff_Tom",
            },
            {
                id: "r5",
                name: "Staff_Ben",
            },
        ];
        //let schedulerData = new SchedulerData(, ViewTypes.Week);
        let schedulerData = new SchedulerData(
            new moment("2017-12-18").format(DATE_FORMAT),
            ViewTypes.Week,
            false,
            false,
            {
                displayWeekend: false,
                eventItemPopoverEnabled: false,
                views: [
                    {
                        viewName: "Weekly Scheduling",
                        viewType: ViewTypes.Week,
                        showAgenda: false,
                        isEventPerspective: false,
                    },
                ], // minuteStep: 15
            }
        );
        // schedulerData.localeMoment.locale('en');

        schedulerData.setResources(resources);
        //schedulerData.setEvents(DemoData.events);
        let events = [
            {
                id: 1,
                start: "2017-12-18 09:30:00",
                end: "2017-12-19 23:30:00",
                resourceId: "r1",
                title: "A1",
                bgColor: "#488FAB",
            },
            {
                id: 2,
                start: "2017-12-18 12:30:00",
                end: "2017-12-26 23:30:00",
                resourceId: "r2",
                title: "A2",
                resizable: true,
            },

            {
                id: 5,
                start: "2017-12-19 15:30:00",
                end: "2017-12-20 23:30:00",
                resourceId: "r5",
                title: "R5",
                rrule: "FREQ=WEEKLY;DTSTART=20171219T013000Z;BYDAY=TU,FR",
                bgColor: "#DCC36B",
            },
        ];
        schedulerData.setEvents(events);

        this.state = {
            viewModel: schedulerData,
        };
    }

    render() {
        const { viewModel } = this.state;
        console.log(DemoData.events);
        return (
            <div>
                <div>
                    <Scheduler
                        schedulerData={viewModel}
                        prevClick={this.prevClick}
                        nextClick={this.nextClick}
                        onSelectDate={this.onSelectDate}
                        onViewChange={this.onViewChange}
                        eventItemClick={this.eventClicked}
                        //    viewEventClick={this.ops1}
                        //    viewEventText="Ops 1"
                        //    viewEvent2Text="Ops 2"
                        //    viewEvent2Click={this.ops2}
                        updateEventStart={this.updateEventStart}
                        updateEventEnd={this.updateEventEnd}
                        moveEvent={this.moveEvent}
                        newEvent={this.newEvent}
                    />
                </div>
            </div>
        );
    }

    prevClick = (schedulerData) => {
        schedulerData.prev();
        schedulerData.setEvents(DemoData.events);
        this.setState({
            viewModel: schedulerData,
        });
    };

    nextClick = (schedulerData) => {
        schedulerData.next();
        schedulerData.setEvents(DemoData.events);
        this.setState({
            viewModel: schedulerData,
        });
    };

    onViewChange = (schedulerData, view) => {
        schedulerData.setViewType(
            view.viewType,
            view.showAgenda,
            view.isEventPerspective
        );
        //schedulerData.setEvents(DemoData.events);
        this.setState({
            viewModel: schedulerData,
        });
    };

    onSelectDate = (schedulerData, date) => {
        schedulerData.setDate(date);
        //schedulerData.setEvents(DemoData.events);
        this.setState({
            viewModel: schedulerData,
        });
    };

    eventClicked = (schedulerData, event) => {
        alert(
            `You just clicked an event: {id: ${event.id}, title: ${event.title}}`
        );
    };

    ops1 = (schedulerData, event) => {
        alert(
            `You just executed ops1 to event: {id: ${event.id}, title: ${event.title}}`
        );
    };

    ops2 = (schedulerData, event) => {
        alert(
            `You just executed ops2 to event: {id: ${event.id}, title: ${event.title}}`
        );
    };

    newEvent = (schedulerData, slotId, slotName, start, end, type, item) => {
        let newFreshId = 0;
        schedulerData.events.forEach((item) => {
            if (item.id >= newFreshId) newFreshId = item.id + 1;
        });

        let newEvent = {
            id: newFreshId,
            title: "",
            start: start,
            end: end,
            resourceId: slotId,
            bgColor: "#488FAB",
        };
        schedulerData.addEvent(newEvent);
        this.setState({
            viewModel: schedulerData,
        });
    };

    updateEventStart = (schedulerData, event, newStart) => {
        schedulerData.updateEventStart(event, newStart);
        this.setState({
            viewModel: schedulerData,
        });
    };

    updateEventEnd = (schedulerData, event, newEnd) => {
        schedulerData.updateEventEnd(event, newEnd);
        this.setState({
            viewModel: schedulerData,
        });
    };

    moveEvent = (schedulerData, event, slotId, slotName, start, end) => {
        schedulerData.moveEvent(event, slotId, slotName, start, end);
        this.setState({
            viewModel: schedulerData,
        });
    };
}

export default withDragDropContext(Scheduler);
