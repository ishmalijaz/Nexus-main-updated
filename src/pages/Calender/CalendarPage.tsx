// src/pages/CalendarPage.tsx
import React, { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";

// MUI imports
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";

const CalendarPage: React.FC = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [meetingTitle, setMeetingTitle] = useState("");

  const handleDateClick = (info: any) => {
    setSelectedDate(info.dateStr);
    setIsOpen(true);
  };

  const handleAddEvent = () => {
    if (meetingTitle.trim() !== "") {
      setEvents([
        ...events,
        {
          title: meetingTitle,
          start: selectedDate,
          status: "pending",
        },
      ]);
    }
    setMeetingTitle("");
    setIsOpen(false);
  };

  const handleStatusChange = (eventIndex: number, status: string) => {
    const updatedEvents = [...events];
    updatedEvents[eventIndex].status = status;
    setEvents(updatedEvents);
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Meeting Scheduling Calendar</h1>

      {/* Calendar */}
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        dateClick={handleDateClick}
        events={events.map((e) => ({
          title: `${e.title} (${e.status})`,
          start: e.start,
          color:
            e.status === "confirmed"
              ? "green"
              : e.status === "declined"
              ? "red"
              : "orange",
        }))}
        height="70vh"
      />

      {/* Meeting Requests Table */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-3">Meeting Requests</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-200 text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-2">Title</th>
                <th className="border p-2">Date</th>
                <th className="border p-2">Status</th>
                <th className="border p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event, index) => (
                <tr key={index} className="text-center">
                  <td className="border p-2">{event.title}</td>
                  <td className="border p-2">{event.start}</td>
                  <td className="border p-2 capitalize">{event.status}</td>
                  <td className="border p-2 space-x-2">
                    {event.status === "pending" && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleStatusChange(index, "confirmed")}
                        >
                          Accept
                        </Button>
                        <Button
                            size="sm"
                            variant="secondary"
                            className="bg-red-500 text-white hover:bg-red-600"
                            onClick={() => handleStatusChange(index, "declined")}
                            >

                          Decline
                        </Button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {events.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="text-gray-500 text-center p-4 italic"
                  >
                    No meeting requests yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dialog for Adding Meeting */}
      <Dialog open={isOpen} onClose={() => setIsOpen(false)} fullWidth>
        <DialogTitle>Schedule a Meeting</DialogTitle>
        <DialogContent className="space-y-3">
          <p>
            Selected Date: <span className="font-medium">{selectedDate}</span>
          </p>
          <Input
            placeholder="Enter meeting title"
            value={meetingTitle}
            onChange={(e) => setMeetingTitle(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleAddEvent}>Add Meeting</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default CalendarPage;
