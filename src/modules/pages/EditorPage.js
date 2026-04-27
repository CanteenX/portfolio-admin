import { Component, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import DOMPurify from "dompurify";
import { Breadcrumb } from "../../components/common/Breadcrumb";
import { Card, CardContent } from "../../components/ui/card";
import { AlertCircle } from "lucide-react";

const TOOLBAR_OPTIONS = [
  ["bold", "italic", "underline", "strike"],
  [{ header: 1 }, { header: 2 }],
  [{ list: "ordered" }, { list: "bullet" }],
  ["blockquote", "code-block"],
  ["link", "image"],
  ["clean"],
];

const INITIAL_CONTENT = `<h2>Welcome to the Rich Text Editor</h2>
<p>This editor supports <strong>bold</strong>, <em>italic</em>, <u>underline</u>, and <s>strikethrough</s> formatting.</p>
<h3>Features</h3>
<ul>
  <li>Headers and text styling</li>
  <li>Ordered and unordered lists</li>
  <li>Blockquotes and code blocks</li>
  <li>Links and images</li>
</ul>
<blockquote>Start editing to see the HTML preview update in real time.</blockquote>`;

// Error Boundary for ReactQuill (React 19 compatibility layer)
class QuillErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(_error, _errorInfo) {
  }

  render() {
    if (this.state.hasError) {
      return <FallbackEditor value={this.props.value} onChange={this.props.onChange} />;
    }
    return this.props.children;
  }
}

// Fallback editor when ReactQuill fails
function FallbackEditor({ value, onChange }) {
  const [rawHtml, setRawHtml] = useState(value);

  const handleChange = (e) => {
    const newValue = e.target.value;
    setRawHtml(newValue);
    onChange(newValue);
  };

  return (
    <div className="border border-border rounded-sm overflow-hidden">
      <div className="bg-yellow-500/10 border-b border-border px-3 py-2 flex items-center gap-2 text-sm">
        <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-500" />
        <span className="text-yellow-800 dark:text-yellow-300">
          Rich text editor unavailable (React 19 compatibility). Using HTML editor.
        </span>
      </div>
      <textarea
        className="w-full min-h-[250px] p-4 bg-transparent text-foreground font-mono text-sm resize-y focus:outline-none focus:ring-2 focus:ring-primary/20"
        value={rawHtml}
        onChange={handleChange}
        placeholder="Enter HTML content..."
      />
    </div>
  );
}

export default function EditorPage() {
  const [content, setContent] = useState(INITIAL_CONTENT);

  return (
    <section className="space-y-6">
      <style>{`
        .ql-toolbar.ql-snow {
          border-color: hsl(var(--border));
          background: hsl(var(--secondary) / 0.3);
          border-radius: 0.125rem 0.125rem 0 0;
        }
        .ql-container.ql-snow {
          border-color: hsl(var(--border));
          border-radius: 0 0 0.125rem 0.125rem;
          min-height: 250px;
          font-family: inherit;
          font-size: 0.9375rem;
        }
        .ql-editor {
          color: hsl(var(--foreground));
          min-height: 250px;
        }
        .ql-editor.ql-blank::before {
          color: hsl(var(--muted-foreground));
        }
        .ql-snow .ql-stroke { stroke: hsl(var(--foreground)); }
        .ql-snow .ql-fill { fill: hsl(var(--foreground)); }
        .ql-snow .ql-picker { color: hsl(var(--foreground)); }
        .ql-snow .ql-picker-options {
          background: hsl(var(--card));
          border-color: hsl(var(--border));
        }
        .ql-snow .ql-picker-label:hover,
        .ql-snow .ql-picker-item:hover { color: hsl(var(--primary)); }
        .ql-snow .ql-active .ql-stroke { stroke: hsl(var(--primary)); }
        .ql-snow .ql-active .ql-fill { fill: hsl(var(--primary)); }
        .ql-snow button:hover .ql-stroke { stroke: hsl(var(--primary)); }
        .ql-snow button:hover .ql-fill { fill: hsl(var(--primary)); }
      `}</style>

      <Breadcrumb title="Editor" items={[{ label: "Home", path: "/" }, { label: "Apps" }, { label: "Editor" }]} />

      <Card className="industrial-card">
        <CardContent className="p-4">
          <h3 className="font-display text-lg font-bold uppercase tracking-tight mb-4">Rich Text Editor</h3>
          <QuillErrorBoundary value={content} onChange={setContent}>
            <ReactQuill
              theme="snow"
              value={content}
              onChange={setContent}
              modules={{ toolbar: TOOLBAR_OPTIONS }}
              placeholder="Start writing..."
            />
          </QuillErrorBoundary>
        </CardContent>
      </Card>

      <Card className="industrial-card">
        <CardContent className="p-4">
          <h3 className="font-display text-lg font-bold uppercase tracking-tight mb-4">Preview</h3>
          <div
            className="prose prose-sm max-w-none dark:prose-invert border border-border rounded-sm p-4 min-h-[100px]"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }}
          />
        </CardContent>
      </Card>
    </section>
  );
}
