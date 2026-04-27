/**
 * WhatsApp Template Create/Edit Page
 *
 * Form for creating or editing WhatsApp message templates.
 * Auto-detects variables from body text using {{1}}, {{2}} pattern.
 * Shows preview with sample values and allows field mapping configuration.
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table";
import { AlertCircle, Save, X, Send, Info, Eye } from "lucide-react";

export function TemplateCreatePage() {
  const { templateId } = useParams();
  const navigate = useNavigate();
  const { api } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form fields
  const [name, setName] = useState("");
  const [metaTemplateName, setMetaTemplateName] = useState("");
  const [language, setLanguage] = useState("en");
  const [category, setCategory] = useState("MARKETING");
  const [bodyText, setBodyText] = useState("");
  const [headerText, setHeaderText] = useState("");
  const [footerText, setFooterText] = useState("");
  const [metaStatus, setMetaStatus] = useState("");

  // Auto-detected variables
  const [variables, setVariables] = useState([]);

  const isEditMode = Boolean(templateId);

  useEffect(() => {
    if (isEditMode) {
      loadTemplate();
    }
  }, [templateId]);

  // Auto-detect variables when body text changes
  useEffect(() => {
    detectVariables(bodyText);
  }, [bodyText]);

  async function loadTemplate() {
    setLoading(true);
    try {
      // TODO: Replace with actual SDK call
      // const template = await api.whatsapp.getTemplate(templateId);

      // Mock data for now
      const mockTemplate = {
        _id: templateId,
        name: "welcome_message",
        metaTemplateName: "welcome_message_v2",
        language: "en",
        category: "MARKETING",
        bodyText: "Hello {{1}}! Welcome to {{2}}. We're excited to have you!",
        headerText: "Welcome",
        footerText: "Reply STOP to unsubscribe",
        metaStatus: "APPROVED",
        variables: [
          { position: 1, description: "User name", sampleValue: "John", fieldMapping: "user.name" },
          { position: 2, description: "Company name", sampleValue: "Acme Corp", fieldMapping: "custom" },
        ],
      };

      setName(mockTemplate.name);
      setMetaTemplateName(mockTemplate.metaTemplateName);
      setLanguage(mockTemplate.language);
      setCategory(mockTemplate.category);
      setBodyText(mockTemplate.bodyText);
      setHeaderText(mockTemplate.headerText || "");
      setFooterText(mockTemplate.footerText || "");
      setMetaStatus(mockTemplate.metaStatus);
      setVariables(mockTemplate.variables || []);
    } catch (err) {
      setError("Failed to load template");
      toast.error("Failed to load template");
    } finally {
      setLoading(false);
    }
  }

  function detectVariables(text) {
    const regex = /\{\{(\d+)\}\}/g;
    const matches = [...text.matchAll(regex)];
    const positions = [...new Set(matches.map((m) => parseInt(m[1])))].sort((a, b) => a - b);

    setVariables((prevVars) => {
      const newVars = positions.map((pos) => {
        const existingVar = prevVars.find((v) => v.position === pos);
        return existingVar || {
          position: pos,
          description: "",
          sampleValue: "",
          fieldMapping: "custom",
        };
      });
      return newVars;
    });
  }

  function updateVariable(position, field, value) {
    setVariables((prev) =>
      prev.map((v) => (v.position === position ? { ...v, [field]: value } : v))
    );
  }

  function getPreviewText() {
    let preview = bodyText;
    variables.forEach((v) => {
      const replacement = v.sampleValue || `{{${v.position}}}`;
      preview = preview.replace(new RegExp(`\\{\\{${v.position}\\}\\}`, "g"), replacement);
    });
    return preview;
  }

  function validateForm() {
    if (!name || name.trim().length < 3) {
      setError("Template name must be at least 3 characters");
      return false;
    }

    if (!metaTemplateName || metaTemplateName.trim().length < 3) {
      setError("Meta template name must be at least 3 characters");
      return false;
    }

    if (!bodyText || bodyText.trim().length < 10) {
      setError("Body text must be at least 10 characters");
      return false;
    }

    // Validate that all detected variables have descriptions and sample values
    const invalidVars = variables.filter((v) => !v.description || !v.sampleValue);
    if (invalidVars.length > 0) {
      setError(`Please provide description and sample value for all variables`);
      return false;
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
        name: name.trim(),
        metaTemplateName: metaTemplateName.trim(),
        language,
        category,
        bodyText: bodyText.trim(),
        headerText: headerText.trim(),
        footerText: footerText.trim(),
        variables,
      };

      if (isEditMode) {
        // TODO: Replace with actual SDK call
        // await api.whatsapp.updateTemplate(templateId, payload);
        toast.success("Template updated successfully");
      } else {
        // TODO: Replace with actual SDK call
        // await api.whatsapp.createTemplate(payload);
        toast.success("Template created successfully");
      }

      navigate("/whatsapp/templates");
    } catch (err) {
      const errorMessage = isEditMode
        ? "Failed to update template"
        : "Failed to create template";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmitToMeta() {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // TODO: Replace with actual SDK call
      // await api.whatsapp.submitToMeta(templateId);

      toast.success("Template submitted to Meta for review");
      navigate("/whatsapp/templates");
    } catch (err) {
      setError("Failed to submit template to Meta");
      toast.error("Failed to submit template to Meta");
    } finally {
      setLoading(false);
    }
  }

  function handleCancel() {
    navigate("/whatsapp/templates");
  }

  const availableLanguages = [
    { value: "en", label: "English" },
    { value: "es", label: "Spanish" },
    { value: "fr", label: "French" },
    { value: "de", label: "German" },
    { value: "hi", label: "Hindi" },
    { value: "pt", label: "Portuguese" },
    { value: "ar", label: "Arabic" },
    { value: "zh", label: "Chinese" },
  ];

  const fieldMappingOptions = [
    { value: "custom", label: "Custom Value" },
    { value: "user.name", label: "User Name" },
    { value: "user.email", label: "User Email" },
    { value: "user.phone", label: "User Phone" },
    { value: "user.city", label: "User City" },
    { value: "order.id", label: "Order ID" },
    { value: "order.total", label: "Order Total" },
    { value: "order.date", label: "Order Date" },
  ];

  return (
    <section className="space-y-6">
      <Breadcrumb
        title={isEditMode ? "Edit Template" : "Create Template"}
        items={[
          { label: "Home", path: "/" },
          { label: "WhatsApp" },
          { label: "Templates", path: "/whatsapp/templates" },
          { label: isEditMode ? "Edit" : "Create" },
        ]}
      />

      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-sm px-3 py-2">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="industrial-card">
          <CardHeader>
            <CardTitle className="font-display uppercase tracking-tight">
              {isEditMode ? "Edit WhatsApp Template" : "Create WhatsApp Template"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="uppercase tracking-wider text-xs font-bold" htmlFor="name">
                  Template Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="e.g., welcome_message"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  minLength={3}
                  className="bg-background border-input rounded-sm"
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground">
                  Internal name for this template (lowercase, underscores allowed)
                </p>
              </div>

              <div className="space-y-2">
                <Label className="uppercase tracking-wider text-xs font-bold" htmlFor="metaTemplateName">
                  Meta Template Name <span className="text-destructive">*</span>
                  <Info className="w-3 h-3 ml-1 inline text-muted-foreground" />
                </Label>
                <Input
                  id="metaTemplateName"
                  placeholder="e.g., welcome_message_v2"
                  value={metaTemplateName}
                  onChange={(e) => setMetaTemplateName(e.target.value)}
                  required
                  minLength={3}
                  className="bg-background border-input rounded-sm"
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground">
                  Name as registered in Meta Business Manager
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="uppercase tracking-wider text-xs font-bold" htmlFor="language">
                  Language <span className="text-destructive">*</span>
                </Label>
                <Select value={language} onValueChange={setLanguage} disabled={loading}>
                  <SelectTrigger id="language" className="bg-background border-input rounded-sm">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border rounded-sm">
                    {availableLanguages.map((lang) => (
                      <SelectItem key={lang.value} value={lang.value}>
                        {lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="uppercase tracking-wider text-xs font-bold" htmlFor="category">
                  Category <span className="text-destructive">*</span>
                </Label>
                <Select value={category} onValueChange={setCategory} disabled={loading}>
                  <SelectTrigger id="category" className="bg-background border-input rounded-sm">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border rounded-sm">
                    <SelectItem value="MARKETING">Marketing</SelectItem>
                    <SelectItem value="UTILITY">Utility</SelectItem>
                    <SelectItem value="AUTHENTICATION">Authentication</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Message Content */}
            <div className="space-y-2">
              <Label className="uppercase tracking-wider text-xs font-bold" htmlFor="headerText">
                Header Text
              </Label>
              <Input
                id="headerText"
                placeholder="Optional header text"
                value={headerText}
                onChange={(e) => setHeaderText(e.target.value)}
                className="bg-background border-input rounded-sm"
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                Optional: Header shown at the top of the message
              </p>
            </div>

            <div className="space-y-2">
              <Label className="uppercase tracking-wider text-xs font-bold" htmlFor="bodyText">
                Body Text <span className="text-destructive">*</span>
              </Label>
              <textarea
                id="bodyText"
                className="flex min-h-[150px] w-full rounded-sm border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
                placeholder="Hi {{1}}, your meeting is scheduled for {{2}}"
                value={bodyText}
                onChange={(e) => setBodyText(e.target.value)}
                required
                disabled={loading}
                rows={8}
              />
              <p className="text-xs text-muted-foreground">
                Use <code className="bg-muted px-1 rounded">{"{{1}}"}</code>,{" "}
                <code className="bg-muted px-1 rounded">{"{{2}}"}</code>, etc. for variables
              </p>
              {variables.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {variables.length} variable{variables.length !== 1 ? "s" : ""} detected
                </Badge>
              )}
            </div>

            <div className="space-y-2">
              <Label className="uppercase tracking-wider text-xs font-bold" htmlFor="footerText">
                Footer Text
              </Label>
              <Input
                id="footerText"
                placeholder="Optional footer text"
                value={footerText}
                onChange={(e) => setFooterText(e.target.value)}
                className="bg-background border-input rounded-sm"
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                Optional: Footer shown at the bottom of the message
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Variables Configuration */}
        {variables.length > 0 && (
          <Card className="industrial-card">
            <CardHeader>
              <CardTitle className="font-display uppercase tracking-tight">
                Variables Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="uppercase tracking-wider text-xs font-bold">Position</TableHead>
                      <TableHead className="uppercase tracking-wider text-xs font-bold">Description *</TableHead>
                      <TableHead className="uppercase tracking-wider text-xs font-bold">Sample Value *</TableHead>
                      <TableHead className="uppercase tracking-wider text-xs font-bold">Field Mapping</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {variables.map((variable) => (
                      <TableRow key={variable.position}>
                        <TableCell className="font-medium">{"{{" + variable.position + "}}"}</TableCell>
                        <TableCell>
                          <Input
                            placeholder="e.g., User name"
                            value={variable.description}
                            onChange={(e) => updateVariable(variable.position, "description", e.target.value)}
                            required
                            className="bg-background border-input rounded-sm"
                            disabled={loading}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            placeholder="e.g., John"
                            value={variable.sampleValue}
                            onChange={(e) => updateVariable(variable.position, "sampleValue", e.target.value)}
                            required
                            className="bg-background border-input rounded-sm"
                            disabled={loading}
                          />
                        </TableCell>
                        <TableCell>
                          <Select
                            value={variable.fieldMapping}
                            onValueChange={(value) => updateVariable(variable.position, "fieldMapping", value)}
                            disabled={loading}
                          >
                            <SelectTrigger className="bg-background border-input rounded-sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-card border-border rounded-sm">
                              {fieldMappingOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Preview */}
        {bodyText && variables.length > 0 && (
          <Card className="industrial-card">
            <CardHeader>
              <CardTitle className="font-display uppercase tracking-tight flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Preview with Sample Values
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-muted rounded-sm border-l-4 border-primary">
                {headerText && (
                  <p className="font-bold text-sm mb-2 uppercase tracking-wider">{headerText}</p>
                )}
                <p className="text-sm whitespace-pre-wrap">{getPreviewText()}</p>
                {footerText && (
                  <p className="text-xs text-muted-foreground mt-2 italic">{footerText}</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <Card className="industrial-card">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-3">
              <Button
                type="submit"
                className="font-bold uppercase tracking-wider"
                disabled={loading}
              >
                <Save className="w-4 h-4" />
                {loading ? "Saving..." : isEditMode ? "Update Template" : "Save Template"}
              </Button>

              {isEditMode && metaStatus !== "APPROVED" && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleSubmitToMeta}
                  className="font-bold uppercase tracking-wider"
                  disabled={loading}
                >
                  <Send className="w-4 h-4" />
                  Submit to Meta
                </Button>
              )}

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
          </CardContent>
        </Card>
      </form>
    </section>
  );
}
