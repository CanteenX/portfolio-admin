/**
 * Campaign Create/Edit Page
 *
 * Form for creating or editing WhatsApp campaigns.
 * Validates required fields and navigates back to campaigns list on success.
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { AlertCircle, Save, X } from "lucide-react";

export function CampaignCreatePage() {
  const { campaignId } = useParams();
  const navigate = useNavigate();
  const { api } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "draft",
  });

  const isEditMode = Boolean(campaignId);

  useEffect(() => {
    if (isEditMode) {
      loadCampaign();
    }
  }, [campaignId]);

  async function loadCampaign() {
    setLoading(true);
    try {
      // TODO: Replace with actual SDK call
      // const campaign = await api.whatsapp.getCampaign(campaignId);

      // Mock data for now
      const mockCampaign = {
        _id: campaignId,
        name: "Spring Sale 2024",
        description: "Promotional campaign for spring season products",
        status: "active",
      };

      setFormData({
        name: mockCampaign.name,
        description: mockCampaign.description || "",
        status: mockCampaign.status,
      });
    } catch (err) {
      setError("Failed to load campaign");
      toast.error("Failed to load campaign");
    } finally {
      setLoading(false);
    }
  }

  function validateForm() {
    if (!formData.name || formData.name.trim().length < 3) {
      setError("Campaign name must be at least 3 characters");
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
        name: formData.name.trim(),
        description: formData.description.trim(),
        status: formData.status,
      };

      if (isEditMode) {
        // TODO: Replace with actual SDK call
        // await api.whatsapp.updateCampaign(campaignId, payload);
        toast.success("Campaign updated successfully");
      } else {
        // TODO: Replace with actual SDK call
        // await api.whatsapp.createCampaign(payload);
        toast.success("Campaign created successfully");
      }

      navigate("/whatsapp/campaigns");
    } catch (err) {
      const errorMessage = isEditMode
        ? "Failed to update campaign"
        : "Failed to create campaign";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  function handleCancel() {
    navigate("/whatsapp/campaigns");
  }

  function handleInputChange(field, value) {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error when user starts typing
    if (error) {
      setError(null);
    }
  }

  return (
    <section className="space-y-6">
      <Breadcrumb
        title={isEditMode ? "Edit Campaign" : "Create Campaign"}
        items={[
          { label: "Home", path: "/" },
          { label: "WhatsApp" },
          { label: "Campaigns", path: "/whatsapp/campaigns" },
          { label: isEditMode ? "Edit" : "Create" },
        ]}
      />

      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-sm px-3 py-2">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      <Card className="industrial-card max-w-2xl">
        <CardHeader>
          <CardTitle className="font-display uppercase tracking-tight">
            {isEditMode ? "Edit Campaign" : "Create New Campaign"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label className="uppercase tracking-wider text-xs font-bold" htmlFor="name">
                Campaign Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="Enter campaign name (min 3 characters)"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
                minLength={3}
                className="bg-background border-input rounded-sm"
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                Provide a descriptive name for your campaign (e.g., "Spring Sale 2024")
              </p>
            </div>

            <div className="space-y-2">
              <Label className="uppercase tracking-wider text-xs font-bold" htmlFor="description">
                Description
              </Label>
              <textarea
                id="description"
                className="flex min-h-[120px] w-full rounded-sm border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
                placeholder="Enter campaign description (optional)"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                Optional: Add details about the campaign's purpose and goals
              </p>
            </div>

            <div className="space-y-2">
              <Label className="uppercase tracking-wider text-xs font-bold" htmlFor="status">
                Status <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleInputChange("status", value)}
                disabled={loading}
              >
                <SelectTrigger id="status" className="bg-background border-input rounded-sm">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border rounded-sm">
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Draft: Campaign is being prepared | Active: Campaign is running | Completed: Campaign has ended
              </p>
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <Button
                type="submit"
                className="font-bold uppercase tracking-wider"
                disabled={loading}
              >
                <Save className="w-4 h-4" />
                {loading ? "Saving..." : isEditMode ? "Update Campaign" : "Save Campaign"}
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
        </CardContent>
      </Card>
    </section>
  );
}
