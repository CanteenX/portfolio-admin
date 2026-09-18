import { Component } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "../ui/button";

/**
 * Contains a render error to the page that threw it.
 *
 * Before this existed, any exception during render unmounted the whole React
 * tree — sidebar, header and all — leaving an empty <div id="root">. That is
 * how a bare `lazy()` and, separately, a table-hook API mismatch each turned a
 * single broken page into a white screen for the entire admin panel, including
 * the super admin's own user management.
 *
 * Mount it inside the layout, keyed on the pathname: inside, so navigation
 * survives a crash; keyed, so moving to another page clears the error rather
 * than leaving every subsequent page stuck showing it.
 */
export class RouteErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
    this.retry = this.retry.bind(this);
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // Surfaced in the console so a crash is diagnosable from the browser; the
    // component stack names the page, which the minified stack alone does not.
    console.error("Page crashed:", error, info?.componentStack);
  }

  retry() {
    this.setState({ error: null });
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="flex min-h-[60vh] items-center justify-center p-6">
        <div className="industrial-card w-full max-w-md p-8 text-center">
          <AlertTriangle className="mx-auto mb-4 h-10 w-10 text-destructive" />
          <h2 className="font-display text-xl font-bold uppercase tracking-tight">
            This page failed to load
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Something went wrong while rendering it. The rest of the panel is
            unaffected.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button variant="outline" onClick={this.retry} className="gap-2">
              <RotateCcw className="h-4 w-4" /> Try again
            </Button>
            <Button asChild>
              <Link to="/">Go to dashboard</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }
}
