import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { HexColorPicker } from "react-colorful";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import { Upload, X, Star } from "lucide-react";
import { Breadcrumb } from "../../components/common/Breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Button } from "../../components/ui/button";
import { useTheme } from "../../core/theme/ThemeContext";

const BREADCRUMB_ITEMS = [
  { label: "Home", path: "/" },
  { label: "Forms" },
  { label: "Elements" },
];

const validationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  age: z.coerce.number({ invalid_type_error: "Age must be a number" }).int().min(1, "Min age is 1").max(120, "Max age is 120"),
  website: z.string().url("Invalid URL").or(z.literal("")),
});

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

function FileUploadSection() {
  const [files, setFiles] = useState([]);

  const onDrop = useCallback((accepted) => {
    setFiles((prev) => [...prev, ...accepted.map((f) => ({ file: f, id: `${f.name}-${Date.now()}` }))]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    maxFiles: 5,
  });

  const removeFile = (id) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">File Upload (Dropzone)</CardTitle></CardHeader>
      <CardContent>
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}
        >
          <input {...getInputProps()} />
          <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            {isDragActive ? "Drop files here..." : "Drag & drop files here or click to browse"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Images only, max 5 files</p>
        </div>
        {files.length > 0 && (
          <div className="mt-4 space-y-2">
            {files.map((f) => (
              <div key={f.id} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{f.file.name}</p>
                  <p className="text-xs text-muted-foreground">{formatFileSize(f.file.size)}</p>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => removeFile(f.id)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function FormValidationSection() {
  const [submitted, setSubmitted] = useState(false);
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(validationSchema),
    defaultValues: { name: "", email: "", password: "", age: "", website: "" },
  });

  const onSubmit = () => {
    setSubmitted(true);
    reset();
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Form Validation (react-hook-form + zod)</CardTitle></CardHeader>
      <CardContent>
        {submitted && (
          <div className="mb-4 p-3 rounded-md bg-green-500/10 border border-green-500/30 text-green-600 dark:text-green-400 text-sm">
            Form submitted successfully!
          </div>
        )}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="val-name">Name *</Label>
            <Input id="val-name" {...register("name")} placeholder="John Doe" className="mt-1" />
            {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <Label htmlFor="val-email">Email *</Label>
            <Input id="val-email" type="email" {...register("email")} placeholder="john@example.com" className="mt-1" />
            {errors.email && <p className="text-sm text-destructive mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <Label htmlFor="val-password">Password *</Label>
            <Input id="val-password" type="password" {...register("password")} placeholder="Min 8 characters" className="mt-1" />
            {errors.password && <p className="text-sm text-destructive mt-1">{errors.password.message}</p>}
          </div>
          <div>
            <Label htmlFor="val-age">Age *</Label>
            <Input id="val-age" type="number" {...register("age")} placeholder="25" className="mt-1" />
            {errors.age && <p className="text-sm text-destructive mt-1">{errors.age.message}</p>}
          </div>
          <div>
            <Label htmlFor="val-website">Website</Label>
            <Input id="val-website" {...register("website")} placeholder="https://example.com" className="mt-1" />
            {errors.website && <p className="text-sm text-destructive mt-1">{errors.website.message}</p>}
          </div>
          <Button type="submit">Submit Form</Button>
        </form>
      </CardContent>
    </Card>
  );
}

function DatePickerSection() {
  const { mode } = useTheme();
  const isDark = mode === "dark";
  const [singleDate, setSingleDate] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Date Picker</CardTitle></CardHeader>
      <CardContent>
        {isDark && (
          <style>{`
            .react-datepicker { background-color: hsl(var(--card)); border-color: hsl(var(--border)); color: hsl(var(--foreground)); }
            .react-datepicker__header { background-color: hsl(var(--muted)); border-color: hsl(var(--border)); }
            .react-datepicker__current-month, .react-datepicker__day-name, .react-datepicker__day { color: hsl(var(--foreground)); }
            .react-datepicker__day:hover { background-color: hsl(var(--accent)); }
            .react-datepicker__day--selected, .react-datepicker__day--in-range { background-color: hsl(var(--primary)) !important; color: hsl(var(--primary-foreground)) !important; }
            .react-datepicker__day--in-selecting-range { background-color: hsl(var(--primary) / 0.5) !important; }
            .react-datepicker__navigation-icon::before { border-color: hsl(var(--foreground)); }
            .react-datepicker__triangle { display: none; }
          `}</style>
        )}
        <div className="space-y-4">
          <div>
            <Label>Single Date</Label>
            <div className="mt-1">
              <DatePicker
                selected={singleDate}
                onChange={setSingleDate}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholderText="Pick a date"
                dateFormat="yyyy-MM-dd"
              />
            </div>
          </div>
          <div>
            <Label>Date Range</Label>
            <div className="mt-1 flex gap-2">
              <DatePicker
                selected={startDate}
                onChange={setStartDate}
                selectsStart
                startDate={startDate}
                endDate={endDate}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholderText="Start date"
                dateFormat="yyyy-MM-dd"
              />
              <DatePicker
                selected={endDate}
                onChange={setEndDate}
                selectsEnd
                startDate={startDate}
                endDate={endDate}
                minDate={startDate}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholderText="End date"
                dateFormat="yyyy-MM-dd"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ColorPickerSection() {
  const [color, setColor] = useState("#6366f1");

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Color Picker</CardTitle></CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-4">
          <HexColorPicker color={color} onChange={setColor} />
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md border border-border shadow-sm" style={{ backgroundColor: color }} />
            <span className="text-sm font-mono font-medium">{color}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function RangeSliderSection() {
  const { mode } = useTheme();
  const isDark = mode === "dark";
  const [single, setSingle] = useState(40);
  const [range, setRange] = useState([20, 60]);

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Range Slider</CardTitle></CardHeader>
      <CardContent>
        {isDark && (
          <style>{`
            .rc-slider-rail { background-color: hsl(var(--muted)); }
            .rc-slider-track { background-color: hsl(var(--primary)); }
            .rc-slider-handle { border-color: hsl(var(--primary)); background-color: hsl(var(--card)); }
            .rc-slider-handle:hover, .rc-slider-handle:active { border-color: hsl(var(--primary)); box-shadow: 0 0 0 4px hsl(var(--primary) / 0.2); }
          `}</style>
        )}
        <div className="space-y-6">
          <div>
            <Label>Single Slider: <span className="font-mono text-primary">{single}</span></Label>
            <div className="mt-3 px-2">
              <Slider min={0} max={100} value={single} onChange={setSingle} />
            </div>
          </div>
          <div>
            <Label>Range Slider: <span className="font-mono text-primary">{range[0]} - {range[1]}</span></Label>
            <div className="mt-3 px-2">
              <Slider range min={0} max={100} value={range} onChange={setRange} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function RatingSection() {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Star Rating</CardTitle></CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-3">
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => {
              const filled = star <= (hover || rating);
              return (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(0)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-7 h-7 transition-colors ${filled ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`}
                  />
                </button>
              );
            })}
          </div>
          <p className="text-sm text-muted-foreground">
            {rating > 0 ? `You rated ${rating} out of 5` : "Click a star to rate"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function FormElementsPage() {
  return (
    <div>
      <Breadcrumb title="Form Elements" items={BREADCRUMB_ITEMS} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FileUploadSection />
        <FormValidationSection />
        <DatePickerSection />
        <ColorPickerSection />
        <RangeSliderSection />
        <RatingSection />
      </div>
    </div>
  );
}
