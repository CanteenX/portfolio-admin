import { useState, useCallback, useRef } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Breadcrumb } from "../../components/common/Breadcrumb";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Plus, GripVertical, X } from "lucide-react";

const PRIORITY_VARIANT = { high: "destructive", medium: "default", low: "secondary" };

const INITIAL_COLUMNS = {
  todo: {
    id: "todo",
    title: "To Do",
    cards: [
      { id: "t1", title: "Design system audit", description: "Review all component tokens", priority: "high", assignee: "AB" },
      { id: "t2", title: "Setup CI pipeline", description: "Configure GitHub Actions", priority: "medium", assignee: "CD" },
      { id: "t3", title: "Write API specs", description: "OpenAPI 3.0 documentation", priority: "low", assignee: "EF" },
      { id: "t4", title: "Database schema review", description: "Normalize user tables", priority: "medium", assignee: "GH" },
    ],
  },
  inProgress: {
    id: "inProgress",
    title: "In Progress",
    cards: [
      { id: "p1", title: "Auth module refactor", description: "Migrate to JWT refresh tokens", priority: "high", assignee: "CD" },
      { id: "p2", title: "Dashboard widgets", description: "Build chart components", priority: "medium", assignee: "AB" },
      { id: "p3", title: "E2E test suite", description: "Playwright test coverage", priority: "low", assignee: "IJ" },
    ],
  },
  inReview: {
    id: "inReview",
    title: "In Review",
    cards: [
      { id: "r1", title: "Payment integration", description: "Stripe webhook handlers", priority: "high", assignee: "EF" },
      { id: "r2", title: "Email templates", description: "Transactional email designs", priority: "medium", assignee: "GH" },
      { id: "r3", title: "Role permissions", description: "RBAC middleware updates", priority: "high", assignee: "AB" },
    ],
  },
  done: {
    id: "done",
    title: "Done",
    cards: [
      { id: "d1", title: "Project scaffolding", description: "Monorepo with Turborepo", priority: "low", assignee: "CD" },
      { id: "d2", title: "Theme system", description: "Dark/light mode toggle", priority: "medium", assignee: "AB" },
      { id: "d3", title: "i18n setup", description: "8 language support", priority: "low", assignee: "IJ" },
      { id: "d4", title: "Breadcrumb component", description: "Reusable navigation breadcrumbs", priority: "low", assignee: "EF" },
      { id: "d5", title: "Error pages", description: "404, 500, offline views", priority: "medium", assignee: "GH" },
    ],
  },
};

const COLUMN_ORDER = ["todo", "inProgress", "inReview", "done"];

let cardIdCounter = 100;

export default function KanbanPage() {
  const [columns, setColumns] = useState(INITIAL_COLUMNS);
  const [addCardDialog, setAddCardDialog] = useState({ open: false, columnId: null });
  const [addCardTitle, setAddCardTitle] = useState("");
  const addCardInputRef = useRef(null);

  const handleDragEnd = useCallback((result) => {
    const { source, destination } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    setColumns((prev) => {
      const sourceCol = prev[source.droppableId];
      const destCol = prev[destination.droppableId];
      const sourceCards = [...sourceCol.cards];
      const [moved] = sourceCards.splice(source.index, 1);

      if (source.droppableId === destination.droppableId) {
        sourceCards.splice(destination.index, 0, moved);
        return { ...prev, [source.droppableId]: { ...sourceCol, cards: sourceCards } };
      }

      const destCards = [...destCol.cards];
      destCards.splice(destination.index, 0, moved);
      return {
        ...prev,
        [source.droppableId]: { ...sourceCol, cards: sourceCards },
        [destination.droppableId]: { ...destCol, cards: destCards },
      };
    });
  }, []);

  function openAddCardDialog(columnId) {
    setAddCardTitle("");
    setAddCardDialog({ open: true, columnId });
    setTimeout(() => addCardInputRef.current?.focus(), 0);
  }

  function handleAddCardSubmit() {
    const title = addCardTitle.trim();
    if (!title) return;
    const { columnId } = addCardDialog;
    const newCard = {
      id: `card-${++cardIdCounter}`,
      title,
      description: "New task",
      priority: "medium",
      assignee: "??",
    };
    setColumns((prev) => ({
      ...prev,
      [columnId]: { ...prev[columnId], cards: [...prev[columnId].cards, newCard] },
    }));
    setAddCardDialog({ open: false, columnId: null });
    setAddCardTitle("");
  }

  return (
    <section className="space-y-6">
      <Breadcrumb title="Kanban Board" items={[{ label: "Home", path: "/" }, { label: "Apps" }, { label: "Kanban" }]} />

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {COLUMN_ORDER.map((colKey) => {
            const col = columns[colKey];
            return (
              <div key={col.id} className="flex-shrink-0 w-72">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-display text-sm font-bold uppercase tracking-wider text-muted-foreground">
                    {col.title}
                    <span className="ml-2 text-xs opacity-60">({col.cards.length})</span>
                  </h3>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => openAddCardDialog(col.id)}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                <Droppable droppableId={col.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`space-y-2 min-h-[120px] rounded-sm p-2 transition-colors ${
                        snapshot.isDraggingOver ? "bg-primary/5 ring-1 ring-primary/20" : "bg-secondary/20"
                      }`}
                    >
                      {col.cards.map((card, index) => (
                        <Draggable key={card.id} draggableId={card.id} index={index}>
                          {(dragProvided, dragSnapshot) => (
                            <div
                              ref={dragProvided.innerRef}
                              {...dragProvided.draggableProps}
                              {...dragProvided.dragHandleProps}
                            >
                              <Card className={`industrial-card transition-shadow ${dragSnapshot.isDragging ? "shadow-lg ring-1 ring-primary/30" : ""}`}>
                                <CardContent className="p-3">
                                  <div className="flex items-start justify-between gap-2">
                                    <p className="font-bold text-sm">{card.title}</p>
                                    <GripVertical className="w-4 h-4 text-muted-foreground flex-shrink-0 opacity-40" />
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{card.description}</p>
                                  <div className="flex items-center justify-between mt-2">
                                    <Badge variant={PRIORITY_VARIANT[card.priority] || "secondary"} className="text-xs">
                                      {card.priority}
                                    </Badge>
                                    <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
                                      {card.assignee}
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>

      {/* Add card dialog */}
      {addCardDialog.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setAddCardDialog({ open: false, columnId: null })}
          />
          <div className="relative z-10 w-full max-w-sm rounded-lg border bg-background p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Add Card</h2>
              <button
                className="text-muted-foreground hover:text-foreground"
                onClick={() => setAddCardDialog({ open: false, columnId: null })}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAddCardSubmit();
              }}
            >
              <label className="text-sm font-medium">Card title</label>
              <Input
                ref={addCardInputRef}
                className="mt-1"
                placeholder="Enter card title"
                value={addCardTitle}
                onChange={(e) => setAddCardTitle(e.target.value)}
              />
              <div className="flex justify-end gap-2 mt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setAddCardDialog({ open: false, columnId: null })}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={!addCardTitle.trim()}>
                  Add
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
