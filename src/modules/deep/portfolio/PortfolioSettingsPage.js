import { RbacGate } from "../../../components/common/RequirePermission";
import React, { useEffect, useState } from "react";
import { useAuth } from "../../../core/auth/AuthContext";
import { getPortfolioSettings, updatePortfolioSettings } from "../../../shared/sdk";

const TABS = ["Hero", "Navbar", "Footer", "About", "Services", "Process", "Team Playbook", "Contact Info"];

const EMPTY = {
  hero: { tagline: "", description: "", ctaPrimary: { label: "View Work", href: "/work" }, ctaSecondary: { label: "Contact Us", href: "/contact" }, featuredProjects: [] },
  navbar: { brandName: "FORGE_COLLECTIVE", links: [] },
  footer: { description: "", email: "", version: "v1.0", links: [] },
  techMarquee: [],
  services: [],
  callSlots: [],
  about: { vision: "", mission: "", values: [], stats: [] },
  process: { phases: [], perks: [] },
  teamPlaybook: [],
  contactInfo: { email: "", phone: "" },
  isActive: true
};

export function PortfolioSettingsPage() {
  const { api } = useAuth();
  const [form, setForm] = useState(EMPTY);
  const [tab, setTab] = useState("Hero");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await getPortfolioSettings(api);
        if (data && Object.keys(data).length > 0) {
          setForm(prev => ({ ...EMPTY, ...data }));
        }
      } catch (e) {
        setError("Failed to load settings");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      await updatePortfolioSettings(api, form);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e) {
      setError(e?.response?.data?.message ?? "Save failed");
    } finally {
      setSaving(false);
    }
  }

  function setNested(section, key, value) {
    setForm(prev => ({ ...prev, [section]: { ...prev[section], [key]: value } }));
  }

  function setNestedDeep(section, subKey, key, value) {
    setForm(prev => ({
      ...prev,
      [section]: { ...prev[section], [subKey]: { ...prev[section][subKey], [key]: value } }
    }));
  }

  function addToArray(path, template) {
    const keys = path.split(".");
    setForm(prev => {
      const updated = { ...prev };
      if (keys.length === 1) updated[keys[0]] = [...(updated[keys[0]] ?? []), template];
      else updated[keys[0]] = { ...updated[keys[0]], [keys[1]]: [...(updated[keys[0]][keys[1]] ?? []), template] };
      return updated;
    });
  }

  function removeFromArray(path, idx) {
    const keys = path.split(".");
    setForm(prev => {
      const updated = { ...prev };
      if (keys.length === 1) updated[keys[0]] = updated[keys[0]].filter((_, i) => i !== idx);
      else updated[keys[0]] = { ...updated[keys[0]], [keys[1]]: updated[keys[0]][keys[1]].filter((_, i) => i !== idx) };
      return updated;
    });
  }

  function updateInArray(path, idx, key, value) {
    const keys = path.split(".");
    setForm(prev => {
      const updated = { ...prev };
      if (keys.length === 1) {
        updated[keys[0]] = updated[keys[0]].map((item, i) => i === idx ? { ...item, [key]: value } : item);
      } else {
        updated[keys[0]] = {
          ...updated[keys[0]],
          [keys[1]]: updated[keys[0]][keys[1]].map((item, i) => i === idx ? { ...item, [key]: value } : item)
        };
      }
      return updated;
    });
  }

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading settings...</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">Portfolio CMS</div>
        <h1 className="text-2xl font-bold">Site Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage all global website content from here.</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 mb-6 p-1 bg-muted/30 rounded-xl border border-border">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${tab === t ? "bg-background border border-border shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
            {t}
          </button>
        ))}
      </div>

      {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">{error}</div>}
      {success && <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm">Settings saved successfully!</div>}

      <form onSubmit={handleSave} className="space-y-6">
        {/* ── HERO ──────────────────────────────────────────────────────── */}
        {tab === "Hero" && (
          <Section title="Hero Section">
            <F label="Tagline" value={form.hero.tagline} onChange={v => setNested("hero", "tagline", v)} placeholder="We build software that ships." />
            <TA label="Description" value={form.hero.description} onChange={v => setNested("hero", "description", v)} rows={3} />
            <div className="grid grid-cols-2 gap-4">
              <F label="CTA Primary — Label" value={form.hero.ctaPrimary.label} onChange={v => setNestedDeep("hero", "ctaPrimary", "label", v)} />
              <F label="CTA Primary — Href" value={form.hero.ctaPrimary.href} onChange={v => setNestedDeep("hero", "ctaPrimary", "href", v)} />
              <F label="CTA Secondary — Label" value={form.hero.ctaSecondary.label} onChange={v => setNestedDeep("hero", "ctaSecondary", "label", v)} />
              <F label="CTA Secondary — Href" value={form.hero.ctaSecondary.href} onChange={v => setNestedDeep("hero", "ctaSecondary", "href", v)} />
            </div>
            <div>
              <label className={lbl}>Tech Marquee (one per line)</label>
              <textarea className={`${inp} resize-none`} rows={4} value={(form.techMarquee ?? []).join("\n")} onChange={e => setForm(prev => ({ ...prev, techMarquee: e.target.value.split("\n").map(s => s.trim()).filter(Boolean) }))} placeholder="AWS&#10;REACT_NATIVE&#10;NODE.JS" />
            </div>
            <ArrSection label="Featured Projects" items={form.hero.featuredProjects}
              onAdd={() => addToArray("hero.featuredProjects", { title: "", description: "", href: "", image: "", eyebrow: "" })}
              onRemove={i => removeFromArray("hero.featuredProjects", i)}
              renderItem={(item, i) => (
                <div className="grid grid-cols-2 gap-2">
                  <input className={inp} placeholder="Title" value={item.title} onChange={e => updateInArray("hero.featuredProjects", i, "title", e.target.value)} />
                  <input className={inp} placeholder="Eyebrow (Deployment 01 // Mobile)" value={item.eyebrow} onChange={e => updateInArray("hero.featuredProjects", i, "eyebrow", e.target.value)} />
                  <input className={inp} placeholder="Description" value={item.description} onChange={e => updateInArray("hero.featuredProjects", i, "description", e.target.value)} />
                  <input className={inp} placeholder="Href (/projects/slug)" value={item.href} onChange={e => updateInArray("hero.featuredProjects", i, "href", e.target.value)} />
                  <input className={`${inp} col-span-2`} placeholder="Image URL" value={item.image} onChange={e => updateInArray("hero.featuredProjects", i, "image", e.target.value)} />
                </div>
              )} />
          </Section>
        )}

        {/* ── NAVBAR ───────────────────────────────────────────────────── */}
        {tab === "Navbar" && (
          <Section title="Navbar">
            <F label="Brand Name" value={form.navbar.brandName} onChange={v => setNested("navbar", "brandName", v)} placeholder="FORGE_COLLECTIVE" />
            <ArrSection label="Nav Links" items={form.navbar.links}
              onAdd={() => addToArray("navbar.links", { label: "", href: "" })}
              onRemove={i => removeFromArray("navbar.links", i)}
              renderItem={(item, i) => (
                <div className="grid grid-cols-2 gap-2">
                  <input className={inp} placeholder="Label (Work)" value={item.label} onChange={e => updateInArray("navbar.links", i, "label", e.target.value)} />
                  <input className={inp} placeholder="Href (/work)" value={item.href} onChange={e => updateInArray("navbar.links", i, "href", e.target.value)} />
                </div>
              )} />
          </Section>
        )}

        {/* ── FOOTER ───────────────────────────────────────────────────── */}
        {tab === "Footer" && (
          <Section title="Footer">
            <F label="Company Description" value={form.footer.description} onChange={v => setNested("footer", "description", v)} />
            <div className="grid grid-cols-2 gap-4">
              <F label="Email" value={form.footer.email} onChange={v => setNested("footer", "email", v)} placeholder="hello@forge.dev" />
              <F label="Version String" value={form.footer.version} onChange={v => setNested("footer", "version", v)} placeholder="v4.2 — STABLE_BUILD" />
            </div>
            <ArrSection label="Footer Links" items={form.footer.links}
              onAdd={() => addToArray("footer.links", { label: "", href: "" })}
              onRemove={i => removeFromArray("footer.links", i)}
              renderItem={(item, i) => (
                <div className="grid grid-cols-2 gap-2">
                  <input className={inp} placeholder="Label" value={item.label} onChange={e => updateInArray("footer.links", i, "label", e.target.value)} />
                  <input className={inp} placeholder="Href" value={item.href} onChange={e => updateInArray("footer.links", i, "href", e.target.value)} />
                </div>
              )} />
          </Section>
        )}

        {/* ── ABOUT ────────────────────────────────────────────────────── */}
        {tab === "About" && (
          <Section title="About Page">
            <TA label="Vision Statement" value={form.about.vision} onChange={v => setNested("about", "vision", v)} rows={3} />
            <TA label="Mission Statement" value={form.about.mission} onChange={v => setNested("about", "mission", v)} rows={3} />
            <ArrSection label="Core Values" items={form.about.values}
              onAdd={() => addToArray("about.values", { icon: "Zap", title: "", desc: "" })}
              onRemove={i => removeFromArray("about.values", i)}
              renderItem={(item, i) => (
                <div className="grid grid-cols-3 gap-2">
                  <input className={inp} placeholder="Lucide icon name (Zap)" value={item.icon} onChange={e => updateInArray("about.values", i, "icon", e.target.value)} />
                  <input className={inp} placeholder="Title" value={item.title} onChange={e => updateInArray("about.values", i, "title", e.target.value)} />
                  <input className={inp} placeholder="Description" value={item.desc} onChange={e => updateInArray("about.values", i, "desc", e.target.value)} />
                </div>
              )} />
            <ArrSection label="Stats" items={form.about.stats}
              onAdd={() => addToArray("about.stats", { label: "", value: "" })}
              onRemove={i => removeFromArray("about.stats", i)}
              renderItem={(item, i) => (
                <div className="grid grid-cols-2 gap-2">
                  <input className={inp} placeholder="Value (50+)" value={item.value} onChange={e => updateInArray("about.stats", i, "value", e.target.value)} />
                  <input className={inp} placeholder="Label (Projects Delivered)" value={item.label} onChange={e => updateInArray("about.stats", i, "label", e.target.value)} />
                </div>
              )} />
          </Section>
        )}

        {/* ── SERVICES ─────────────────────────────────────────────────── */}
        {tab === "Services" && (
          <Section title="Services & Call Slots">
            <div>
              <label className={lbl}>Services (one per line — used in contact form dropdown)</label>
              <textarea className={`${inp} resize-none`} rows={6} value={(form.services ?? []).join("\n")} onChange={e => setForm(prev => ({ ...prev, services: e.target.value.split("\n").map(s => s.trim()).filter(Boolean) }))} placeholder="App Development&#10;Website Building&#10;CRM Panel" />
            </div>
            <div>
              <label className={lbl}>Call Slots (one per line — shown as booking buttons)</label>
              <textarea className={`${inp} resize-none`} rows={6} value={(form.callSlots ?? []).join("\n")} onChange={e => setForm(prev => ({ ...prev, callSlots: e.target.value.split("\n").map(s => s.trim()).filter(Boolean) }))} placeholder="Mon 09 · 3pm&#10;Tue 10 · 11am" />
            </div>
          </Section>
        )}

        {/* ── PROCESS ──────────────────────────────────────────────────── */}
        {tab === "Process" && (
          <Section title="How We Work Page">
            <ArrSection label="Process Phases" items={form.process.phases}
              onAdd={() => addToArray("process.phases", { id: "", n: "01", title: "", description: "", accent: "from-blue-500/20 to-blue-500/0", dot: "bg-blue-500" })}
              onRemove={i => removeFromArray("process.phases", i)}
              renderItem={(item, i) => (
                <div className="grid grid-cols-2 gap-2">
                  <input className={inp} placeholder="ID (discovery)" value={item.id} onChange={e => updateInArray("process.phases", i, "id", e.target.value)} />
                  <input className={inp} placeholder="Number (01)" value={item.n} onChange={e => updateInArray("process.phases", i, "n", e.target.value)} />
                  <input className={inp} placeholder="Title" value={item.title} onChange={e => updateInArray("process.phases", i, "title", e.target.value)} />
                  <input className={inp} placeholder="Description" value={item.description} onChange={e => updateInArray("process.phases", i, "description", e.target.value)} />
                  <input className={inp} placeholder="Accent CSS (from-blue-500/20 to-blue-500/0)" value={item.accent} onChange={e => updateInArray("process.phases", i, "accent", e.target.value)} />
                  <input className={inp} placeholder="Dot CSS (bg-blue-500)" value={item.dot} onChange={e => updateInArray("process.phases", i, "dot", e.target.value)} />
                </div>
              )} />
            <ArrSection label="Perks (Why Build With Us)" items={form.process.perks}
              onAdd={() => addToArray("process.perks", { title: "", description: "", icon: "⚡", gradient: "from-amber-500/10 via-transparent to-transparent", border: "hover:border-amber-500/30" })}
              onRemove={i => removeFromArray("process.perks", i)}
              renderItem={(item, i) => (
                <div className="grid grid-cols-2 gap-2">
                  <input className={inp} placeholder="Icon (emoji or name)" value={item.icon} onChange={e => updateInArray("process.perks", i, "icon", e.target.value)} />
                  <input className={inp} placeholder="Title" value={item.title} onChange={e => updateInArray("process.perks", i, "title", e.target.value)} />
                  <input className={`${inp} col-span-2`} placeholder="Description" value={item.description} onChange={e => updateInArray("process.perks", i, "description", e.target.value)} />
                </div>
              )} />
          </Section>
        )}

        {/* ── TEAM PLAYBOOK ─────────────────────────────────────────────── */}
        {tab === "Team Playbook" && (
          <Section title="Team Page — Playbook">
            <ArrSection label="Playbook Phases" items={form.teamPlaybook}
              onAdd={() => addToArray("teamPlaybook", { phase: "01", name: "", body: "" })}
              onRemove={i => removeFromArray("teamPlaybook", i)}
              renderItem={(item, i) => (
                <div className="grid grid-cols-3 gap-2">
                  <input className={inp} placeholder="Phase (01)" value={item.phase} onChange={e => updateInArray("teamPlaybook", i, "phase", e.target.value)} />
                  <input className={inp} placeholder="Name (Discovery)" value={item.name} onChange={e => updateInArray("teamPlaybook", i, "name", e.target.value)} />
                  <input className={inp} placeholder="Body text" value={item.body} onChange={e => updateInArray("teamPlaybook", i, "body", e.target.value)} />
                </div>
              )} />
          </Section>
        )}

        {/* ── CONTACT INFO ─────────────────────────────────────────────── */}
        {tab === "Contact Info" && (
          <Section title="Contact Information">
            <div className="grid grid-cols-2 gap-4">
              <F label="Email" value={form.contactInfo.email} onChange={v => setNested("contactInfo", "email", v)} placeholder="hello@techco.dev" />
              <F label="Phone" value={form.contactInfo.phone} onChange={v => setNested("contactInfo", "phone", v)} placeholder="+1 (555) 000-1234" />
            </div>
          </Section>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex items-center gap-2">
            <input type="checkbox" id="isActiveSetting" checked={form.isActive} onChange={e => setForm(prev => ({ ...prev, isActive: e.target.checked }))} className="rounded" />
            <label htmlFor="isActiveSetting" className="text-sm text-muted-foreground">Settings active</label>
          </div>
          <RbacGate action="edit"><button type="submit" disabled={saving} className="px-8 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium disabled:opacity-50 hover:opacity-90 transition-opacity">
            {saving ? "Saving..." : "Save All Settings"}
          </button></RbacGate>
        </div>
      </form>
    </div>
  );
}

const inp = "mt-1 w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all";
const lbl = "text-xs font-medium text-muted-foreground uppercase tracking-wider";

function Section({ title, children }) {
  return (
    <div className="rounded-xl border border-border p-6 space-y-4">
      <h3 className="font-semibold text-base border-b border-border pb-3">{title}</h3>
      {children}
    </div>
  );
}

function F({ label, value, onChange, className = "", type = "text", placeholder = "" }) {
  return (
    <div className={className}>
      <label className={lbl}>{label}</label>
      <input type={type} className={inp} value={value ?? ""} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  );
}

function TA({ label, value, onChange, rows = 3 }) {
  return (
    <div>
      <label className={lbl}>{label}</label>
      <textarea className={`${inp} resize-none`} rows={rows} value={value ?? ""} onChange={e => onChange(e.target.value)} />
    </div>
  );
}

function ArrSection({ label, items, onAdd, onRemove, renderItem }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className={lbl}>{label}</label>
        <button type="button" onClick={onAdd} className="text-xs text-primary hover:opacity-80">+ Add</button>
      </div>
      <div className="space-y-2">
        {(items ?? []).map((item, i) => (
          <div key={i} className="flex items-start gap-2">
            <div className="flex-1">{renderItem(item, i)}</div>
            <button type="button" onClick={() => onRemove(i)} className="mt-1 text-red-400 hover:text-red-300 text-lg leading-none flex-shrink-0">×</button>
          </div>
        ))}
      </div>
    </div>
  );
}
