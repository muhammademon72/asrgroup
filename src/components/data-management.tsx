"use client";

import React, { useState, useRef } from "react";
import {
  Download,
  Upload,
  FileJson,
  Database,
  Users,
  FileText,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

// ============================================================
// Data Management — Export / Import ALL app data as JSON
// Sections: Requisitions, Users, Dropdown Options (department/branch/address)
// Plus a one-click "Export All" / "Import All" that bundles everything
// ============================================================

interface RequisitionItem {
  sl: number;
  equipmentName: string;
  description: string;
  qty: number;
  condition: string;
  approxPrice: number;
  selected: boolean;
}

interface RequisitionExport {
  date: string;
  organizationName: string;
  department: string;
  address: string;
  applicantName: string;
  applicantDepartment: string;
  employeeId: string;
  branchName: string;
  applicantAddress: string;
  contact: string;
  category: string;
  reason: string;
  totalAmount: number;
  status: string;
  items: RequisitionItem[];
}

interface UserExport {
  name: string;
  email: string;
  password: string;
  phone: string;
  employeeId: string;
  department: string;
  branch: string;
  role: string;
  status: string;
}

interface DropdownOptionExport {
  type: string;
  value: string;
}

interface AllData {
  exportedAt: string;
  app: string;
  counts: { requisitions: number; users: number; options: number };
  requisitions: RequisitionExport[];
  users: UserExport[];
  options: DropdownOptionExport[];
}

type ImportSection = "all" | "requisitions" | "users" | "options";

export default function DataManagement() {
  const { toast } = useToast();
  const [busy, setBusy] = useState<string | null>(null);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importPreview, setImportPreview] = useState<AllData | null>(null);
  const [importSection, setImportSection] = useState<ImportSection>("all");
  const fileInputAllRef = useRef<HTMLInputElement>(null);
  const fileInputReqRef = useRef<HTMLInputElement>(null);
  const fileInputUserRef = useRef<HTMLInputElement>(null);
  const fileInputOptRef = useRef<HTMLInputElement>(null);

  // ---------- helpers ----------
  const downloadJSON = (data: unknown, filename: string) => {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const today = () => new Date().toISOString().slice(0, 10);

  // ---------- EXPORT ----------
  const exportAll = async () => {
    setBusy("export-all");
    try {
      const [reqRes, userRes, optRes] = await Promise.all([
        fetch("/api/requisitions"),
        fetch("/api/users"),
        fetch("/api/dropdown-options"),
      ]);
      const reqs: RequisitionExport[] = reqRes.ok ? await reqRes.json() : [];
      const users: UserExport[] = userRes.ok ? await userRes.json() : [];
      const opts: DropdownOptionExport[] = optRes.ok ? await optRes.json() : [];

      const payload: AllData = {
        exportedAt: new Date().toISOString(),
        app: "ASR GROUP — Equipment Requisition System",
        counts: {
          requisitions: reqs.length,
          users: users.length,
          options: opts.length,
        },
        // strip server-generated / internal fields
        requisitions: reqs.map((r) => ({
          date: r.date,
          organizationName: r.organizationName,
          department: r.department,
          address: r.address,
          applicantName: r.applicantName,
          applicantDepartment: r.applicantDepartment,
          employeeId: r.employeeId,
          branchName: r.branchName,
          applicantAddress: r.applicantAddress,
          contact: r.contact,
          category: r.category,
          reason: r.reason,
          totalAmount: r.totalAmount,
          status: r.status,
          items: (r.items || []).map((it) => ({
            sl: it.sl,
            equipmentName: it.equipmentName,
            description: it.description,
            qty: it.qty,
            condition: it.condition,
            approxPrice: it.approxPrice,
            selected: it.selected,
          })),
        })),
        users: users.map((u) => ({
          name: u.name,
          email: u.email,
          password: u.password || "123456",
          phone: u.phone || "",
          employeeId: u.employeeId || "",
          department: u.department || "",
          branch: u.branch || "",
          role: u.role || "User",
          status: u.status || "Active",
        })),
        options: opts.map((o) => ({ type: o.type, value: o.value })),
      };

      downloadJSON(payload, `asr-all-data-${today()}.json`);
      toast({
        title: "Export Complete",
        description: `${reqs.length} requisitions, ${users.length} users, ${opts.length} options exported.`,
      });
    } catch {
      toast({
        title: "Export Failed",
        description: "Could not export all data.",
        variant: "destructive",
      });
    }
    setBusy(null);
  };

  const exportRequisitions = async () => {
    setBusy("export-req");
    try {
      const res = await fetch("/api/requisitions");
      if (!res.ok) throw new Error("fetch failed");
      const reqs: RequisitionExport[] = await res.json();
      const payload = {
        exportedAt: new Date().toISOString(),
        app: "ASR GROUP — Equipment Requisition System",
        count: reqs.length,
        requisitions: reqs.map((r) => ({
          date: r.date,
          organizationName: r.organizationName,
          department: r.department,
          address: r.address,
          applicantName: r.applicantName,
          applicantDepartment: r.applicantDepartment,
          employeeId: r.employeeId,
          branchName: r.branchName,
          applicantAddress: r.applicantAddress,
          contact: r.contact,
          category: r.category,
          reason: r.reason,
          totalAmount: r.totalAmount,
          status: r.status,
          items: (r.items || []).map((it) => ({
            sl: it.sl,
            equipmentName: it.equipmentName,
            description: it.description,
            qty: it.qty,
            condition: it.condition,
            approxPrice: it.approxPrice,
            selected: it.selected,
          })),
        })),
      };
      downloadJSON(payload, `asr-requisitions-${today()}.json`);
      toast({
        title: "Export Complete",
        description: `${reqs.length} requisition(s) exported.`,
      });
    } catch {
      toast({
        title: "Export Failed",
        description: "Could not export requisitions.",
        variant: "destructive",
      });
    }
    setBusy(null);
  };

  const exportUsers = async () => {
    setBusy("export-users");
    try {
      const res = await fetch("/api/users");
      if (!res.ok) throw new Error("fetch failed");
      const users: UserExport[] = await res.json();
      const payload = {
        exportedAt: new Date().toISOString(),
        app: "ASR GROUP — Equipment Requisition System",
        count: users.length,
        users: users.map((u) => ({
          name: u.name,
          email: u.email,
          password: u.password || "123456",
          phone: u.phone || "",
          employeeId: u.employeeId || "",
          department: u.department || "",
          branch: u.branch || "",
          role: u.role || "User",
          status: u.status || "Active",
        })),
      };
      downloadJSON(payload, `asr-users-${today()}.json`);
      toast({
        title: "Export Complete",
        description: `${users.length} user(s) exported.`,
      });
    } catch {
      toast({
        title: "Export Failed",
        description: "Could not export users.",
        variant: "destructive",
      });
    }
    setBusy(null);
  };

  const exportOptions = async () => {
    setBusy("export-options");
    try {
      const res = await fetch("/api/dropdown-options");
      if (!res.ok) throw new Error("fetch failed");
      const opts: DropdownOptionExport[] = await res.json();
      const payload = {
        exportedAt: new Date().toISOString(),
        app: "ASR GROUP — Equipment Requisition System",
        count: opts.length,
        options: opts.map((o) => ({ type: o.type, value: o.value })),
      };
      downloadJSON(payload, `asr-options-${today()}.json`);
      toast({
        title: "Export Complete",
        description: `${opts.length} dropdown option(s) exported.`,
      });
    } catch {
      toast({
        title: "Export Failed",
        description: "Could not export options.",
        variant: "destructive",
      });
    }
    setBusy(null);
  };

  // ---------- IMPORT ----------
  const parseFile = async (file: File): Promise<AllData | null> => {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      // Normalize into AllData shape
      const data: AllData = {
        exportedAt: parsed.exportedAt || new Date().toISOString(),
        app: parsed.app || "ASR GROUP",
        counts: {
          requisitions: parsed.requisitions?.length || parsed.count || 0,
          users: parsed.users?.length || parsed.count || 0,
          options: parsed.options?.length || parsed.count || 0,
        },
        requisitions: Array.isArray(parsed.requisitions)
          ? parsed.requisitions
          : Array.isArray(parsed)
          ? parsed
          : [],
        users: Array.isArray(parsed.users) ? parsed.users : Array.isArray(parsed) ? parsed : [],
        options: Array.isArray(parsed.options) ? parsed.options : Array.isArray(parsed) ? parsed : [],
      };
      return data;
    } catch {
      return null;
    }
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>, section: ImportSection) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const data = await parseFile(file);
    if (!data) {
      toast({
        title: "Import Failed",
        description: "Could not parse JSON file.",
        variant: "destructive",
      });
      e.target.value = "";
      return;
    }
    const totalAvailable =
      (section === "all" || section === "requisitions" ? data.requisitions.length : 0) +
      (section === "all" || section === "users" ? data.users.length : 0) +
      (section === "all" || section === "options" ? data.options.length : 0);
    if (totalAvailable === 0) {
      toast({
        title: "Import Failed",
        description: `No ${section === "all" ? "data" : section} found in this file.`,
        variant: "destructive",
      });
      e.target.value = "";
      return;
    }
    setImportPreview(data);
    setImportSection(section);
    setImportDialogOpen(true);
    e.target.value = "";
  };

  const confirmImport = async () => {
    if (!importPreview) return;
    setBusy("import");
    let reqCreated = 0,
      reqFailed = 0,
      userCreated = 0,
      userSkipped = 0,
      userFailed = 0,
      optCreated = 0,
      optSkipped = 0,
      optFailed = 0;

    try {
      // Requisitions
      if (importSection === "all" || importSection === "requisitions") {
        for (const r of importPreview.requisitions) {
          try {
            const res = await fetch("/api/requisitions", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                date: r.date || new Date().toLocaleDateString("en-GB"),
                organizationName: r.organizationName || "ASR GROUP",
                department: r.department || "",
                address: r.address || "",
                applicantName: r.applicantName || "",
                applicantDepartment: r.applicantDepartment || "",
                employeeId: r.employeeId || "",
                branchName: r.branchName || "",
                applicantAddress: r.applicantAddress || "",
                contact: r.contact || "",
                category: r.category || "Others Accessories",
                reason: r.reason || "",
                totalAmount: r.totalAmount || 0,
                status: r.status || "Draft",
                items: r.items || [],
              }),
            });
            if (res.ok) reqCreated++;
            else reqFailed++;
          } catch {
            reqFailed++;
          }
        }
      }

      // Users
      if (importSection === "all" || importSection === "users") {
        for (const u of importPreview.users) {
          try {
            const res = await fetch("/api/users", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                name: u.name,
                email: u.email,
                password: u.password || "123456",
                phone: u.phone || "",
                employeeId: u.employeeId || "",
                department: u.department || "",
                branch: u.branch || "",
                role: u.role || "User",
                status: u.status || "Active",
              }),
            });
            if (res.ok) userCreated++;
            else if (res.status === 500) userSkipped++;
            else userFailed++;
          } catch {
            userFailed++;
          }
        }
      }

      // Options
      if (importSection === "all" || importSection === "options") {
        for (const o of importPreview.options) {
          if (!o.type || !o.value) {
            optFailed++;
            continue;
          }
          try {
            const res = await fetch("/api/dropdown-options", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ type: o.type, value: o.value }),
            });
            if (res.ok) optCreated++;
            else optSkipped++;
          } catch {
            optFailed++;
          }
        }
      }

      const parts: string[] = [];
      if (importSection === "all" || importSection === "requisitions")
        parts.push(`Requisitions: ${reqCreated} created, ${reqFailed} failed`);
      if (importSection === "all" || importSection === "users")
        parts.push(`Users: ${userCreated} created, ${userSkipped} skipped, ${userFailed} failed`);
      if (importSection === "all" || importSection === "options")
        parts.push(`Options: ${optCreated} created, ${optSkipped} skipped, ${optFailed} failed`);

      toast({
        title: "Import Complete",
        description: parts.join(" · "),
      });
      setImportDialogOpen(false);
      setImportPreview(null);
    } catch {
      toast({
        title: "Import Error",
        description: "Unexpected error during import.",
        variant: "destructive",
      });
    }
    setBusy(null);
  };

  // ---------- UI ----------
  const SectionCard = ({
    icon,
    title,
    description,
    count,
    onExport,
    onImport,
    exportLabel,
    busyKey,
  }: {
    icon: React.ReactNode;
    title: string;
    description: string;
    count?: string;
    onExport: () => void;
    onImport: () => void;
    exportLabel: string;
    busyKey: string;
  }) => (
    <Card className="border-slate-200 shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
              {icon}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-800">{title}</h3>
                {count && (
                  <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                    {count}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1">{description}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-4">
          <Button
            onClick={onExport}
            variant="outline"
            size="sm"
            disabled={busy !== null}
            className="gap-1.5 text-xs"
          >
            {busy === busyKey ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            {exportLabel}
          </Button>
          <Button
            onClick={onImport}
            variant="outline"
            size="sm"
            disabled={busy !== null}
            className="gap-1.5 text-xs"
          >
            <Upload className="w-3.5 h-3.5" /> Import
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-lg bg-slate-800 flex items-center justify-center">
          <FileJson className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-800">Data Management</h2>
          <p className="text-xs text-slate-500">
            Export and import all application data in JSON format
          </p>
        </div>
      </div>

      {/* Export / Import ALL */}
      <Card className="border-slate-300 shadow-md bg-gradient-to-br from-slate-50 to-white">
        <CardContent className="p-5">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-lg bg-slate-800 flex items-center justify-center">
                <Database className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">All Data (Full Backup)</h3>
                <p className="text-xs text-slate-500">
                  Bundles requisitions + users + dropdown options into a single JSON file
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={exportAll}
                disabled={busy !== null}
                className="bg-slate-800 hover:bg-slate-700 gap-2"
              >
                {busy === "export-all" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                Export All
              </Button>
              <Button
                onClick={() => fileInputAllRef.current?.click()}
                variant="outline"
                disabled={busy !== null}
                className="gap-2 border-slate-300"
              >
                <Upload className="w-4 h-4" /> Import All
              </Button>
              <input
                ref={fileInputAllRef}
                type="file"
                accept="application/json,.json"
                onChange={(e) => handleFile(e, "all")}
                className="hidden"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Individual sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SectionCard
          icon={<FileText className="w-5 h-5 text-slate-600" />}
          title="Requisitions"
          description="All equipment requisition records with their items"
          exportLabel="Export"
          busyKey="export-req"
          onExport={exportRequisitions}
          onImport={() => fileInputReqRef.current?.click()}
        />
        <input
          ref={fileInputReqRef}
          type="file"
          accept="application/json,.json"
          onChange={(e) => handleFile(e, "requisitions")}
          className="hidden"
        />

        <SectionCard
          icon={<Users className="w-5 h-5 text-slate-600" />}
          title="Users"
          description="All user accounts (admins and regular users)"
          exportLabel="Export"
          busyKey="export-users"
          onExport={exportUsers}
          onImport={() => fileInputUserRef.current?.click()}
        />
        <input
          ref={fileInputUserRef}
          type="file"
          accept="application/json,.json"
          onChange={(e) => handleFile(e, "users")}
          className="hidden"
        />

        <SectionCard
          icon={<Database className="w-5 h-5 text-slate-600" />}
          title="Dropdown Options"
          description="Department, Branch, and Address options"
          exportLabel="Export"
          busyKey="export-options"
          onExport={exportOptions}
          onImport={() => fileInputOptRef.current?.click()}
        />
        <input
          ref={fileInputOptRef}
          type="file"
          accept="application/json,.json"
          onChange={(e) => handleFile(e, "options")}
          className="hidden"
        />
      </div>

      {/* Import Preview Dialog */}
      <Dialog open={importDialogOpen} onOpenChange={(o) => { if (!busy) setImportDialogOpen(o); }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Confirm Import</DialogTitle>
            <DialogDescription>
              Review the data below. Click <strong>Confirm Import</strong> to add it. Existing records
              (same email / same option value) will be skipped.
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[55vh] overflow-y-auto space-y-4">
            {(importSection === "all" || importSection === "requisitions") &&
              importPreview &&
              importPreview.requisitions.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-slate-600" />
                    <h4 className="text-sm font-bold text-slate-700">
                      Requisitions ({importPreview.requisitions.length})
                    </h4>
                  </div>
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <table className="w-full text-xs">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="text-left p-2 font-semibold text-slate-600">SL</th>
                          <th className="text-left p-2 font-semibold text-slate-600">Date</th>
                          <th className="text-left p-2 font-semibold text-slate-600">Applicant</th>
                          <th className="text-left p-2 font-semibold text-slate-600">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {importPreview.requisitions.slice(0, 50).map((r, i) => (
                          <tr key={i} className="border-t hover:bg-slate-50">
                            <td className="p-2 text-slate-500">{i + 1}</td>
                            <td className="p-2 text-slate-700">{r.date}</td>
                            <td className="p-2 text-slate-700">{r.applicantName || "—"}</td>
                            <td className="p-2 text-slate-700">{r.status}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {importPreview.requisitions.length > 50 && (
                      <div className="p-2 text-center text-xs text-slate-400 bg-slate-50">
                        ... and {importPreview.requisitions.length - 50} more
                      </div>
                    )}
                  </div>
                </div>
              )}

            {(importSection === "all" || importSection === "users") &&
              importPreview &&
              importPreview.users.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-slate-600" />
                    <h4 className="text-sm font-bold text-slate-700">
                      Users ({importPreview.users.length})
                    </h4>
                  </div>
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <table className="w-full text-xs">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="text-left p-2 font-semibold text-slate-600">SL</th>
                          <th className="text-left p-2 font-semibold text-slate-600">Name</th>
                          <th className="text-left p-2 font-semibold text-slate-600">Email</th>
                          <th className="text-left p-2 font-semibold text-slate-600">Role</th>
                        </tr>
                      </thead>
                      <tbody>
                        {importPreview.users.slice(0, 50).map((u, i) => (
                          <tr key={i} className="border-t hover:bg-slate-50">
                            <td className="p-2 text-slate-500">{i + 1}</td>
                            <td className="p-2 text-slate-700">{u.name}</td>
                            <td className="p-2 text-slate-700">{u.email}</td>
                            <td className="p-2 text-slate-700">{u.role}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {importPreview.users.length > 50 && (
                      <div className="p-2 text-center text-xs text-slate-400 bg-slate-50">
                        ... and {importPreview.users.length - 50} more
                      </div>
                    )}
                  </div>
                </div>
              )}

            {(importSection === "all" || importSection === "options") &&
              importPreview &&
              importPreview.options.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Database className="w-4 h-4 text-slate-600" />
                    <h4 className="text-sm font-bold text-slate-700">
                      Dropdown Options ({importPreview.options.length})
                    </h4>
                  </div>
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <table className="w-full text-xs">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="text-left p-2 font-semibold text-slate-600">SL</th>
                          <th className="text-left p-2 font-semibold text-slate-600">Type</th>
                          <th className="text-left p-2 font-semibold text-slate-600">Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        {importPreview.options.slice(0, 50).map((o, i) => (
                          <tr key={i} className="border-t hover:bg-slate-50">
                            <td className="p-2 text-slate-500">{i + 1}</td>
                            <td className="p-2 text-slate-700 capitalize">{o.type}</td>
                            <td className="p-2 text-slate-700">{o.value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {importPreview.options.length > 50 && (
                      <div className="p-2 text-center text-xs text-slate-400 bg-slate-50">
                        ... and {importPreview.options.length - 50} more
                      </div>
                    )}
                  </div>
                </div>
              )}
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 bg-blue-50 border border-blue-200 rounded-lg p-3">
            <AlertCircle className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              Importing will <strong>add</strong> records to the database. Existing records with the same
              email / option value will be skipped (not overwritten).
            </span>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setImportDialogOpen(false);
                setImportPreview(null);
              }}
              disabled={busy !== null}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmImport}
              disabled={busy !== null}
              className="bg-slate-800 hover:bg-slate-700 gap-2"
            >
              {busy === "import" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              Confirm Import
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
