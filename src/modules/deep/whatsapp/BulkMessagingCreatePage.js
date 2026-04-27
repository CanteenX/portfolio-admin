/**
 * Bulk Messaging Create Page
 *
 * Wizard-style form with 3 steps for creating WhatsApp bulk messaging campaigns:
 * - Step 1: Basic Info (name, campaign, template)
 * - Step 2: Audience (filter and preview)
 * - Step 3: Schedule (send now or later)
 */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toast } from "sonner";
import { useAuth } from "../../../core/auth/AuthContext";
import { Breadcrumb } from "../../../components/common/Breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../../components/ui/dialog";
import { AlertCircle, ChevronRight, ChevronLeft, Eye, Users, Calendar, Send, CheckCircle } from "lucide-react";

export function BulkMessagingCreatePage() {
  const navigate = useNavigate();
  const { api } = useAuth();

  // Wizard state
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Step 1: Basic Info
  const [name, setName] = useState("");
  const [selectedCampaignId, setSelectedCampaignId] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [campaigns, setCampaigns] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [templatePreviewOpen, setTemplatePreviewOpen] = useState(false);
  const [selectedTemplateForPreview, setSelectedTemplateForPreview] = useState(null);

  // Step 2: Audience
  const [userTypes, setUserTypes] = useState([]);
  const [cityIds, setCityIds] = useState([]);
  const [registeredAfter, setRegisteredAfter] = useState(null);
  const [registeredBefore, setRegisteredBefore] = useState(null);
  const [audienceCount, setAudienceCount] = useState(null);
  const [previewingAudience, setPreviewingAudience] = useState(false);

  // Step 3: Schedule
  const [scheduleType, setScheduleType] = useState("now"); // "now" or "scheduled"
  const [scheduledDateTime, setScheduledDateTime] = useState(null);

  // Load campaigns and templates on mount
  useEffect(() => {
    loadCampaignsAndTemplates();
  }, [api]);

  async function loadCampaignsAndTemplates() {
    setLoading(true);
    try {
      // TODO: Replace with actual SDK calls
      // const campaignsData = await api.whatsapp.listCampaigns();
      // const templatesData = await api.whatsapp.listTemplates({ metaStatus: 'APPROVED' });

      // Mock data
      const mockCampaigns = [
        { _id: "camp1", name: "Spring Sale 2024", status: "active" },
        { _id: "camp2", name: "Holiday Special", status: "active" },
        { _id: "camp3", name: "Product Launch", status: "draft" },
      ];

      const mockTemplates = [
        {
          _id: "tmpl1",
          name: "welcome_message",
          category: "MARKETING",
          language: "en",
          metaStatus: "APPROVED",
          body: "Hello {{1}}! Welcome to our service. We're excited to have you!",
        },
        {
          _id: "tmpl2",
          name: "discount_offer",
          category: "MARKETING",
          language: "en",
          metaStatus: "APPROVED",
          body: "Hi {{1}}! Get {{2}}% off on your next purchase. Valid until {{3}}.",
        },
        {
          _id: "tmpl3",
          name: "appointment_reminder",
          category: "UTILITY",
          language: "en",
          metaStatus: "APPROVED",
          body: "Dear {{1}}, this is a reminder for your appointment on {{2}} at {{3}}.",
        },
      ];

      setCampaigns(mockCampaigns);
      setTemplates(mockTemplates);
    } catch (err) {
      setError("Failed to load campaigns and templates");
      toast.error("Failed to load campaigns and templates");
    } finally {
      setLoading(false);
    }
  }

  async function handlePreviewAudience() {
    setPreviewingAudience(true);
    setError(null);

    try {
      const audienceFilter = {
        userTypes: userTypes.length > 0 ? userTypes : undefined,
        cityIds: cityIds.length > 0 ? cityIds : undefined,
        registeredAfter: registeredAfter ? registeredAfter.toISOString() : undefined,
        registeredBefore: registeredBefore ? registeredBefore.toISOString() : undefined,
      };

      // TODO: Replace with actual SDK call
      // const result = await api.whatsapp.previewAudience(audienceFilter);

      // Mock response
      const mockCount = Math.floor(Math.random() * 5000) + 100;
      setAudienceCount(mockCount);
      toast.success(`Audience preview: ${mockCount} recipients`);
    } catch (err) {
      setError("Failed to preview audience");
      toast.error("Failed to preview audience");
    } finally {
      setPreviewingAudience(false);
    }
  }

  function validateStep1() {
    if (!name || name.trim().length < 3) {
      setError("Bulk messaging name must be at least 3 characters");
      return false;
    }
    if (!selectedCampaignId) {
      setError("Please select a campaign");
      return false;
    }
    if (!selectedTemplateId) {
      setError("Please select a template");
      return false;
    }
    setError(null);
    return true;
  }

  function validateStep2() {
    if (userTypes.length === 0 && cityIds.length === 0 && !registeredAfter && !registeredBefore) {
      setError("Please define at least one audience filter");
      return false;
    }
    setError(null);
    return true;
  }

  function validateStep3() {
    if (scheduleType === "scheduled" && !scheduledDateTime) {
      setError("Please select a date and time for scheduled sending");
      return false;
    }
    if (scheduleType === "scheduled" && scheduledDateTime && scheduledDateTime < new Date()) {
      setError("Scheduled date/time must be in the future");
      return false;
    }
    setError(null);
    return true;
  }

  function handleNext() {
    if (currentStep === 1 && !validateStep1()) return;
    if (currentStep === 2 && !validateStep2()) return;

    setCurrentStep((prev) => Math.min(3, prev + 1));
    setError(null);
  }

  function handlePrevious() {
    setCurrentStep((prev) => Math.max(1, prev - 1));
    setError(null);
  }

  function showTemplatePreview(templateId) {
    const template = templates.find((t) => t._id === templateId);
    setSelectedTemplateForPreview(template);
    setTemplatePreviewOpen(true);
  }

  async function handleCreate() {
    if (!validateStep3()) return;

    setLoading(true);
    setError(null);

    try {
      const payload = {
        name: name.trim(),
        templateId: selectedTemplateId,
        audienceFilter: {
          userTypes: userTypes.length > 0 ? userTypes : undefined,
          cityIds: cityIds.length > 0 ? cityIds : undefined,
          registeredAfter: registeredAfter ? registeredAfter.toISOString() : undefined,
          registeredBefore: registeredBefore ? registeredBefore.toISOString() : undefined,
        },
        scheduleType,
        scheduledAt: scheduleType === "scheduled" ? scheduledDateTime.toISOString() : undefined,
      };

      // TODO: Replace with actual SDK call
      // const result = await api.whatsapp.createBulkMessaging(selectedCampaignId, payload);

      // Mock success
      const mockBulkMessagingId = "bm_" + Date.now();
      toast.success("Bulk messaging created successfully");
      navigate(`/whatsapp/bulk-messaging/${mockBulkMessagingId}`);
    } catch (err) {
      setError("Failed to create bulk messaging");
      toast.error("Failed to create bulk messaging");
    } finally {
      setLoading(false);
    }
  }

  function toggleUserType(type) {
    setUserTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  }

  function toggleCity(cityId) {
    setCityIds((prev) =>
      prev.includes(cityId) ? prev.filter((c) => c !== cityId) : [...prev, cityId]
    );
  }

  const availableUserTypes = ["customer", "vendor", "partner", "subscriber"];
  const availableCities = [
    { id: "city1", name: "New York" },
    { id: "city2", name: "Los Angeles" },
    { id: "city3", name: "Chicago" },
    { id: "city4", name: "Houston" },
    { id: "city5", name: "Phoenix" },
  ];

  return (
    <section className="space-y-6">
      <Breadcrumb
        title="Create Bulk Messaging"
        items={[
          { label: "Home", path: "/" },
          { label: "WhatsApp" },
          { label: "Bulk Messaging", path: "/whatsapp/bulk-messaging" },
          { label: "Create" },
        ]}
      />

      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-sm px-3 py-2">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      <Card className="industrial-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="font-display uppercase tracking-tight">
              Step {currentStep} of 3
            </CardTitle>
            <div className="flex gap-2">
              {[1, 2, 3].map((step) => (
                <Badge
                  key={step}
                  variant={step === currentStep ? "default" : step < currentStep ? "secondary" : "outline"}
                  className="text-xs px-3 py-1"
                >
                  {step === currentStep && <CheckCircle className="w-3 h-3 mr-1 inline" />}
                  {step}
                </Badge>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="font-display text-lg font-bold uppercase tracking-tight">Basic Information</h3>

              <div className="space-y-2">
                <Label className="uppercase tracking-wider text-xs font-bold" htmlFor="name">
                  Bulk Messaging Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="Enter bulk messaging name (e.g., Spring Sale Launch)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  minLength={3}
                />
                <p className="text-xs text-muted-foreground">
                  A descriptive name to identify this bulk messaging campaign
                </p>
              </div>

              <div className="space-y-2">
                <Label className="uppercase tracking-wider text-xs font-bold" htmlFor="campaign">
                  Campaign <span className="text-destructive">*</span>
                </Label>
                <Select value={selectedCampaignId} onValueChange={setSelectedCampaignId}>
                  <SelectTrigger id="campaign">
                    <SelectValue placeholder="Select a campaign" />
                  </SelectTrigger>
                  <SelectContent>
                    {campaigns.map((campaign) => (
                      <SelectItem key={campaign._id} value={campaign._id}>
                        {campaign.name}
                        {campaign.status !== "active" && (
                          <Badge variant="outline" className="ml-2 text-xs">
                            {campaign.status}
                          </Badge>
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Select the campaign this bulk messaging belongs to
                </p>
              </div>

              <div className="space-y-2">
                <Label className="uppercase tracking-wider text-xs font-bold" htmlFor="template">
                  WhatsApp Template <span className="text-destructive">*</span>
                </Label>
                <div className="flex gap-2">
                  <Select
                    value={selectedTemplateId}
                    onValueChange={setSelectedTemplateId}
                    className="flex-1"
                  >
                    <SelectTrigger id="template">
                      <SelectValue placeholder="Select an approved template" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map((template) => (
                        <SelectItem key={template._id} value={template._id}>
                          {template.name} ({template.category})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedTemplateId && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => showTemplatePreview(selectedTemplateId)}
                      className="font-bold uppercase tracking-wider"
                    >
                      <Eye className="w-4 h-4" /> Preview
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Only approved templates can be used for bulk messaging
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Audience */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg font-bold uppercase tracking-tight">Audience Filters</h3>
                {audienceCount !== null && (
                  <Badge variant="secondary" className="text-sm px-3 py-1">
                    <Users className="w-4 h-4 mr-1 inline" />
                    {audienceCount.toLocaleString()} recipients
                  </Badge>
                )}
              </div>

              <div className="space-y-2">
                <Label className="uppercase tracking-wider text-xs font-bold">User Types</Label>
                <div className="flex flex-wrap gap-2">
                  {availableUserTypes.map((type) => (
                    <Button
                      key={type}
                      type="button"
                      variant={userTypes.includes(type) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleUserType(type)}
                      className="font-bold uppercase tracking-wider"
                    >
                      {userTypes.includes(type) && <CheckCircle className="w-3 h-3 mr-1" />}
                      {type}
                    </Button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Select one or more user types to target
                </p>
              </div>

              <div className="space-y-2">
                <Label className="uppercase tracking-wider text-xs font-bold">Cities</Label>
                <div className="flex flex-wrap gap-2">
                  {availableCities.map((city) => (
                    <Button
                      key={city.id}
                      type="button"
                      variant={cityIds.includes(city.id) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleCity(city.id)}
                      className="font-bold uppercase tracking-wider"
                    >
                      {cityIds.includes(city.id) && <CheckCircle className="w-3 h-3 mr-1" />}
                      {city.name}
                    </Button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Filter users by city location
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="uppercase tracking-wider text-xs font-bold" htmlFor="registeredAfter">
                    Registered After
                  </Label>
                  <DatePicker
                    id="registeredAfter"
                    selected={registeredAfter}
                    onChange={setRegisteredAfter}
                    dateFormat="yyyy-MM-dd"
                    className="flex h-9 w-full rounded-sm border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    placeholderText="Select start date"
                    isClearable
                  />
                  <p className="text-xs text-muted-foreground">
                    Include users registered on or after this date
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="uppercase tracking-wider text-xs font-bold" htmlFor="registeredBefore">
                    Registered Before
                  </Label>
                  <DatePicker
                    id="registeredBefore"
                    selected={registeredBefore}
                    onChange={setRegisteredBefore}
                    dateFormat="yyyy-MM-dd"
                    className="flex h-9 w-full rounded-sm border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    placeholderText="Select end date"
                    isClearable
                  />
                  <p className="text-xs text-muted-foreground">
                    Include users registered before this date
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handlePreviewAudience}
                  disabled={previewingAudience}
                  className="font-bold uppercase tracking-wider"
                >
                  <Users className="w-4 h-4" />
                  {previewingAudience ? "Loading..." : "Preview Audience"}
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Schedule */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <h3 className="font-display text-lg font-bold uppercase tracking-tight">Scheduling</h3>

              <div className="space-y-3">
                <Label className="uppercase tracking-wider text-xs font-bold">When to Send?</Label>

                <div className="space-y-2">
                  <label className="flex items-start gap-3 p-3 border rounded-sm cursor-pointer hover:bg-muted/50 transition-colors">
                    <input
                      type="radio"
                      name="scheduleType"
                      value="now"
                      checked={scheduleType === "now"}
                      onChange={(e) => setScheduleType(e.target.value)}
                      className="mt-0.5"
                    />
                    <div className="flex-1">
                      <div className="font-bold flex items-center gap-2">
                        <Send className="w-4 h-4" />
                        Send Now
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Start sending messages immediately after creation
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3 border rounded-sm cursor-pointer hover:bg-muted/50 transition-colors">
                    <input
                      type="radio"
                      name="scheduleType"
                      value="scheduled"
                      checked={scheduleType === "scheduled"}
                      onChange={(e) => setScheduleType(e.target.value)}
                      className="mt-0.5"
                    />
                    <div className="flex-1">
                      <div className="font-bold flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Schedule for Later
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Choose a specific date and time to start sending
                      </p>
                    </div>
                  </label>
                </div>

                {scheduleType === "scheduled" && (
                  <div className="ml-6 mt-4 space-y-2">
                    <Label className="uppercase tracking-wider text-xs font-bold" htmlFor="scheduledDateTime">
                      Scheduled Date & Time <span className="text-destructive">*</span>
                    </Label>
                    <DatePicker
                      id="scheduledDateTime"
                      selected={scheduledDateTime}
                      onChange={setScheduledDateTime}
                      showTimeSelect
                      timeFormat="HH:mm"
                      timeIntervals={15}
                      dateFormat="yyyy-MM-dd HH:mm"
                      className="flex h-9 w-full rounded-sm border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      placeholderText="Select date and time"
                      minDate={new Date()}
                    />
                    <p className="text-xs text-muted-foreground">
                      Messages will start sending at the specified time
                    </p>
                  </div>
                )}
              </div>

              {/* Summary */}
              <div className="pt-4 border-t space-y-3">
                <h4 className="font-bold uppercase tracking-wider text-xs">Summary</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Name:</span>
                    <p className="font-medium">{name}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Campaign:</span>
                    <p className="font-medium">
                      {campaigns.find((c) => c._id === selectedCampaignId)?.name || "-"}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Template:</span>
                    <p className="font-medium">
                      {templates.find((t) => t._id === selectedTemplateId)?.name || "-"}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Recipients:</span>
                    <p className="font-medium">
                      {audienceCount !== null ? audienceCount.toLocaleString() : "Not previewed"}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Schedule:</span>
                    <p className="font-medium">
                      {scheduleType === "now"
                        ? "Send immediately"
                        : scheduledDateTime
                        ? new Intl.DateTimeFormat("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }).format(scheduledDateTime)
                        : "Not set"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1 || loading}
              className="font-bold uppercase tracking-wider"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </Button>

            {currentStep < 3 ? (
              <Button
                type="button"
                onClick={handleNext}
                className="font-bold uppercase tracking-wider"
              >
                Next <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleCreate}
                disabled={loading}
                className="font-bold uppercase tracking-wider"
              >
                <Send className="w-4 h-4" />
                {loading ? "Creating..." : "Create Bulk Messaging"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Template Preview Modal */}
      <Dialog open={templatePreviewOpen} onOpenChange={setTemplatePreviewOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display uppercase tracking-tight">Template Preview</DialogTitle>
          </DialogHeader>
          {selectedTemplateForPreview && (
            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                  Template Name
                </p>
                <p className="font-medium">{selectedTemplateForPreview.name}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                  Category
                </p>
                <Badge variant="secondary" className="text-xs">
                  {selectedTemplateForPreview.category}
                </Badge>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                  Language
                </p>
                <p className="font-medium">{selectedTemplateForPreview.language}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                  Status
                </p>
                <Badge variant="default" className="text-xs bg-green-600">
                  {selectedTemplateForPreview.metaStatus}
                </Badge>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                  Message Body
                </p>
                <div className="p-3 bg-muted rounded-sm">
                  <p className="text-sm whitespace-pre-wrap">{selectedTemplateForPreview.body}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button type="button" onClick={() => setTemplatePreviewOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
