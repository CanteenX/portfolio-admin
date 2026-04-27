/**
 * Trigger Form Page (Create/Edit)
 *
 * Form for creating or editing WhatsApp event triggers with variable mapping.
 * Allows configuration of:
 * - Basic trigger info (event key, display name, template)
 * - Available params for event context
 * - Variable mapping from template placeholders to data sources
 */

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../../../core/auth/AuthContext";
import { Breadcrumb } from "../../../components/common/Breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { Switch } from "../../../components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table";
import { AlertCircle, Save, X, Plus, Trash2, Eye } from "lucide-react";

export function TriggerFormPage() {
  const { triggerId } = useParams();
  const navigate = useNavigate();
  const { api } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form fields
  const [eventKey, setEventKey] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [isActive, setIsActive] = useState(true);

  // Available params for event context
  const [availableParams, setAvailableParams] = useState([]);

  // Variable mapping
  const [variableMappings, setVariableMappings] = useState([]);

  // Templates list
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const isEditMode = Boolean(triggerId);

  useEffect(() => {
    loadTemplates();
    if (isEditMode) {
      loadTrigger();
    }
  }, [triggerId]);

  async function loadTemplates() {
    try {
      // TODO: Replace with actual SDK call
      // const result = await api.whatsapp.listApprovedTemplates();

      // Mock data
      const mockTemplates = [
        {
          _id: "tmpl1",
          name: "connection_request_notification",
          category: "MARKETING",
          language: "en",
          body: "Hi {{1}}! {{2}} sent you a connection request.",
          variableCount: 2,
        },
        {
          _id: "tmpl2",
          name: "profile_completion_welcome",
          category: "UTILITY",
          language: "en",
          body: "Welcome {{1}}! Your profile is {{2}}% complete.",
          variableCount: 2,
        },
        {
          _id: "tmpl3",
          name: "new_message_alert",
          category: "UTILITY",
          language: "en",
          body: "Hello {{1}}, you have a new message from {{2}}: {{3}}",
          variableCount: 3,
        },
      ];

      setTemplates(mockTemplates);
    } catch (err) {
      toast.error("Failed to load templates");
    }
  }

  async function loadTrigger() {
    setLoading(true);
    try {
      // TODO: Replace with actual SDK call
      // const trigger = await api.whatsapp.getTrigger(triggerId);

      // Mock data
      const mockTrigger = {
        _id: triggerId,
        eventKey: "CONNECTION_REQUEST_SENT",
        displayName: "Connection Request Sent",
        description: "Notifies user when they send a connection request",
        templateId: "tmpl1",
        isActive: true,
        availableParams: [
          { key: "senderName", label: "Sender Name", source: "context" },
          { key: "receiverName", label: "Receiver Name", source: "context" },
        ],
        variableMappings: [
          { position: 1, source: "user_field", key: "personalProfile.name", fallback: "User" },
          { position: 2, source: "context", key: "receiverName", fallback: "Someone" },
        ],
      };

      setEventKey(mockTrigger.eventKey);
      setDisplayName(mockTrigger.displayName);
      setDescription(mockTrigger.description || "");
      setSelectedTemplateId(mockTrigger.templateId);
      setIsActive(mockTrigger.isActive);
      setAvailableParams(mockTrigger.availableParams || []);
      setVariableMappings(mockTrigger.variableMappings || []);

      // Set selected template
      const template = templates.find((t) => t._id === mockTrigger.templateId);
      if (template) setSelectedTemplate(template);
    } catch (err) {
      setError("Failed to load trigger");
      toast.error("Failed to load trigger");
    } finally {
      setLoading(false);
    }
  }

  function handleTemplateChange(templateId) {
    setSelectedTemplateId(templateId);
    const template = templates.find((t) => t._id === templateId);
    setSelectedTemplate(template);

    // Initialize variable mappings based on template variable count
    if (template) {
      const mappings = [];
      for (let i = 1; i <= template.variableCount; i++) {
        mappings.push({
          position: i,
          source: "static",
          key: "",
          fallback: "",
        });
      }
      setVariableMappings(mappings);
    }
  }

  function updateVariableMapping(position, field, value) {
    setVariableMappings((prev) =>
      prev.map((mapping) =>
        mapping.position === position ? { ...mapping, [field]: value } : mapping
      )
    );
  }

  function addAvailableParam() {
    setAvailableParams((prev) => [
      ...prev,
      { key: "", label: "", source: "context" },
    ]);
  }

  function updateAvailableParam(index, field, value) {
    setAvailableParams((prev) =>
      prev.map((param, i) => (i === index ? { ...param, [field]: value } : param))
    );
  }

  function removeAvailableParam(index) {
    setAvailableParams((prev) => prev.filter((_, i) => i !== index));
  }

  function validateForm() {
    if (!eventKey || eventKey.trim().length < 3) {
      setError("Event Key must be at least 3 characters");
      return false;
    }

    if (!displayName || displayName.trim().length < 3) {
      setError("Display Name must be at least 3 characters");
      return false;
    }

    if (!selectedTemplateId) {
      setError("Please select a template");
      return false;
    }

    // Validate variable mappings
    for (const mapping of variableMappings) {
      if (!mapping.source) {
        setError(`Variable mapping for position ${mapping.position} is missing a source`);
        return false;
      }
      if (mapping.source !== "static" && !mapping.key) {
        setError(`Variable mapping for position ${mapping.position} is missing a key`);
        return false;
      }
    }

    setError(null);
    return true;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        eventKey: eventKey.trim().toUpperCase(),
        displayName: displayName.trim(),
        description: description.trim(),
        templateId: selectedTemplateId,
        isActive,
        availableParams,
        variableMappings,
      };

      if (isEditMode) {
        // TODO: Replace with actual SDK call
        // await api.whatsapp.updateTrigger(triggerId, payload);
        toast.success("Trigger updated successfully");
      } else {
        // TODO: Replace with actual SDK call
        // await api.whatsapp.createTrigger(payload);
        toast.success("Trigger created successfully");
      }

      navigate("/whatsapp/triggers");
    } catch (err) {
      const errorMessage = isEditMode ? "Failed to update trigger" : "Failed to create trigger";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  function handleCancel() {
    navigate("/whatsapp/triggers");
  }

  return (
    <section className="space-y-6">
      <Breadcrumb
        title={isEditMode ? "Edit Trigger" : "Create Trigger"}
        items={[
          { label: "Home", path: "/" },
          { label: "WhatsApp" },
          { label: "Triggers", path: "/whatsapp/triggers" },
          { label: isEditMode ? "Edit" : "Create" },
        ]}
      />

      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-sm px-3 py-2">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <Card className="industrial-card">
          <CardHeader>
            <CardTitle className="font-display uppercase tracking-tight">
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="uppercase tracking-wider text-xs font-bold" htmlFor="eventKey">
                  Event Key <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="eventKey"
                  placeholder="e.g., CONNECTION_REQUEST_SENT"
                  value={eventKey}
                  onChange={(e) => setEventKey(e.target.value.toUpperCase())}
                  required
                  className="bg-background border-input rounded-sm font-mono"
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground">
                  Unique identifier for the event (uppercase, underscores)
                </p>
              </div>

              <div className="space-y-2">
                <Label className="uppercase tracking-wider text-xs font-bold" htmlFor="displayName">
                  Display Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="displayName"
                  placeholder="e.g., Connection Request Sent"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                  className="bg-background border-input rounded-sm"
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground">Human-readable name for the trigger</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="uppercase tracking-wider text-xs font-bold" htmlFor="description">
                Description
              </Label>
              <textarea
                id="description"
                className="flex min-h-[100px] w-full rounded-sm border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
                placeholder="Describe when this trigger fires and what it does"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="uppercase tracking-wider text-xs font-bold" htmlFor="template">
                  Template <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={selectedTemplateId}
                  onValueChange={handleTemplateChange}
                  disabled={loading}
                >
                  <SelectTrigger id="template" className="bg-background border-input rounded-sm">
                    <SelectValue placeholder="Select template" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border rounded-sm">
                    {templates.map((template) => (
                      <SelectItem key={template._id} value={template._id}>
                        {template.name} ({template.variableCount} variables)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  WhatsApp message template (must be approved)
                </p>
              </div>

              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="isActive" className="font-bold uppercase tracking-wider text-sm">
                  Active
                </Label>
                <Switch
                  id="isActive"
                  checked={isActive}
                  onCheckedChange={setIsActive}
                  disabled={loading}
                />
              </div>
            </div>

            {selectedTemplate && (
              <div className="space-y-2 p-4 bg-muted/50 rounded-sm border">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  <Label className="uppercase tracking-wider text-xs font-bold">
                    Template Preview
                  </Label>
                </div>
                <p className="text-sm font-mono bg-background p-3 rounded border">
                  {selectedTemplate.body}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Available Params */}
        <Card className="industrial-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="font-display uppercase tracking-tight">
                Available Params
              </CardTitle>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={addAvailableParam}
                disabled={loading}
                className="font-bold uppercase tracking-wider"
              >
                <Plus className="w-4 h-4" /> Add Param
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Define custom parameters that can be passed in the event context when this trigger fires.
            </p>
            {availableParams.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No available params defined. Click "Add Param" to add one.
              </p>
            ) : (
              <div className="space-y-3">
                {availableParams.map((param, index) => (
                  <div key={index} className="flex gap-3 items-end">
                    <div className="flex-1 space-y-2">
                      <Label className="uppercase tracking-wider text-xs font-bold">Key</Label>
                      <Input
                        placeholder="e.g., senderName"
                        value={param.key}
                        onChange={(e) => updateAvailableParam(index, "key", e.target.value)}
                        className="bg-background border-input rounded-sm font-mono"
                        disabled={loading}
                      />
                    </div>
                    <div className="flex-1 space-y-2">
                      <Label className="uppercase tracking-wider text-xs font-bold">Label</Label>
                      <Input
                        placeholder="e.g., Sender Name"
                        value={param.label}
                        onChange={(e) => updateAvailableParam(index, "label", e.target.value)}
                        className="bg-background border-input rounded-sm"
                        disabled={loading}
                      />
                    </div>
                    <div className="flex-1 space-y-2">
                      <Label className="uppercase tracking-wider text-xs font-bold">Source</Label>
                      <Select
                        value={param.source}
                        onValueChange={(value) => updateAvailableParam(index, "source", value)}
                        disabled={loading}
                      >
                        <SelectTrigger className="bg-background border-input rounded-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border rounded-sm">
                          <SelectItem value="context">Context</SelectItem>
                          <SelectItem value="user_field">User Field</SelectItem>
                          <SelectItem value="static">Static</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => removeAvailableParam(index)}
                      className="text-destructive"
                      disabled={loading}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Variable Mapping */}
        {selectedTemplate && variableMappings.length > 0 && (
          <Card className="industrial-card">
            <CardHeader>
              <CardTitle className="font-display uppercase tracking-tight">
                Variable Mapping
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Map each template variable to a data source. Sources can be runtime context data, user
                database fields, or static values.
              </p>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="uppercase tracking-wider text-xs font-bold">
                        Position
                      </TableHead>
                      <TableHead className="uppercase tracking-wider text-xs font-bold">
                        Source Type
                      </TableHead>
                      <TableHead className="uppercase tracking-wider text-xs font-bold">
                        Key / Value
                      </TableHead>
                      <TableHead className="uppercase tracking-wider text-xs font-bold">
                        Fallback (Optional)
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {variableMappings.map((mapping) => (
                      <TableRow key={mapping.position}>
                        <TableCell>
                          <Badge variant="outline" className="font-mono">
                            #{mapping.position}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={mapping.source}
                            onValueChange={(value) =>
                              updateVariableMapping(mapping.position, "source", value)
                            }
                            disabled={loading}
                          >
                            <SelectTrigger className="bg-background border-input rounded-sm w-[180px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-card border-border rounded-sm">
                              <SelectItem value="context">Context</SelectItem>
                              <SelectItem value="user_field">User Field</SelectItem>
                              <SelectItem value="static">Static</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Input
                            placeholder={
                              mapping.source === "context"
                                ? "e.g., senderName"
                                : mapping.source === "user_field"
                                ? "e.g., personalProfile.name"
                                : "e.g., Welcome!"
                            }
                            value={mapping.key}
                            onChange={(e) =>
                              updateVariableMapping(mapping.position, "key", e.target.value)
                            }
                            className="bg-background border-input rounded-sm font-mono"
                            disabled={loading}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            placeholder="Default value"
                            value={mapping.fallback}
                            onChange={(e) =>
                              updateVariableMapping(mapping.position, "fallback", e.target.value)
                            }
                            className="bg-background border-input rounded-sm"
                            disabled={loading}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-4 p-3 bg-muted/50 rounded-sm border text-sm space-y-1">
                <p className="font-bold">Source Types:</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>
                    <strong>Context:</strong> Runtime data passed when the event fires (e.g., senderName)
                  </li>
                  <li>
                    <strong>User Field:</strong> Database field from user document (e.g., personalProfile.name)
                  </li>
                  <li>
                    <strong>Static:</strong> Fixed value (e.g., "Welcome to DataSetu!")
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Form Actions */}
        <div className="flex gap-3">
          <Button
            type="submit"
            className="font-bold uppercase tracking-wider"
            disabled={loading}
          >
            <Save className="w-4 h-4" />
            {loading ? "Saving..." : "Save Trigger"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            className="font-bold uppercase tracking-wider"
            disabled={loading}
          >
            <X className="w-4 h-4" /> Cancel
          </Button>
        </div>
      </form>
    </section>
  );
}
