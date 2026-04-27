import { useState, useEffect, useCallback } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import SimpleBar from "simplebar-react";
import "simplebar-react/dist/simplebar.min.css";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { GripVertical } from "lucide-react";
import { Breadcrumb } from "../../components/common/Breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";

const BREADCRUMB_ITEMS = [
  { label: "Home", path: "/" },
  { label: "UI" },
  { label: "Advanced" },
];

const SCROLLBAR_ITEMS = Array.from({ length: 25 }, (_, i) => ({
  id: i + 1,
  label: `List item ${i + 1}`,
  detail: `Description for item ${i + 1}`,
}));

const SLIDE_GRADIENTS = [
  "from-violet-500 to-purple-600",
  "from-blue-500 to-cyan-600",
  "from-emerald-500 to-teal-600",
  "from-orange-500 to-red-500",
  "from-pink-500 to-rose-600",
];

const LIGHTBOX_SLIDES = Array.from({ length: 6 }, (_, i) => ({
  src: `https://picsum.photos/seed/${i + 1}/800/600`,
}));

const THUMB_GRADIENTS = [
  "from-blue-400 to-indigo-600",
  "from-green-400 to-emerald-600",
  "from-purple-400 to-violet-600",
  "from-orange-400 to-amber-600",
  "from-pink-400 to-rose-600",
  "from-cyan-400 to-teal-600",
];

const INITIAL_SORTABLE = [
  { id: "s1", title: "Dashboard Layout", badge: "UI" },
  { id: "s2", title: "User Management", badge: "Core" },
  { id: "s3", title: "API Integration", badge: "Backend" },
  { id: "s4", title: "Payment Gateway", badge: "Finance" },
  { id: "s5", title: "Email Templates", badge: "Comms" },
  { id: "s6", title: "Analytics Engine", badge: "Data" },
];

export default function AdvancedUiPage() {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [sortableItems, setSortableItems] = useState(INITIAL_SORTABLE);

  useEffect(() => {
    AOS.init({ duration: 800, once: true });
  }, []);

  const handleDragEnd = useCallback((result) => {
    if (!result.destination) return;
    const reordered = Array.from(sortableItems);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    setSortableItems(reordered);
  }, [sortableItems]);

  const openLightbox = (index) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  return (
    <div>
      <Breadcrumb title="Advanced UI" items={BREADCRUMB_ITEMS} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section 1: Custom Scrollbar */}
        <div data-aos="fade-up">
          <Card>
            <CardHeader>
              <CardTitle>Custom Scrollbar</CardTitle>
            </CardHeader>
            <CardContent>
              <SimpleBar style={{ maxHeight: 200 }}>
                <div className="space-y-2 pr-2">
                  {SCROLLBAR_ITEMS.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 rounded-md bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                          {item.id}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{item.label}</p>
                          <p className="text-xs text-muted-foreground">{item.detail}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </SimpleBar>
            </CardContent>
          </Card>
        </div>

        {/* Section 2: Swiper Slider */}
        <div data-aos="fade-up" data-aos-delay="100">
          <Card>
            <CardHeader>
              <CardTitle>Swiper Slider</CardTitle>
            </CardHeader>
            <CardContent>
              <Swiper
                modules={[Navigation, Pagination, Autoplay]}
                slidesPerView={1}
                spaceBetween={30}
                navigation
                pagination={{ clickable: true }}
                autoplay={{ delay: 3000, disableOnInteraction: false }}
                className="rounded-lg overflow-hidden"
              >
                {SLIDE_GRADIENTS.map((grad, i) => (
                  <SwiperSlide key={grad}>
                    <div
                      className={`h-[250px] bg-gradient-to-br ${grad} flex flex-col items-center justify-center`}
                    >
                      <span className="text-white text-6xl font-bold opacity-80">{i + 1}</span>
                      <span className="text-white/70 text-sm mt-2">Slide {i + 1}</span>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </CardContent>
          </Card>
        </div>

        {/* Section 3: Image Lightbox */}
        <div data-aos="fade-up" data-aos-delay="200">
          <Card>
            <CardHeader>
              <CardTitle>Image Lightbox</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                {THUMB_GRADIENTS.map((grad, i) => (
                  <button
                    key={grad}
                    onClick={() => openLightbox(i)}
                    className={`aspect-[4/3] rounded-lg bg-gradient-to-br ${grad} flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity hover:scale-105 transform duration-200`}
                  >
                    <span className="text-white text-2xl font-bold opacity-80">{i + 1}</span>
                  </button>
                ))}
              </div>
              <Lightbox
                open={lightboxOpen}
                close={() => setLightboxOpen(false)}
                index={lightboxIndex}
                slides={LIGHTBOX_SLIDES}
              />
            </CardContent>
          </Card>
        </div>

        {/* Section 4: Sortable List */}
        <div data-aos="fade-up" data-aos-delay="300">
          <Card>
            <CardHeader>
              <CardTitle>Sortable List</CardTitle>
            </CardHeader>
            <CardContent>
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="sortable-list">
                  {(provided) => (
                    <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2">
                      {sortableItems.map((item, index) => (
                        <Draggable key={item.id} draggableId={item.id} index={index}>
                          {(dragProvided, snapshot) => (
                            <div
                              ref={dragProvided.innerRef}
                              {...dragProvided.draggableProps}
                              {...dragProvided.dragHandleProps}
                              className={`flex items-center gap-3 p-3 rounded-md border transition-colors ${
                                snapshot.isDragging
                                  ? "bg-primary/10 border-primary shadow-lg"
                                  : "bg-card border-border hover:bg-muted/50"
                              }`}
                            >
                              <GripVertical className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                              <span className="flex-1 text-sm font-medium">{item.title}</span>
                              <Badge variant="secondary">{item.badge}</Badge>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
