import {
  listCalendarEvents,
  createCalendarEvent,
  updateCalendarEvent,
  cancelCalendarEvent,
  deleteCalendarEvent,
  getCalendarInsights
} from "@admin-platform/shared-sdk";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../../../core/auth/AuthContext";
import { Breadcrumb } from "../../../components/common/Breadcrumb";
import { Card, CardContent } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { AlertCircle, X } from "lucide-react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";

export function CalendarModulePage() {
  const { api } = useAuth();
  const [events, setEvents] = useState([]);
  const [insights, setInsights] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Dialog state for creating events
  const [createDialog, setCreateDialog] = useState({ open: false, selectInfo: null });
  const [createTitle, setCreateTitle] = useState("");
  const createInputRef = useRef(null);

  // Dialog state for event actions (rename / cancel / delete)
  const [actionDialog, setActionDialog] = useState({ open: false, event: null });
  const [actionInput, setActionInput] = useState("");
  const actionInputRef = useRef(null);

  const loadAll = useCallback(async () => {
    setError(null);
    try {
      const [eventsResult, insightsResult] = await Promise.all([
        listCalendarEvents(api, { page: 1, limit: 500 }),
        getCalendarInsights(api)
      ]);
      setEvents(eventsResult.items);
      setInsights(insightsResult);
    } catch {
      setError("Failed to load calendar events");
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const calendarEvents = useMemo(
    () =>
      events.map((evt) => ({
        id: evt._id || evt.eventId || crypto.randomUUID(),
        title: evt.title,
        start: evt.startDate,
        end: evt.endDate,
        allDay: evt.allDay,
        color: evt.color || undefined,
        extendedProps: {
          description: evt.description,
          status: evt.status,
          location: evt.location,
          recurrence: evt.recurrence,
          tags: evt.tags
        }
      })),
    [events]
  );

  function handleDateSelect(selectInfo) {
    setCreateTitle("");
    setCreateDialog({ open: true, selectInfo });
    setTimeout(() => createInputRef.current?.focus(), 0);
  }

  async function handleCreateSubmit() {
    const title = createTitle.trim();
    if (!title) return;
    const { selectInfo } = createDialog;
    setCreateDialog({ open: false, selectInfo: null });
    setCreateTitle("");
    setError(null);
    try {
      await createCalendarEvent(api, {
        title,
        startDate: selectInfo.startStr,
        endDate: selectInfo.endStr,
        allDay: selectInfo.allDay
      });
      await loadAll();
    } catch {
      setError("Failed to create event");
    }
  }

  function handleEventClick(clickInfo) {
    const event = clickInfo.event;
    setActionInput("");
    setActionDialog({ open: true, event });
    setTimeout(() => actionInputRef.current?.focus(), 0);
  }

  async function handleActionSubmit() {
    const input = actionInput.trim();
    if (!input) return;
    const { event } = actionDialog;
    const eventId = event.id;
    setActionDialog({ open: false, event: null });
    setActionInput("");
    setError(null);
    try {
      if (input.toLowerCase() === "cancel") {
        await cancelCalendarEvent(api, eventId);
      } else if (input.toLowerCase() === "delete") {
        await deleteCalendarEvent(api, eventId);
      } else {
        await updateCalendarEvent(api, eventId, { title: input });
      }
      await loadAll();
    } catch {
      setError("Failed to update event");
    }
  }

  async function handleEventDrop(dropInfo) {
    const eventId = dropInfo.event.id;
    setError(null);
    try {
      await updateCalendarEvent(api, eventId, {
        startDate: dropInfo.event.startStr,
        endDate: dropInfo.event.endStr || dropInfo.event.startStr,
        allDay: dropInfo.event.allDay
      });
      await loadAll();
    } catch {
      setError("Failed to update event");
      dropInfo.revert();
    }
  }

  async function handleEventResize(resizeInfo) {
    const eventId = resizeInfo.event.id;
    setError(null);
    try {
      await updateCalendarEvent(api, eventId, {
        startDate: resizeInfo.event.startStr,
        endDate: resizeInfo.event.endStr
      });
      await loadAll();
    } catch {
      setError("Failed to update event");
      resizeInfo.revert();
    }
  }

  if (loading) {
    return (
      <section className="space-y-6">
        <Breadcrumb title="Calendar" items={[{ label: "Home", path: "/" }, { label: "Modules" }, { label: "Calendar" }]} />
        <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <style>{`
        .fc {
          --fc-bg-event: transparent;
          --fc-border-color: hsl(var(--border));
          --fc-button-bg-color: hsl(var(--primary));
          --fc-button-border-color: hsl(var(--primary));
          --fc-button-hover-bg-color: hsl(var(--primary) / 0.8);
          --fc-button-hover-border-color: hsl(var(--primary) / 0.8);
          --fc-button-active-bg-color: hsl(var(--primary) / 0.9);
          --fc-button-active-border-color: hsl(var(--primary) / 0.9);
          --fc-today-bg-color: hsl(var(--primary) / 0.08);
          --fc-page-bg-color: transparent;
          --fc-neutral-bg-color: hsl(var(--secondary) / 0.3);
          --fc-list-event-hover-bg-color: hsl(var(--muted) / 0.5);
          color: hsl(var(--foreground));
          font-family: inherit;
        }
        .fc .fc-col-header-cell { background: hsl(var(--secondary) / 0.5); }
        .fc .fc-daygrid-day-number,
        .fc .fc-col-header-cell-cushion { color: hsl(var(--foreground)); text-decoration: none; }
        .fc .fc-button { font-size: 0.8rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
        .fc .fc-toolbar-title { font-size: 1.15rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
        .fc .fc-scrollgrid { border-color: hsl(var(--border)); }
        .fc td, .fc th { border-color: hsl(var(--border)); }
      `}</style>

      <Breadcrumb title="Calendar" items={[{ label: "Home", path: "/" }, { label: "Modules" }, { label: "Calendar" }]} />

      {insights ? (
        <Card className="industrial-card">
          <CardContent className="p-4 flex flex-wrap gap-x-6 gap-y-2">
            <div>
              <span className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Scheduled</span>
              <span className="ml-2 font-bold">{insights.counts?.scheduled ?? insights.scheduled}</span>
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Cancelled</span>
              <span className="ml-2 font-bold">{insights.counts?.cancelled ?? insights.cancelled}</span>
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Upcoming</span>
              <span className="ml-2 font-bold">{insights.counts?.upcoming ?? insights.upcoming}</span>
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Past</span>
              <span className="ml-2 font-bold">{insights.counts?.past ?? insights.past}</span>
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Total</span>
              <span className="ml-2 font-bold">{insights.counts?.totalEvents ?? insights.total}</span>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {error ? (
        <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-sm px-3 py-2">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      ) : null}

      <Card className="industrial-card">
        <CardContent className="p-4">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek"
            }}
            events={calendarEvents}
            editable={true}
            droppable={true}
            selectable={true}
            selectMirror={true}
            dayMaxEvents={true}
            select={handleDateSelect}
            eventClick={handleEventClick}
            eventDrop={handleEventDrop}
            eventResize={handleEventResize}
            height="auto"
          />
        </CardContent>
      </Card>

      {/* Create event dialog */}
      {createDialog.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 dark:bg-black/70"
            onClick={() => setCreateDialog({ open: false, selectInfo: null })}
          />
          <div className="relative z-10 w-full max-w-md rounded-lg border bg-background p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">New Event</h2>
              <button
                className="text-muted-foreground hover:text-foreground"
                onClick={() => setCreateDialog({ open: false, selectInfo: null })}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleCreateSubmit();
              }}
            >
              <label className="text-sm font-medium">Event title</label>
              <Input
                ref={createInputRef}
                className="mt-1"
                placeholder="Enter event title"
                value={createTitle}
                onChange={(e) => setCreateTitle(e.target.value)}
              />
              <div className="flex justify-end gap-2 mt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCreateDialog({ open: false, selectInfo: null })}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={!createTitle.trim()}>
                  Create
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Event action dialog */}
      {actionDialog.open && actionDialog.event && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 dark:bg-black/70"
            onClick={() => setActionDialog({ open: false, event: null })}
          />
          <div className="relative z-10 w-full max-w-md rounded-lg border bg-background p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Event Action</h2>
              <button
                className="text-muted-foreground hover:text-foreground"
                onClick={() => setActionDialog({ open: false, event: null })}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-muted-foreground mb-1">
              <span className="font-medium text-foreground">{actionDialog.event.title}</span>
              {actionDialog.event.extendedProps?.status && (
                <> &middot; {actionDialog.event.extendedProps.status}</>
              )}
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleActionSubmit();
              }}
            >
              <label className="text-sm font-medium">
                Type &quot;cancel&quot; to cancel, &quot;delete&quot; to delete, or a new title to
                rename
              </label>
              <Input
                ref={actionInputRef}
                className="mt-1"
                placeholder='e.g. "cancel", "delete", or new title'
                value={actionInput}
                onChange={(e) => setActionInput(e.target.value)}
              />
              <div className="flex justify-end gap-2 mt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setActionDialog({ open: false, event: null })}
                >
                  Close
                </Button>
                <Button type="submit" disabled={!actionInput.trim()}>
                  Confirm
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
