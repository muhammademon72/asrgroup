"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { LogOut, UserCircle } from "lucide-react";
import {
  Save,
  Edit3,
  Trash2,
  FileDown,
  Printer,
  Plus,
  ArrowLeft,
  Search,
  X,
  Loader2,
  FileText,
  Settings2,
  Pencil,
  Check,
  CalendarIcon,
  Copy,
  Building2,
  MapPin,
  Network,
} from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import UserManagement from "@/components/user-management";
import LoginPage from "@/components/login-page";

// Types
interface RequisitionItem {
  id?: string;
  sl: number;
  equipmentName: string;
  description: string;
  qty: number;
  condition: string;
  approxPrice: number;
  selected: boolean;
}

interface Requisition {
  id?: string;
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
  createdByEmail: string;
  items: RequisitionItem[];
  createdAt?: string;
  updatedAt?: string;
}

interface DropdownOption {
  id: string;
  type: string;
  value: string;
}

// Default equipment list
const DEFAULT_EQUIPMENT_NAMES = [
  "Processor", "Motherboard", "Ram", "SSD Drive", "Power Supply",
  "CPU Casing", "Monitor", "Mouse", "Keyboard", "UPS",
  "Wi-Fi Router", "Toner / Cartridge",
];

const CATEGORIES = ["Desktop", "Laptop", "Network", "CCTV", "PC-Update", "Others Accessories", "Repairing"];
const CONDITIONS = ["New", "Used", "Refurbished"];

const emptyItem = (sl: number): RequisitionItem => ({
  sl, equipmentName: "", description: "", qty: 0, condition: "", approxPrice: 0, selected: false,
});

const getDefaultItems = (): RequisitionItem[] => {
  const items = DEFAULT_EQUIPMENT_NAMES.map((name, i) => ({
    sl: i + 1, equipmentName: name, description: "", qty: 0, condition: "", approxPrice: 0, selected: false,
  }));
  for (let i = 0; i < 3; i++) items.push(emptyItem(DEFAULT_EQUIPMENT_NAMES.length + i + 1));
  return items;
};

// Dropdown defaults — will be fetched from DB at runtime
const dropdownDefaults = { department: "Information Technology", branch: "Head Office", address: "Elephant Road" };

const createEmptyRequisition = (defaults = dropdownDefaults): Requisition => ({
  date: new Date().toLocaleDateString("en-GB"),
  organizationName: "ASR GROUP",
  department: "Information and Technology Department",
  address: "Head Office : Shahid Janani Jahanara Imam Sharani, Elephant Road Dhaka -1205, Bangladesh",
  applicantName: "",
  applicantDepartment: defaults.department,
  employeeId: "",
  branchName: defaults.branch,
  applicantAddress: defaults.address,
  contact: "",
  category: "Others Accessories",
  reason: "",
  totalAmount: 0,
  status: "Draft",
  createdByEmail: "",
  items: getDefaultItems(),
});

// ==================== DropdownWithManage Component ====================
function DropdownWithManage({
  label,
  type,
  value,
  onChange,
  disabled,
  isAdmin,
}: {
  label: string;
  type: "department" | "branch" | "address";
  value: string;
  onChange: (val: string) => void;
  disabled: boolean;
  isAdmin: boolean;
}) {
  const [options, setOptions] = useState<DropdownOption[]>([]);
  const [manageOpen, setManageOpen] = useState(false);
  const [newOption, setNewOption] = useState("");
  const [editingOpt, setEditingOpt] = useState<{ id: string; value: string } | null>(null);
  const [deleteOptId, setDeleteOptId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [manageLoading, setManageLoading] = useState(false);
  const { toast } = useToast();

  const fetchOptions = useCallback(async () => {
    try {
      const res = await fetch(`/api/dropdown-options?type=${type}`);
      if (res.ok) setOptions(await res.json());
    } catch { /* ignore */ }
  }, [type]);

  useEffect(() => { fetchOptions(); }, [fetchOptions]);

  const handleAddOption = async () => {
    if (!newOption.trim()) return;
    setManageLoading(true);
    try {
      const res = await fetch("/api/dropdown-options", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, value: newOption.trim() }),
      });
      if (res.ok) {
        toast({ title: "Added", description: `"${newOption.trim()}" added successfully` });
        setNewOption("");
        await fetchOptions();
      } else {
        const err = await res.json();
        toast({ title: "Error", description: err.error || "Failed to add", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to add option", variant: "destructive" });
    } finally { setManageLoading(false); }
  };

  const handleUpdateOption = async () => {
    if (!editingOpt || !editingOpt.value.trim()) return;
    setManageLoading(true);
    try {
      const res = await fetch(`/api/dropdown-options/${editingOpt.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: editingOpt.value.trim() }),
      });
      if (res.ok) {
        toast({ title: "Updated", description: "Option updated successfully" });
        setEditingOpt(null);
        await fetchOptions();
      } else {
        toast({ title: "Error", description: "Failed to update", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to update", variant: "destructive" });
    } finally { setManageLoading(false); }
  };

  const handleDeleteOption = async () => {
    if (!deleteOptId) return;
    setManageLoading(true);
    try {
      const res = await fetch(`/api/dropdown-options/${deleteOptId}`, { method: "DELETE" });
      if (res.ok) {
        toast({ title: "Deleted", description: "Option removed successfully" });
        setDeleteOptId(null);
        setDeleteDialogOpen(false);
        await fetchOptions();
      }
    } catch {
      toast({ title: "Error", description: "Failed to delete", variant: "destructive" });
    } finally { setManageLoading(false); }
  };

  return (
    <div className="flex items-center gap-1">
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger className="h-7 text-xs flex-1 min-w-0">
          <SelectValue placeholder={`Select ${label}...`} />
        </SelectTrigger>
        <SelectContent>
          {/* Show current value as fallback if it doesn't match any DB option */}
          {value && !options.some(opt => opt.value === value) && (
            <SelectItem key="__current__" value={value}>{value}</SelectItem>
          )}
          {options.map((opt) => (
            <SelectItem key={opt.id} value={opt.value}>{opt.value}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      {isAdmin && (
        <Popover open={manageOpen} onOpenChange={setManageOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 shrink-0 text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              title="Manage options"
            >
              <Settings2 className="w-3.5 h-3.5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-0" align="end" side="bottom">
            <div className="p-3 border-b bg-slate-50">
              <h4 className="text-sm font-semibold text-slate-800">Manage {label}</h4>
              <p className="text-xs text-slate-500">Add, edit, or remove options</p>
            </div>
            <div className="p-3 border-b">
              <div className="flex items-center gap-2">
                <Input
                  placeholder={`New ${label.toLowerCase()}...`}
                  value={newOption}
                  onChange={(e) => setNewOption(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddOption()}
                  className="h-8 text-xs flex-1"
                />
                <Button
                  onClick={handleAddOption}
                  disabled={manageLoading || !newOption.trim()}
                  size="sm"
                  className="h-8 gap-1 bg-slate-800 hover:bg-slate-700 shrink-0"
                >
                  {manageLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                  Add
                </Button>
              </div>
            </div>
            <div className="max-h-48 overflow-y-auto">
              {options.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400">No options yet</div>
              ) : (
                options.map((opt) => (
                  <div key={opt.id} className="flex items-center gap-2 px-3 py-2 border-b last:border-b-0 hover:bg-slate-50 transition-colors">
                    {editingOpt?.id === opt.id ? (
                      <>
                        <Input
                          value={editingOpt.value}
                          onChange={(e) => setEditingOpt({ ...editingOpt, value: e.target.value })}
                          onKeyDown={(e) => e.key === "Enter" && handleUpdateOption()}
                          className="h-7 text-xs flex-1"
                          autoFocus
                        />
                        <Button size="sm" onClick={handleUpdateOption} disabled={manageLoading} className="h-7 w-7 p-0 bg-emerald-600 hover:bg-emerald-500 shrink-0">
                          <Check className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditingOpt(null)} className="h-7 w-7 p-0 shrink-0">
                          <X className="w-3 h-3" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <span className="flex-1 text-xs text-slate-700 truncate">{opt.value}</span>
                        <Button variant="ghost" size="sm" onClick={() => setEditingOpt({ id: opt.id, value: opt.value })} className="h-7 w-7 p-0 shrink-0" title="Edit">
                          <Pencil className="w-3 h-3 text-blue-500" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => { setDeleteOptId(opt.id); setDeleteDialogOpen(true); }} className="h-7 w-7 p-0 shrink-0" title="Delete">
                          <Trash2 className="w-3 h-3 text-red-400" />
                        </Button>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </PopoverContent>
        </Popover>
      )}
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {label} Option</DialogTitle>
            <DialogDescription>Are you sure you want to delete this option? This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteOption} disabled={manageLoading}>
              {manageLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ==================== DatePickerWithAutoClose Component ====================
function DatePickerWithAutoClose({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) {
  const [open, setOpen] = useState(false);

  const parseDate = (dateStr: string): Date | undefined => {
    if (!dateStr) return undefined;
    const parts = dateStr.split("/");
    if (parts.length === 3) {
      return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
    }
    return undefined;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="mt-1 w-full justify-start text-left font-normal h-9"
        >
          <CalendarIcon className="mr-2 h-4 w-4 text-slate-500" />
          {value || "Pick a date"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={parseDate(value)}
          onSelect={(date) => {
            if (date) {
              onChange(format(date, "dd/MM/yyyy"));
              setOpen(false);
            }
          }}
          captionLayout="dropdown-buttons"
          defaultMonth={parseDate(value) || new Date()}
        />
      </PopoverContent>
    </Popover>
  );
}

// ==================== Dropdown Management Component ====================
function DropdownManagement({ type, label, icon }: { type: "department" | "branch" | "address"; label: string; icon: React.ReactNode }) {
  const [options, setOptions] = useState<DropdownOption[]>([]);
  const [newValue, setNewValue] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchOptions = useCallback(async () => {
    try {
      const res = await fetch(`/api/dropdown-options?type=${type}`);
      if (res.ok) setOptions(await res.json());
    } catch { /* ignore */ }
  }, [type]);

  useEffect(() => { fetchOptions(); }, [fetchOptions]);

  const handleAdd = async () => {
    if (!newValue.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/dropdown-options", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, value: newValue.trim() }),
      });
      if (res.ok) {
        toast({ title: "Added", description: `"${newValue.trim()}" added successfully` });
        setNewValue("");
        await fetchOptions();
      } else {
        const err = await res.json();
        toast({ title: "Error", description: err.error || "Failed to add", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to add option", variant: "destructive" });
    } finally { setLoading(false); }
  };

  const handleUpdate = async () => {
    if (!editingId || !editingValue.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/dropdown-options/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: editingValue.trim() }),
      });
      if (res.ok) {
        toast({ title: "Updated", description: "Option updated successfully" });
        setEditingId(null);
        setEditingValue("");
        await fetchOptions();
      } else {
        toast({ title: "Error", description: "Failed to update", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to update", variant: "destructive" });
    } finally { setLoading(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/dropdown-options/${deleteId}`, { method: "DELETE" });
      if (res.ok) {
        toast({ title: "Deleted", description: "Option removed successfully" });
        setDeleteId(null);
        setDeleteDialogOpen(false);
        await fetchOptions();
      }
    } catch {
      toast({ title: "Error", description: "Failed to delete", variant: "destructive" });
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-white">
          {icon}
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800">Manage {label}</h2>
          <p className="text-sm text-slate-500">Create, edit, and delete {label.toLowerCase()} options</p>
        </div>
      </div>

      {/* Add New */}
      <Card className="shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Input
              placeholder={`Enter new ${label.toLowerCase()} name...`}
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              className="flex-1 h-9"
            />
            <Button onClick={handleAdd} disabled={loading || !newValue.trim()} className="bg-slate-800 hover:bg-slate-700 gap-2 h-9">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Add
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Options List */}
      <Card className="shadow-sm">
        <div className="border-b bg-slate-50 px-4 py-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-700">{label} List ({options.length})</h3>
        </div>
        {options.length === 0 ? (
          <CardContent className="py-12 text-center">
            <Settings2 className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <p className="text-sm text-slate-500">No {label.toLowerCase()} options found. Add one above.</p>
          </CardContent>
        ) : (
          <div className="divide-y">
            {options.map((opt, idx) => (
              <div key={opt.id} className="px-4 py-3 flex items-center gap-3 hover:bg-slate-50 transition-colors">
                <span className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-semibold text-slate-600">{idx + 1}</span>
                {editingId === opt.id ? (
                  <div className="flex-1 flex items-center gap-2">
                    <Input
                      value={editingValue}
                      onChange={(e) => setEditingValue(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleUpdate()}
                      className="h-8 flex-1"
                      autoFocus
                    />
                    <Button size="sm" onClick={handleUpdate} disabled={loading} className="gap-1 h-8 bg-emerald-600 hover:bg-emerald-500">
                      {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />} Save
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => { setEditingId(null); setEditingValue(""); }} className="h-8">Cancel</Button>
                  </div>
                ) : (
                  <>
                    <span className="flex-1 text-sm font-medium text-slate-700">{opt.value}</span>
                    <Button variant="ghost" size="sm" onClick={() => { setEditingId(opt.id); setEditingValue(opt.value); }} className="h-8 w-8 p-0" title="Edit">
                      <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => { setDeleteId(opt.id); setDeleteDialogOpen(true); }} className="h-8 w-8 p-0" title="Delete">
                      <Trash2 className="w-3.5 h-3.5 text-red-500" />
                    </Button>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {label}</DialogTitle>
            <DialogDescription>Are you sure you want to delete this {label.toLowerCase()} option? This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ==================== Main Component ====================
interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  branch: string;
  employeeId: string;
  status: string;
}

export default function EquipmentRequisitionSystem() {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [mainTab, setMainTab] = useState<"requisition" | "users" | "department" | "branch" | "address">("requisition");
  const [view, setView] = useState<"list" | "form">("list");
  const [requisitions, setRequisitions] = useState<Requisition[]>([]);
  const [currentRequisition, setCurrentRequisition] = useState<Requisition>(createEmptyRequisition());
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const formRef = useRef<HTMLDivElement>(null);

  // Fetch dropdown defaults from DB on mount so new requisitions use DB values
  // Only override hardcoded defaults if they no longer exist in the DB options
  const fetchDropdownDefaults = useCallback(async () => {
    try {
      const [deptRes, branchRes, addrRes] = await Promise.all([
        fetch("/api/dropdown-options?type=department"),
        fetch("/api/dropdown-options?type=branch"),
        fetch("/api/dropdown-options?type=address"),
      ]);
      if (deptRes.ok) {
        const depts: DropdownOption[] = await deptRes.json();
        // Only override if the hardcoded default is no longer in the DB
        if (depts.length > 0 && !depts.some(d => d.value === dropdownDefaults.department)) {
          dropdownDefaults.department = depts[0].value;
        }
      }
      if (branchRes.ok) {
        const branches: DropdownOption[] = await branchRes.json();
        if (branches.length > 0 && !branches.some(b => b.value === dropdownDefaults.branch)) {
          dropdownDefaults.branch = branches[0].value;
        }
      }
      if (addrRes.ok) {
        const addrs: DropdownOption[] = await addrRes.json();
        if (addrs.length > 0 && !addrs.some(a => a.value === dropdownDefaults.address)) {
          dropdownDefaults.address = addrs[0].value;
        }
      }
    } catch { /* ignore — hardcoded defaults will be used */ }
  }, []);

  useEffect(() => { fetchDropdownDefaults(); }, [fetchDropdownDefaults]);

  const fetchRequisitions = useCallback(async () => {
    try {
      let url = "/api/requisitions";
      // If User role, only fetch their own requisitions
      if (authUser && authUser.role === "User" && authUser.email) {
        url += `?createdByEmail=${encodeURIComponent(authUser.email)}`;
      }
      const res = await fetch(url);
      if (res.ok) setRequisitions(await res.json());
    } catch {
      toast({ title: "Error", description: "Failed to fetch requisitions", variant: "destructive" });
    }
  }, [toast, authUser]);

  useEffect(() => { fetchRequisitions(); }, [fetchRequisitions]);

  const calculateTotal = (items: RequisitionItem[]) =>
    items.filter((i) => i.qty > 0 && i.approxPrice > 0).reduce((sum, i) => sum + i.approxPrice * i.qty, 0);

  const updateItem = (index: number, field: keyof RequisitionItem, value: string | number | boolean) => {
    const newItems = [...currentRequisition.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setCurrentRequisition({ ...currentRequisition, items: newItems, totalAmount: calculateTotal(newItems) });
  };

  const addRow = () => {
    const newItems = [...currentRequisition.items, emptyItem(currentRequisition.items.length + 1)];
    setCurrentRequisition({ ...currentRequisition, items: newItems });
  };

  const removeRow = (index: number) => {
    const newItems = currentRequisition.items.filter((_, i) => i !== index);
    newItems.forEach((item, i) => (item.sl = i + 1));
    setCurrentRequisition({ ...currentRequisition, items: newItems, totalAmount: calculateTotal(newItems) });
  };

  const handleSave = async () => {
    if (!currentRequisition.applicantName.trim()) {
      toast({ title: "Validation Error", description: "Applicant Name is required", variant: "destructive" });
      return;
    }
    if (!currentRequisition.employeeId.trim()) {
      toast({ title: "Validation Error", description: "Employee ID is required", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const url = editId ? `/api/requisitions/${editId}` : "/api/requisitions";
      const method = editId ? "PUT" : "POST";
      // Preserve original createdByEmail on edit (don't overwrite with admin's email)
      // Only set createdByEmail on new requisition creation
      const bodyData = {
        ...currentRequisition,
        createdByEmail: editId
          ? (currentRequisition.createdByEmail || authUser?.email || "")
          : (authUser?.email || "")
      };
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(bodyData) });
      if (res.ok) {
        toast({ title: editId ? "Updated Successfully" : "Saved Successfully", description: `Requisition has been ${editId ? "updated" : "saved"}` });
        await fetchRequisitions();
        setView("list"); setIsEditing(false); setEditId(null); setCurrentRequisition(createEmptyRequisition());
      } else {
        const err = await res.json();
        toast({ title: "Error", description: err.error || "Failed to save", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to save requisition", variant: "destructive" });
    } finally { setLoading(false); }
  };

  const handleEdit = (req: Requisition) => { setCurrentRequisition(req); setEditId(req.id!); setIsEditing(true); setView("form"); };
  const handleNew = () => { setCurrentRequisition(createEmptyRequisition(dropdownDefaults)); setEditId(null); setIsEditing(true); setView("form"); };
  const handleView = (req: Requisition) => { setCurrentRequisition(req); setEditId(req.id!); setIsEditing(false); setView("form"); };
  const handleCopyToNew = (req: Requisition) => {
    const copied: Requisition = {
      ...req,
      id: undefined,
      date: new Date().toLocaleDateString("en-GB"),
      status: "Draft",
      createdByEmail: authUser?.email || "",
      items: req.items.map((item, i) => ({ ...item, id: undefined, sl: i + 1 })),
      createdAt: undefined,
      updatedAt: undefined,
    };
    setCurrentRequisition(copied);
    setEditId(null);
    setIsEditing(true);
    setView("form");
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/requisitions/${deleteId}`, { method: "DELETE" });
      if (res.ok) { toast({ title: "Deleted", description: "Requisition has been deleted" }); await fetchRequisitions(); }
    } catch {
      toast({ title: "Error", description: "Failed to delete", variant: "destructive" });
    } finally { setLoading(false); setDeleteDialogOpen(false); setDeleteId(null); }
  };

  const openPrintWindow = () => {
    const pw = window.open("", "_blank");
    if (!pw) return;
    pw.document.write(generatePrintHTML(currentRequisition));
    pw.document.close();
    setTimeout(() => pw.print(), 500);
  };

  const generatePrintHTML = (req: Requisition) => `<!DOCTYPE html>
<html><head><title>Equipment Requisition Form</title><style>
*{margin:0;padding:0;box-sizing:border-box}
@page{size:A4;margin:10mm}
body{font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;padding:0;color:#1a1a1a;font-size:12px}
.container{max-width:190mm;margin:0 auto;border:2px solid #333;padding:15px}
.header{text-align:center;margin-bottom:15px}
.header h1{font-size:20px;font-weight:800;letter-spacing:2px;margin-bottom:4px}
.header h2{font-size:13px;font-weight:600;color:#444}
.top-section{display:flex;gap:15px;margin-bottom:15px}
.left-col{flex:1}.right-col{flex:1}
.field{margin-bottom:6px}
.field-label{font-weight:600;font-size:11px;color:#555}
.field-value{font-size:12px}
.applicant-table{width:100%;border-collapse:collapse}
.applicant-table td{border:1px solid #999;padding:5px 8px;font-size:11px}
.applicant-table td:first-child{font-weight:600;background:#f5f5f5;width:40%}
.category-bar{display:flex;gap:12px;padding:8px;border:1px solid #ccc;margin-bottom:15px;flex-wrap:wrap;background:#fafafa}
.category-item{display:flex;align-items:center;gap:4px;font-size:11px}
.category-item input[type="checkbox"]{transform:scale(0.85)}
.equipment-table{width:100%;border-collapse:collapse;margin-bottom:15px}
.equipment-table th{border:1px solid #333;padding:6px;background:#e8e8e8;font-size:11px;font-weight:700;text-align:center}
.equipment-table td{border:1px solid #999;padding:5px 6px;font-size:11px}
.equipment-table tr:nth-child(even){background:#fafafa}
.total-row{background:#e0e7ff!important;font-weight:700}
.reason-section{margin-bottom:20px}
.reason-section h3{font-size:12px;font-weight:700;margin-bottom:4px}
.reason-text{border:1px solid #ccc;padding:8px;min-height:40px;background:#fafafa;font-size:11px}
.signature-section{display:flex;justify-content:space-between;margin-top:20px}
.signature-block{text-align:center;flex:1}
.signature-line{border-top:1px dashed #666;margin:30px 15px 6px 15px}
.signature-label{font-size:11px;font-weight:600}
@media print{body{padding:0}.container{border:none;padding:10px}}
</style></head><body>
<div class="container">
<div class="header"><h1>EQUIPMENT REQUISITION FORM</h1><h2>${req.department}</h2></div>
<div class="top-section">
<div class="left-col">
<div class="field"><span class="field-label">Date:</span> <span class="field-value">${req.date}</span></div>
<div class="field" style="margin-top:12px"><span class="field-label">To,</span></div>
<div class="field"><span class="field-value" style="font-weight:700">${req.organizationName}</span></div>
<div class="field"><span class="field-value">${req.department}</span></div>
<div class="field"><span class="field-value" style="font-size:11px">${req.address}</span></div>
</div>
<div class="right-col">
<table class="applicant-table">
<tr><td>Applicant Name</td><td>${req.applicantName}</td></tr>
<tr><td>Applicant Department</td><td>${req.applicantDepartment}</td></tr>
<tr><td>Employee ID</td><td>${req.employeeId}</td></tr>
<tr><td>Branch Name</td><td>${req.branchName}</td></tr>
<tr><td>Address</td><td>${req.applicantAddress}</td></tr>
<tr><td>Contact</td><td>${req.contact}</td></tr>
</table></div></div>
<div class="category-bar">
${CATEGORIES.map((cat) => `<div class="category-item"><input type="checkbox" ${req.category === cat ? "checked" : ""} disabled /> ${cat}</div>`).join("")}
</div>
<table class="equipment-table"><thead><tr>
<th style="width:40px">SL</th><th style="width:50px">Select</th><th>EQUIPMENT NAME</th><th>DESCRIPTION</th><th style="width:60px">QTY</th><th style="width:90px">CONDITION</th><th style="width:100px">APPROX PRICE</th>
</tr></thead><tbody>
${req.items.map((item) => `<tr>
<td style="text-align:center">${item.sl}</td>
<td style="text-align:center">${item.selected ? "✓" : ""}</td>
<td>${item.equipmentName}</td><td>${item.description}</td>
<td style="text-align:center">${item.qty || "-"}</td>
<td style="text-align:center">${item.condition || "-"}</td>
<td style="text-align:right">${item.approxPrice ? "৳" + item.approxPrice.toLocaleString() : "-"}</td>
</tr>`).join("")}
<tr class="total-row"><td colspan="6" style="text-align:right;padding-right:15px">Total Amount:</td><td style="text-align:right">৳${req.totalAmount.toLocaleString()}</td></tr>
</tbody></table>
<div class="reason-section"><h3>PLEASE WRITE A REASON :</h3><div class="reason-text">${req.reason || "-"}</div></div>
<div class="signature-section">
<div class="signature-block"><div class="signature-line"></div><div class="signature-label">Applicant</div></div>
<div class="signature-block"><div class="signature-line"></div><div class="signature-label">Manager / In-Charge</div></div>
<div class="signature-block"><div class="signature-line"></div><div class="signature-label">Recommend by</div></div>
<div class="signature-block"><div class="signature-line"></div><div class="signature-label">Authority</div></div>
</div></div></body></html>`;

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      Draft: "bg-yellow-100 text-yellow-800 border-yellow-300",
      Read: "bg-indigo-100 text-indigo-800 border-indigo-300",
      Submitted: "bg-blue-100 text-blue-800 border-blue-300",
      Approved: "bg-green-100 text-green-800 border-green-300",
      Rejected: "bg-red-100 text-red-800 border-red-300",
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-300";
  };

  const filteredRequisitions = requisitions.filter((r) =>
    r.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.organizationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ===================== LOGIN GUARD =====================
  if (!authUser) {
    return <LoginPage onLogin={(user) => setAuthUser(user as AuthUser)} />;
  }

  // ===================== LIST VIEW =====================
  if (view === "list") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="bg-white border-b shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">Equipment Requisition System</h1>
                <p className="text-xs text-slate-500">Information and Technology Department</p>
              </div>
            </div>
            {/* Tab Navigation */}
            <div className="flex items-center gap-2">
              <div className="flex bg-slate-100 rounded-lg p-1 mr-3">
                <button
                  onClick={() => setMainTab("requisition")}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${mainTab === "requisition" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                >
                  Requisition
                </button>
                {authUser.role === "Admin" && (
                  <>
                    <button
                      onClick={() => setMainTab("department")}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-1.5 ${mainTab === "department" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                    >
                      <Network className="w-3.5 h-3.5" /> Department
                    </button>
                    <button
                      onClick={() => setMainTab("branch")}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-1.5 ${mainTab === "branch" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                    >
                      <Building2 className="w-3.5 h-3.5" /> Branch
                    </button>
                    <button
                      onClick={() => setMainTab("address")}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-1.5 ${mainTab === "address" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                    >
                      <MapPin className="w-3.5 h-3.5" /> Address
                    </button>
                  </>
                )}
                {authUser.role === "Admin" && (
                  <button
                    onClick={() => setMainTab("users")}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${mainTab === "users" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                  >
                    Admin Panel
                  </button>
                )}
              </div>
              {mainTab === "requisition" && (
                <Button onClick={handleNew} className="bg-slate-800 hover:bg-slate-700 gap-2">
                  <Plus className="w-4 h-4" /> New Requisition
                </Button>
              )}
              {/* User Info & Logout */}
              <div className="flex items-center gap-2 ml-3 pl-3 border-l border-slate-200">
                <div className="flex items-center gap-2">
                  <UserCircle className="w-5 h-5 text-slate-500" />
                  <div className="hidden sm:block">
                    <p className="text-xs font-medium text-slate-700">{authUser.name}</p>
                    <p className="text-[10px] text-slate-400">{authUser.role}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => { setAuthUser(null); setMainTab("requisition"); }} className="gap-1 text-slate-500 hover:text-red-600">
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 py-6">
          {mainTab === "users" ? (
            <UserManagement />
          ) : mainTab === "department" ? (
            <DropdownManagement type="department" label="Department" icon={<Network className="w-5 h-5" />} />
          ) : mainTab === "branch" ? (
            <DropdownManagement type="branch" label="Branch" icon={<Building2 className="w-5 h-5" />} />
          ) : mainTab === "address" ? (
            <DropdownManagement type="address" label="Address" icon={<MapPin className="w-5 h-5" />} />
          ) : (
          <>
          <div className="flex items-center gap-3 mb-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input placeholder="Search by name, employee ID, organization..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
            </div>
            <span className="text-sm text-slate-500">{filteredRequisitions.length} record(s) found</span>
          </div>
          {filteredRequisitions.length === 0 ? (
            <Card className="text-center py-16">
              <CardContent>
                <FileText className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                <h3 className="text-lg font-semibold text-slate-600 mb-2">No Requisitions Found</h3>
                <p className="text-sm text-slate-400 mb-4">Create your first equipment requisition form</p>
                <Button onClick={handleNew} className="bg-slate-800 hover:bg-slate-700 gap-2"><Plus className="w-4 h-4" /> New Requisition</Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-slate-50">
                      <th className="text-left p-3 text-xs font-semibold text-slate-600">SL</th>
                      <th className="text-left p-3 text-xs font-semibold text-slate-600">Date</th>
                      <th className="text-left p-3 text-xs font-semibold text-slate-600">Applicant</th>
                      <th className="text-left p-3 text-xs font-semibold text-slate-600">Employee ID</th>
                      <th className="text-left p-3 text-xs font-semibold text-slate-600">Category</th>
                      <th className="text-left p-3 text-xs font-semibold text-slate-600">Total Amount</th>
                      <th className="text-left p-3 text-xs font-semibold text-slate-600">Status</th>
                      <th className="text-center p-3 text-xs font-semibold text-slate-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRequisitions.map((req, idx) => (
                      <tr key={req.id} className="border-b hover:bg-slate-50 transition-colors">
                        <td className="p-3 text-sm">{idx + 1}</td>
                        <td className="p-3 text-sm">{req.date}</td>
                        <td className="p-3 text-sm font-medium">{req.applicantName}</td>
                        <td className="p-3 text-sm font-mono">{req.employeeId}</td>
                        <td className="p-3 text-sm">{req.category}</td>
                        <td className="p-3 text-sm font-semibold">৳{req.totalAmount.toLocaleString()}</td>
                        <td className="p-3">
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(req.status)}`}>{req.status}</span>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center justify-center gap-1">
                            <Button variant="ghost" size="sm" onClick={() => handleView(req)} title="View" className="h-8 w-8 p-0"><FileText className="w-4 h-4 text-slate-600" /></Button>
                            {(authUser.role === "Admin" || req.status === "Draft") && (
                              <Button variant="ghost" size="sm" onClick={() => handleEdit(req)} title="Edit" className="h-8 w-8 p-0"><Edit3 className="w-4 h-4 text-blue-600" /></Button>
                            )}
                            <Button variant="ghost" size="sm" onClick={() => handleCopyToNew(req)} title="Copy to New Requisition" className="h-8 w-8 p-0"><Copy className="w-4 h-4 text-emerald-600" /></Button>
                            {authUser.role === "Admin" && (
                              <Button variant="ghost" size="sm" onClick={() => { setDeleteId(req.id!); setDeleteDialogOpen(true); }} title="Delete" className="h-8 w-8 p-0"><Trash2 className="w-4 h-4 text-red-500" /></Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
          </>
          )}
        </div>
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>Delete Requisition</DialogTitle><DialogDescription>Are you sure you want to delete this requisition? This action cannot be undone.</DialogDescription></DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
              <Button variant="destructive" onClick={handleDelete} disabled={loading}>{loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Delete</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // ===================== FORM VIEW =====================
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => { setView("list"); setIsEditing(false); setEditId(null); }} className="gap-1"><ArrowLeft className="w-4 h-4" /> Back</Button>
            <Separator orientation="vertical" className="h-6" />
            <h2 className="text-sm font-semibold text-slate-700">{isEditing ? (editId ? "Edit Requisition" : "New Requisition") : "View Requisition"}</h2>
          </div>
          <div className="flex items-center gap-2">
            {isEditing && (
              <Button onClick={handleSave} disabled={loading} className="bg-slate-800 hover:bg-slate-700 gap-2">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save
              </Button>
            )}
            {!isEditing && editId && (authUser.role === "Admin" || currentRequisition.status === "Draft") && (
              <Button onClick={() => setIsEditing(true)} className="gap-2 bg-blue-600 hover:bg-blue-500"><Edit3 className="w-4 h-4" /> Edit</Button>
            )}
            {editId && (
              <Button variant="outline" onClick={() => handleCopyToNew(currentRequisition)} className="gap-2 border-emerald-300 text-emerald-700 hover:bg-emerald-50"><Copy className="w-4 h-4" /> Copy to New</Button>
            )}
            <Button variant="outline" onClick={openPrintWindow} className="gap-2"><FileDown className="w-4 h-4" /> PDF</Button>
            <Button variant="outline" onClick={openPrintWindow} className="gap-2"><Printer className="w-4 h-4" /> Print</Button>
            {/* User Info & Logout */}
            <div className="flex items-center gap-2 ml-2 pl-2 border-l border-slate-200">
              <UserCircle className="w-4 h-4 text-slate-500" />
              <span className="text-xs font-medium text-slate-600 hidden sm:inline">{authUser.name}</span>
              <Button variant="ghost" size="sm" onClick={() => { setAuthUser(null); setMainTab("requisition"); }} className="gap-1 text-slate-500 hover:text-red-600 h-7 w-7 p-0">
                <LogOut className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6" ref={formRef}>
        <Card className="shadow-md border-slate-300">
          <CardContent className="p-6">
            {/* Title */}
            <div className="text-center mb-6">
              <h1 className="text-2xl font-extrabold tracking-widest text-slate-800">EQUIPMENT REQUISITION FORM</h1>
              <p className="text-sm font-semibold text-slate-500 mt-1">{currentRequisition.department}</p>
            </div>

            {/* Top Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Left Column */}
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase">Date</label>
                  {isEditing ? (
                    <DatePickerWithAutoClose
                      value={currentRequisition.date}
                      onChange={(val) => setCurrentRequisition({ ...currentRequisition, date: val })}
                    />
                  ) : (
                    <p className="text-sm mt-1 font-medium">{currentRequisition.date}</p>
                  )}
                </div>
                <div className="pt-2"><p className="text-xs font-semibold text-slate-500">To,</p></div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase">Organization Name</label>
                  {isEditing && authUser?.role !== "User" ? (
                    <Input value={currentRequisition.organizationName} onChange={(e) => setCurrentRequisition({ ...currentRequisition, organizationName: e.target.value })} className="mt-1" />
                  ) : (
                    <p className="text-sm mt-1 font-bold">{currentRequisition.organizationName}</p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase">Department</label>
                  {isEditing && authUser?.role !== "User" ? (
                    <Input value={currentRequisition.department} onChange={(e) => setCurrentRequisition({ ...currentRequisition, department: e.target.value })} className="mt-1" />
                  ) : (
                    <p className="text-sm mt-1">{currentRequisition.department}</p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase">Address</label>
                  {isEditing && authUser?.role !== "User" ? (
                    <Textarea value={currentRequisition.address} onChange={(e) => setCurrentRequisition({ ...currentRequisition, address: e.target.value })} className="mt-1" rows={2} />
                  ) : (
                    <p className="text-xs mt-1 text-slate-600">{currentRequisition.address}</p>
                  )}
                </div>
              </div>

              {/* Right Column - Applicant Table */}
              <div className="border border-slate-300 rounded-md overflow-hidden">
                <table className="w-full text-sm">
                  <tbody>
                    <tr className="border-b border-slate-200">
                      <td className="p-2 bg-slate-100 font-semibold text-xs w-[40%]">Applicant Name</td>
                      <td className="p-2">
                        {isEditing ? (
                          <Input value={currentRequisition.applicantName} onChange={(e) => setCurrentRequisition({ ...currentRequisition, applicantName: e.target.value })} className="h-7 text-sm" />
                        ) : (
                          <span>{currentRequisition.applicantName}</span>
                        )}
                      </td>
                    </tr>
                    {/* Applicant Department - DROPDOWN */}
                    <tr className="border-b border-slate-200">
                      <td className="p-2 bg-slate-100 font-semibold text-xs">Applicant Department</td>
                      <td className="p-2">
                        {isEditing ? (
                          <DropdownWithManage
                            label="Department"
                            type="department"
                            value={currentRequisition.applicantDepartment}
                            onChange={(val) => setCurrentRequisition({ ...currentRequisition, applicantDepartment: val })}
                            disabled={!isEditing}
                            isAdmin={authUser?.role === "Admin"}
                          />
                        ) : (
                          <span>{currentRequisition.applicantDepartment}</span>
                        )}
                      </td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="p-2 bg-slate-100 font-semibold text-xs">Employee ID</td>
                      <td className="p-2">
                        {isEditing ? (
                          <Input value={currentRequisition.employeeId} onChange={(e) => setCurrentRequisition({ ...currentRequisition, employeeId: e.target.value })} className="h-7 text-sm font-mono" />
                        ) : (
                          <span className="font-mono">{currentRequisition.employeeId}</span>
                        )}
                      </td>
                    </tr>
                    {/* Branch Name - DROPDOWN */}
                    <tr className="border-b border-slate-200">
                      <td className="p-2 bg-slate-100 font-semibold text-xs">Branch Name</td>
                      <td className="p-2">
                        {isEditing ? (
                          <DropdownWithManage
                            label="Branch"
                            type="branch"
                            value={currentRequisition.branchName}
                            onChange={(val) => setCurrentRequisition({ ...currentRequisition, branchName: val })}
                            disabled={!isEditing}
                            isAdmin={authUser?.role === "Admin"}
                          />
                        ) : (
                          <span>{currentRequisition.branchName}</span>
                        )}
                      </td>
                    </tr>
                    {/* Address - DROPDOWN */}
                    <tr className="border-b border-slate-200">
                      <td className="p-2 bg-slate-100 font-semibold text-xs">Address</td>
                      <td className="p-2">
                        {isEditing ? (
                          <DropdownWithManage
                            label="Address"
                            type="address"
                            value={currentRequisition.applicantAddress}
                            onChange={(val) => setCurrentRequisition({ ...currentRequisition, applicantAddress: val })}
                            disabled={!isEditing}
                            isAdmin={authUser?.role === "Admin"}
                          />
                        ) : (
                          <span>{currentRequisition.applicantAddress}</span>
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2 bg-slate-100 font-semibold text-xs">Contact</td>
                      <td className="p-2">
                        {isEditing ? (
                          <Input value={currentRequisition.contact} onChange={(e) => setCurrentRequisition({ ...currentRequisition, contact: e.target.value })} className="h-7 text-sm" />
                        ) : (
                          <span>{currentRequisition.contact}</span>
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Category Selection Bar */}
            <div className="border border-slate-300 rounded-md p-3 mb-6 bg-slate-50">
              <div className="flex flex-wrap gap-4 items-center">
                {CATEGORIES.map((cat) => (
                  <label key={cat} className="flex items-center gap-2 text-sm cursor-pointer">
                    <Checkbox checked={currentRequisition.category === cat} onCheckedChange={() => isEditing && setCurrentRequisition({ ...currentRequisition, category: cat })} disabled={!isEditing} />
                    <span className={currentRequisition.category === cat ? "font-semibold" : ""}>{cat}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Equipment Table */}
            <div className="border border-slate-400 rounded-md overflow-hidden mb-6">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-200 border-b border-slate-400">
                    <th className="p-2 text-center font-bold text-xs w-[50px]">SL</th>
                    <th className="p-2 text-center font-bold text-xs w-[50px]">Select</th>
                    <th className="p-2 text-left font-bold text-xs">EQUIPMENT NAME</th>
                    <th className="p-2 text-left font-bold text-xs">DESCRIPTION</th>
                    <th className="p-2 text-center font-bold text-xs w-[60px]">QTY</th>
                    <th className="p-2 text-center font-bold text-xs w-[100px]">CONDITION</th>
                    <th className="p-2 text-right font-bold text-xs w-[110px]">APPROX PRICE</th>
                    {isEditing && <th className="p-2 text-center font-bold text-xs w-[40px]"></th>}
                  </tr>
                </thead>
                <tbody>
                  {currentRequisition.items.map((item, index) => (
                    <tr key={index} className={`border-b border-slate-200 ${index % 2 === 0 ? "bg-white" : "bg-slate-50"} ${item.selected ? "font-bold bg-blue-50" : ""}`}>
                      <td className="p-2 text-center text-xs font-medium">{item.sl}</td>
                      <td className="p-2 text-center"><Checkbox checked={item.selected} onCheckedChange={(checked) => updateItem(index, "selected", !!checked)} /></td>
                      <td className="p-2">{isEditing ? <Input value={item.equipmentName} onChange={(e) => updateItem(index, "equipmentName", e.target.value)} className="h-7 text-xs" /> : <span className="text-xs">{item.equipmentName || "-"}</span>}</td>
                      <td className="p-2">{isEditing ? <Input value={item.description} onChange={(e) => updateItem(index, "description", e.target.value)} className="h-7 text-xs" placeholder="—" /> : <span className="text-xs">{item.description || "—"}</span>}</td>
                      <td className="p-2">{isEditing ? <Input type="number" value={item.qty || ""} onChange={(e) => updateItem(index, "qty", parseInt(e.target.value) || 0)} className="h-7 text-xs text-center" min={0} /> : <span className="text-xs text-center block">{item.qty || "—"}</span>}</td>
                      <td className="p-2">
                        {isEditing ? (
                          <Select value={item.condition} onValueChange={(val) => updateItem(index, "condition", val)}>
                            <SelectTrigger className="h-7 text-xs"><SelectValue placeholder="—" /></SelectTrigger>
                            <SelectContent>{CONDITIONS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                          </Select>
                        ) : (
                          <span className="text-xs block text-center">{item.condition || "—"}</span>
                        )}
                      </td>
                      <td className="p-2">{isEditing ? <Input type="number" value={item.approxPrice || ""} onChange={(e) => updateItem(index, "approxPrice", parseFloat(e.target.value) || 0)} className="h-7 text-xs text-right" min={0} /> : <span className="text-xs block text-right">{item.approxPrice ? `৳${item.approxPrice.toLocaleString()}` : "—"}</span>}</td>
                      {isEditing && (
                        <td className="p-1 text-center"><Button variant="ghost" size="sm" onClick={() => removeRow(index)} className="h-6 w-6 p-0 text-red-400 hover:text-red-600"><X className="w-3 h-3" /></Button></td>
                      )}
                    </tr>
                  ))}
                  <tr className="bg-indigo-100 border-t-2 border-slate-400">
                    <td colSpan={isEditing ? 6 : 5} className="p-2 text-right font-bold text-sm pr-4">Total Amount:</td>
                    <td className="p-2 text-right font-bold text-sm">৳{currentRequisition.totalAmount.toLocaleString()}</td>
                    {isEditing && <td></td>}
                  </tr>
                </tbody>
              </table>
            </div>

            {isEditing && (
              <div className="mb-6"><Button variant="outline" size="sm" onClick={addRow} className="gap-1 text-xs"><Plus className="w-3 h-3" /> Add Row</Button></div>
            )}

            {/* Reason */}
            <div className="mb-8">
              <h3 className="text-sm font-bold text-slate-700 mb-2">PLEASE WRITE A REASON :</h3>
              {isEditing ? (
                <Textarea value={currentRequisition.reason} onChange={(e) => setCurrentRequisition({ ...currentRequisition, reason: e.target.value })} className="min-h-[80px]" placeholder="Write your reason here..." />
              ) : (
                <div className="border border-slate-300 rounded-md p-3 bg-slate-50 min-h-[60px] text-sm">{currentRequisition.reason || "—"}</div>
              )}
            </div>

            {/* Status */}
            {editId && (
              <div className="mb-8">
                <label className="text-xs font-semibold text-slate-500 uppercase">Status</label>
                {isEditing && (authUser?.role === "Admin" || authUser?.role === "User") ? (
                  <Select value={currentRequisition.status} onValueChange={(val) => setCurrentRequisition({ ...currentRequisition, status: val })}>
                    <SelectTrigger className="mt-1 w-[200px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Draft">Draft</SelectItem>
                      <SelectItem value="Submitted">Submitted</SelectItem>
                      {authUser?.role === "Admin" && (
                        <>
                          <SelectItem value="Approved">Approved</SelectItem>
                          <SelectItem value="Rejected">Rejected</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="mt-1"><span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(currentRequisition.status)}`}>{currentRequisition.status}</span></div>
                )}
              </div>
            )}

            {/* Signatures */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">
              {["Applicant", "Manager / In-Charge", "Recommend by", "Authority"].map((role) => (
                <div key={role} className="text-center">
                  <div className="border-t-2 border-dashed border-slate-400 mt-16 pt-2"><p className="text-xs font-semibold text-slate-600">{role}</p></div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
