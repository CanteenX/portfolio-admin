/**
 * Audience Type Form Page (Create/Edit)
 *
 * Form for creating or editing audience segments with advanced filtering options.
 * Allows configuration of:
 * - User types, geographic filters, date ranges
 * - Custom fields (industry, company size)
 * - Verified/Premium filters
 * - Custom query (advanced JSON editor)
 * - Preview audience count before saving
 */

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
import { Switch } from "../../../components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../../components/ui/dialog";
import { AlertCircle, Save, X, Eye, ChevronDown, ChevronUp } from "lucide-react";

export function AudienceTypeFormPage() {
  const { audienceTypeId } = useParams();
  const navigate = useNavigate();
  const { api } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form fields
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  // Filter Criteria - User Types
  const [selectedUserTypes, setSelectedUserTypes] = useState({
    personal: false,
    business: false,
    company: false,
  });

  // Filter Criteria - Geographic
  const [selectedCities, setSelectedCities] = useState([]);
  const [selectedStates, setSelectedStates] = useState([]);

  // Filter Criteria - Date Ranges
  const [registeredAfter, setRegisteredAfter] = useState(null);
  const [registeredBefore, setRegisteredBefore] = useState(null);

  // Filter Criteria - Custom Fields
  const [selectedIndustries, setSelectedIndustries] = useState([]);
  const [selectedCompanySizes, setSelectedCompanySizes] = useState([]);

  // Filter Criteria - Flags
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [premiumOnly, setPremiumOnly] = useState(false);

  // Custom Query (Advanced)
  const [customQuery, setCustomQuery] = useState("");
  const [showCustomQuery, setShowCustomQuery] = useState(false);

  // Collapsible sections
  const [expandedSections, setExpandedSections] = useState({
    userTypes: true,
    geographic: true,
    dateRanges: false,
    customFields: false,
    flags: false,
    customQuery: false,
  });

  // Preview dialog
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [previewCount, setPreviewCount] = useState(null);
  const [previewing, setPreviewing] = useState(false);

  // Mock data
  const cities = ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata", "Pune", "Ahmedabad"];
  const states = ["Maharashtra", "Delhi", "Karnataka", "Telangana", "Tamil Nadu", "West Bengal", "Gujarat"];
  const industries = ["Technology", "IT Services", "Healthcare", "Finance", "Manufacturing", "Retail", "Education"];
  const companySizes = ["1-10", "11-50", "51-200", "201-500", "501-1000", "1000+"];

  const isEditMode = Boolean(audienceTypeId);

  useEffect(() => {
    if (isEditMode) {
      loadAudienceType();
    }
  }, [audienceTypeId]);

  async function loadAudienceType() {
    setLoading(true);
    try {
      // TODO: Replace with actual SDK call
      // const audienceType = await api.whatsapp.getAudienceType(audienceTypeId);

      // Mock data
      const mockAudienceType = {
        _id: audienceTypeId,
        name: "Premium Business Users",
        description: "Business users with premium subscription",
        filterCriteria: {
          userTypes: ["business"],
          cities: ["Mumbai", "Delhi"],
          states: ["Maharashtra"],
          verifiedOnly: true,
          premiumOnly: true,
          industries: ["Technology", "Finance"],
        },
        customQuery: "",
      };

      setName(mockAudienceType.name);
      setDescription(mockAudienceType.description || "");

      // Set user types
      if (mockAudienceType.filterCriteria.userTypes) {
        const userTypes = { personal: false, business: false, company: false };
        mockAudienceType.filterCriteria.userTypes.forEach((type) => {
          userTypes[type] = true;
        });
        setSelectedUserTypes(userTypes);
      }

      // Set geographic filters
      setSelectedCities(mockAudienceType.filterCriteria.cities || []);
      setSelectedStates(mockAudienceType.filterCriteria.states || []);

      // Set date ranges
      if (mockAudienceType.filterCriteria.registeredAfter) {
        setRegisteredAfter(new Date(mockAudienceType.filterCriteria.registeredAfter));
      }
      if (mockAudienceType.filterCriteria.registeredBefore) {
        setRegisteredBefore(new Date(mockAudienceType.filterCriteria.registeredBefore));
      }

      // Set custom fields
      setSelectedIndustries(mockAudienceType.filterCriteria.industries || []);
      setSelectedCompanySizes(mockAudienceType.filterCriteria.companySizes || []);

      // Set flags
      setVerifiedOnly(mockAudienceType.filterCriteria.verifiedOnly || false);
      setPremiumOnly(mockAudienceType.filterCriteria.premiumOnly || false);

      // Set custom query
      setCustomQuery(mockAudienceType.customQuery || "");
    } catch (err) {
      setError("Failed to load audience type");
      toast.error("Failed to load audience type");
    } finally {
      setLoading(false);
    }
  }

  function toggleSection(section) {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  }

  function toggleUserType(type) {
    setSelectedUserTypes((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  }

  function toggleCity(city) {
    setSelectedCities((prev) =>
      prev.includes(city) ? prev.filter((c) => c !== city) : [...prev, city]
    );
  }

  function toggleState(state) {
    setSelectedStates((prev) =>
      prev.includes(state) ? prev.filter((s) => s !== state) : [...prev, state]
    );
  }

  function toggleIndustry(industry) {
    setSelectedIndustries((prev) =>
      prev.includes(industry) ? prev.filter((i) => i !== industry) : [...prev, industry]
    );
  }

  function toggleCompanySize(size) {
    setSelectedCompanySizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  }

  function buildFilterCriteria() {
    const criteria = {};

    // User types
    const userTypes = Object.keys(selectedUserTypes).filter((type) => selectedUserTypes[type]);
    if (userTypes.length > 0) criteria.userTypes = userTypes;

    // Geographic
    if (selectedCities.length > 0) criteria.cities = selectedCities;
    if (selectedStates.length > 0) criteria.states = selectedStates;

    // Date ranges
    if (registeredAfter) criteria.registeredAfter = registeredAfter.toISOString();
    if (registeredBefore) criteria.registeredBefore = registeredBefore.toISOString();

    // Custom fields
    if (selectedIndustries.length > 0) criteria.industries = selectedIndustries;
    if (selectedCompanySizes.length > 0) criteria.companySizes = selectedCompanySizes;

    // Flags
    if (verifiedOnly) criteria.verifiedOnly = true;
    if (premiumOnly) criteria.premiumOnly = true;

    return criteria;
  }

  async function handlePreviewAudience() {
    setPreviewing(true);
    setError(null);

    try {
      const filterCriteria = buildFilterCriteria();

      // TODO: Replace with actual SDK call
      // const result = await api.whatsapp.previewAudience(filterCriteria);

      // Mock response
      const mockCount = Math.floor(Math.random() * 10000) + 100;
      setPreviewCount(mockCount);
      setPreviewDialogOpen(true);
    } catch (err) {
      setError("Failed to preview audience");
      toast.error("Failed to preview audience");
    } finally {
      setPreviewing(false);
    }
  }

  function validateForm() {
    if (!name || name.trim().length < 3) {
      setError("Segment name must be at least 3 characters");
      return false;
    }

    const filterCriteria = buildFilterCriteria();
    if (Object.keys(filterCriteria).length === 0 && !customQuery.trim()) {
      setError("Please define at least one filter criteria or custom query");
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
        description: description.trim(),
        filterCriteria: buildFilterCriteria(),
        customQuery: customQuery.trim(),
      };

      if (isEditMode) {
        // TODO: Replace with actual SDK call
        // await api.whatsapp.updateAudienceType(audienceTypeId, payload);
        toast.success("Audience segment updated successfully");
      } else {
        // TODO: Replace with actual SDK call
        // await api.whatsapp.createAudienceType(payload);
        toast.success("Audience segment created successfully");
      }

      navigate("/whatsapp/audience-types");
    } catch (err) {
      const errorMessage = isEditMode
        ? "Failed to update audience segment"
        : "Failed to create audience segment";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  function handleCancel() {
    navigate("/whatsapp/audience-types");
  }

  function renderCollapsibleSection(sectionKey, title, content) {
    const isExpanded = expandedSections[sectionKey];
    return (
      <div className="border rounded-sm">
        <button
          type="button"
          onClick={() => toggleSection(sectionKey)}
          className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
        >
          <h3 className="font-display uppercase tracking-tight text-sm font-bold">{title}</h3>
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        {isExpanded && <div className="p-4 pt-0 border-t">{content}</div>}
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <Breadcrumb
        title={isEditMode ? "Edit Audience Segment" : "Create Audience Segment"}
        items={[
          { label: "Home", path: "/" },
          { label: "WhatsApp" },
          { label: "Audience Segments", path: "/whatsapp/audience-types" },
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
            <div className="space-y-2">
              <Label className="uppercase tracking-wider text-xs font-bold" htmlFor="name">
                Segment Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="e.g., Premium Business Users"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="bg-background border-input rounded-sm"
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                Provide a descriptive name for this audience segment
              </p>
            </div>

            <div className="space-y-2">
              <Label className="uppercase tracking-wider text-xs font-bold" htmlFor="description">
                Description
              </Label>
              <textarea
                id="description"
                className="flex min-h-[100px] w-full rounded-sm border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
                placeholder="Describe this audience segment and its purpose"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={loading}
              />
            </div>
          </CardContent>
        </Card>

        {/* Filter Criteria */}
        <Card className="industrial-card">
          <CardHeader>
            <CardTitle className="font-display uppercase tracking-tight">
              Filter Criteria
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* User Types */}
            {renderCollapsibleSection(
              "userTypes",
              "User Types",
              <div className="space-y-3">
                {Object.keys(selectedUserTypes).map((type) => (
                  <div key={type} className="flex items-center justify-between">
                    <Label htmlFor={`userType-${type}`} className="capitalize cursor-pointer">
                      {type}
                    </Label>
                    <input
                      type="checkbox"
                      id={`userType-${type}`}
                      checked={selectedUserTypes[type]}
                      onChange={() => toggleUserType(type)}
                      className="w-4 h-4 rounded border-input cursor-pointer"
                      disabled={loading}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Geographic */}
            {renderCollapsibleSection(
              "geographic",
              "Geographic Filters",
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="uppercase tracking-wider text-xs font-bold">Cities</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {cities.map((city) => (
                      <div key={city} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`city-${city}`}
                          checked={selectedCities.includes(city)}
                          onChange={() => toggleCity(city)}
                          className="w-4 h-4 rounded border-input cursor-pointer"
                          disabled={loading}
                        />
                        <Label htmlFor={`city-${city}`} className="cursor-pointer text-sm">
                          {city}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="uppercase tracking-wider text-xs font-bold">States</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {states.map((state) => (
                      <div key={state} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`state-${state}`}
                          checked={selectedStates.includes(state)}
                          onChange={() => toggleState(state)}
                          className="w-4 h-4 rounded border-input cursor-pointer"
                          disabled={loading}
                        />
                        <Label htmlFor={`state-${state}`} className="cursor-pointer text-sm">
                          {state}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Date Ranges */}
            {renderCollapsibleSection(
              "dateRanges",
              "Date Ranges",
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="uppercase tracking-wider text-xs font-bold">
                    Registered After
                  </Label>
                  <DatePicker
                    selected={registeredAfter}
                    onChange={(date) => setRegisteredAfter(date)}
                    placeholderText="Select date"
                    className="flex h-9 w-full rounded-sm border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    dateFormat="yyyy-MM-dd"
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="uppercase tracking-wider text-xs font-bold">
                    Registered Before
                  </Label>
                  <DatePicker
                    selected={registeredBefore}
                    onChange={(date) => setRegisteredBefore(date)}
                    placeholderText="Select date"
                    className="flex h-9 w-full rounded-sm border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    dateFormat="yyyy-MM-dd"
                    disabled={loading}
                  />
                </div>
              </div>
            )}

            {/* Custom Fields */}
            {renderCollapsibleSection(
              "customFields",
              "Custom Fields",
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="uppercase tracking-wider text-xs font-bold">
                    Industry (Business/Company)
                  </Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {industries.map((industry) => (
                      <div key={industry} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`industry-${industry}`}
                          checked={selectedIndustries.includes(industry)}
                          onChange={() => toggleIndustry(industry)}
                          className="w-4 h-4 rounded border-input cursor-pointer"
                          disabled={loading}
                        />
                        <Label htmlFor={`industry-${industry}`} className="cursor-pointer text-sm">
                          {industry}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="uppercase tracking-wider text-xs font-bold">
                    Company Size (Company)
                  </Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {companySizes.map((size) => (
                      <div key={size} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`size-${size}`}
                          checked={selectedCompanySizes.includes(size)}
                          onChange={() => toggleCompanySize(size)}
                          className="w-4 h-4 rounded border-input cursor-pointer"
                          disabled={loading}
                        />
                        <Label htmlFor={`size-${size}`} className="cursor-pointer text-sm">
                          {size}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Flags */}
            {renderCollapsibleSection(
              "flags",
              "Additional Filters",
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="verifiedOnly" className="font-bold uppercase tracking-wider text-sm">
                    Verified Users Only
                  </Label>
                  <Switch
                    id="verifiedOnly"
                    checked={verifiedOnly}
                    onCheckedChange={setVerifiedOnly}
                    disabled={loading}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="premiumOnly" className="font-bold uppercase tracking-wider text-sm">
                    Premium Users Only
                  </Label>
                  <Switch
                    id="premiumOnly"
                    checked={premiumOnly}
                    onCheckedChange={setPremiumOnly}
                    disabled={loading}
                  />
                </div>
              </div>
            )}

            {/* Custom Query */}
            {renderCollapsibleSection(
              "customQuery",
              "Custom Query (Advanced)",
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground mb-2">
                  Advanced users can define a custom MongoDB query in JSON format. This will override
                  other filter criteria.
                </p>
                <textarea
                  className="flex min-h-[150px] w-full rounded-sm border border-input bg-transparent px-3 py-2 text-sm font-mono shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
                  placeholder='{"userType": "business", "verified": true}'
                  value={customQuery}
                  onChange={(e) => setCustomQuery(e.target.value)}
                  disabled={loading}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handlePreviewAudience}
            className="font-bold uppercase tracking-wider"
            disabled={loading || previewing}
          >
            <Eye className="w-4 h-4" />
            {previewing ? "Previewing..." : "Preview Audience"}
          </Button>
          <Button
            type="submit"
            className="font-bold uppercase tracking-wider"
            disabled={loading}
          >
            <Save className="w-4 h-4" />
            {loading ? "Saving..." : "Save Segment"}
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

      {/* Preview Dialog */}
      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display uppercase tracking-tight">
              Audience Preview
            </DialogTitle>
          </DialogHeader>
          <div className="py-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">Estimated Recipients</p>
              <p className="text-4xl font-bold text-primary">{previewCount?.toLocaleString()}</p>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => setPreviewDialogOpen(false)}
              className="font-bold uppercase tracking-wider"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
