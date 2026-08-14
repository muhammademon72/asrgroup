"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  Loader2,
  Users,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  phone: string;
  employeeId: string;
  department: string;
  branch: string;
  role: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

const ROLES = ["Admin", "Manager", "User"];
const STATUSES = ["Active", "Inactive", "Suspended"];
const DEPARTMENTS = [
  "Information Technology",
  "Accounts & Finance",
  "Human Resource",
  "Marketing",
  "Operations",
  "Procurement",
  "Administration",
  "Internal Audit",
  "Legal & Compliance",
  "Business Development",
];
const BRANCHES = [
  "Head Office",
  "Dhanmondi Branch",
  "Gulshan Branch",
  "Uttara Branch",
  "Chittagong Branch",
  "Sylhet Branch",
  "Rajshahi Branch",
  "Khulna Branch",
];

const emptyUser = (): User => ({
  id: "",
  name: "",
  email: "",
  password: "123456",
  phone: "",
  employeeId: "",
  department: "",
  branch: "",
  role: "User",
  status: "Active",
  createdAt: "",
  updatedAt: "",
});

export default function UserManagement() {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [loading, setLoading] = useState(false);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User>(emptyUser());

  // Delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.set("search", searchTerm);
      if (filterRole !== "All") params.set("role", filterRole);
      if (filterStatus !== "All") params.set("status", filterStatus);
      const res = await fetch(`/api/users?${params.toString()}`);
      const data = await res.json();
      setUsers(data);
    } catch {
      toast({ title: "Error", description: "Failed to load users", variant: "destructive" });
    }
  };

  useEffect(() => { fetchUsers(); }, [searchTerm, filterRole, filterStatus]);

  const handleNew = () => {
    setCurrentUser(emptyUser());
    setEditId(null);
    setShowForm(true);
  };

  const handleEdit = (user: User) => {
    setCurrentUser({ ...user });
    setEditId(user.id);
    setShowForm(true);
  };

  const handleView = (user: User) => {
    setCurrentUser({ ...user });
    setEditId(user.id);
    setShowForm(false);
  };

  const handleSave = async () => {
    if (!currentUser.name.trim() || !currentUser.email.trim()) {
      toast({ title: "Validation", description: "Name and Email are required", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      if (editId) {
        await fetch(`/api/users/${editId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(currentUser),
        });
        toast({ title: "Success", description: "User updated successfully" });
      } else {
        await fetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(currentUser),
        });
        toast({ title: "Success", description: "User created successfully" });
      }
      setShowForm(false);
      setEditId(null);
      fetchUsers();
    } catch {
      toast({ title: "Error", description: "Failed to save user", variant: "destructive" });
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setLoading(true);
    try {
      await fetch(`/api/users/${deleteId}`, { method: "DELETE" });
      toast({ title: "Success", description: "User deleted successfully" });
      setDeleteDialogOpen(false);
      setDeleteId(null);
      fetchUsers();
    } catch {
      toast({ title: "Error", description: "Failed to delete user", variant: "destructive" });
    }
    setLoading(false);
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      Active: "bg-green-100 text-green-800 border-green-300",
      Inactive: "bg-yellow-100 text-yellow-800 border-yellow-300",
      Suspended: "bg-red-100 text-red-800 border-red-300",
    };
    return colors[status] || "bg-slate-100 text-slate-800 border-slate-300";
  };

  const getRoleBadge = (role: string) => {
    const colors: Record<string, string> = {
      Admin: "bg-purple-100 text-purple-800 border-purple-300",
      Manager: "bg-blue-100 text-blue-800 border-blue-300",
      User: "bg-slate-100 text-slate-800 border-slate-300",
    };
    return colors[role] || "bg-slate-100 text-slate-800 border-slate-300";
  };

  // =================== FORM VIEW ===================
  if (editId !== null || showForm) {
    const isEditing = showForm;
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="bg-white border-b shadow-sm">
          <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => { setShowForm(false); setEditId(null); }} className="gap-1">
                <X className="w-4 h-4" /> Back
              </Button>
              <h2 className="text-sm font-semibold text-slate-700">
                {isEditing ? (editId ? "Edit User" : "New User") : "View User"}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              {isEditing && (
                <Button onClick={handleSave} disabled={loading} className="bg-slate-800 hover:bg-slate-700 gap-2">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Save
                </Button>
              )}
              {!isEditing && editId && (
                <Button onClick={() => { setEditId(currentUser.id); setShowForm(true); }} className="gap-2 bg-blue-600 hover:bg-blue-500">
                  <Edit3 className="w-4 h-4" /> Edit
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 py-6">
          <Card className="shadow-md border-slate-300">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-slate-800">User Information</h1>
                  <p className="text-xs text-slate-500">Fill in the user details below</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name */}
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase">Full Name *</label>
                  {isEditing ? (
                    <Input value={currentUser.name} onChange={(e) => setCurrentUser({ ...currentUser, name: e.target.value })} className="mt-1" placeholder="Enter full name" />
                  ) : (
                    <p className="mt-1 text-sm font-medium text-slate-800">{currentUser.name}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase">Email *</label>
                  {isEditing ? (
                    <Input type="email" value={currentUser.email} onChange={(e) => setCurrentUser({ ...currentUser, email: e.target.value })} className="mt-1" placeholder="Enter email address" />
                  ) : (
                    <p className="mt-1 text-sm font-medium text-slate-800">{currentUser.email}</p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase">Password</label>
                  {isEditing ? (
                    <Input type="text" value={currentUser.password} onChange={(e) => setCurrentUser({ ...currentUser, password: e.target.value })} className="mt-1" placeholder="Enter password (default: 123456)" />
                  ) : (
                    <p className="mt-1 text-sm text-slate-800">••••••</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase">Phone</label>
                  {isEditing ? (
                    <Input value={currentUser.phone} onChange={(e) => setCurrentUser({ ...currentUser, phone: e.target.value })} className="mt-1" placeholder="Enter phone number" />
                  ) : (
                    <p className="mt-1 text-sm text-slate-800">{currentUser.phone || "—"}</p>
                  )}
                </div>

                {/* Employee ID */}
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase">Employee ID</label>
                  {isEditing ? (
                    <Input value={currentUser.employeeId} onChange={(e) => setCurrentUser({ ...currentUser, employeeId: e.target.value })} className="mt-1" placeholder="Enter employee ID" />
                  ) : (
                    <p className="mt-1 text-sm font-mono text-slate-800">{currentUser.employeeId || "—"}</p>
                  )}
                </div>

                {/* Department */}
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase">Department</label>
                  {isEditing ? (
                    <Select value={currentUser.department} onValueChange={(val) => setCurrentUser({ ...currentUser, department: val })}>
                      <SelectTrigger className="mt-1"><SelectValue placeholder="Select department" /></SelectTrigger>
                      <SelectContent>
                        {DEPARTMENTS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="mt-1 text-sm text-slate-800">{currentUser.department || "—"}</p>
                  )}
                </div>

                {/* Branch */}
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase">Branch</label>
                  {isEditing ? (
                    <Select value={currentUser.branch} onValueChange={(val) => setCurrentUser({ ...currentUser, branch: val })}>
                      <SelectTrigger className="mt-1"><SelectValue placeholder="Select branch" /></SelectTrigger>
                      <SelectContent>
                        {BRANCHES.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="mt-1 text-sm text-slate-800">{currentUser.branch || "—"}</p>
                  )}
                </div>

                {/* Role */}
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase">Role</label>
                  {isEditing ? (
                    <Select value={currentUser.role} onValueChange={(val) => setCurrentUser({ ...currentUser, role: val })}>
                      <SelectTrigger className="mt-1"><SelectValue placeholder="Select role" /></SelectTrigger>
                      <SelectContent>
                        {ROLES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="mt-1"><span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold border ${getRoleBadge(currentUser.role)}`}>{currentUser.role}</span></div>
                  )}
                </div>

                {/* Status */}
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase">Status</label>
                  {isEditing ? (
                    <Select value={currentUser.status} onValueChange={(val) => setCurrentUser({ ...currentUser, status: val })}>
                      <SelectTrigger className="mt-1"><SelectValue placeholder="Select status" /></SelectTrigger>
                      <SelectContent>
                        {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="mt-1"><span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(currentUser.status)}`}>{currentUser.status}</span></div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // =================== LIST VIEW ===================
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input placeholder="Search by name, email, employee ID..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
          </div>
          <Select value={filterRole} onValueChange={setFilterRole}>
            <SelectTrigger className="w-[130px]"><SelectValue placeholder="Role" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Roles</SelectItem>
              {ROLES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[130px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Status</SelectItem>
              {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleNew} className="bg-slate-800 hover:bg-slate-700 gap-2">
          <Plus className="w-4 h-4" /> Add New User
        </Button>
      </div>

      <span className="text-sm text-slate-500">{users.length} registered user(s)</span>

      {users.length === 0 ? (
        <Card className="text-center py-16">
          <CardContent>
            <Users className="w-16 h-16 mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-semibold text-slate-600 mb-2">No Users Found</h3>
            <p className="text-sm text-slate-400 mb-4">Add your first user to get started</p>
            <Button onClick={handleNew} className="bg-slate-800 hover:bg-slate-700 gap-2"><Plus className="w-4 h-4" /> Add User</Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-slate-50">
                  <th className="text-left p-3 text-xs font-semibold text-slate-600">SL</th>
                  <th className="text-left p-3 text-xs font-semibold text-slate-600">Name</th>
                  <th className="text-left p-3 text-xs font-semibold text-slate-600">Email</th>
                  <th className="text-left p-3 text-xs font-semibold text-slate-600">Employee ID</th>
                  <th className="text-left p-3 text-xs font-semibold text-slate-600">Department</th>
                  <th className="text-left p-3 text-xs font-semibold text-slate-600">Role</th>
                  <th className="text-left p-3 text-xs font-semibold text-slate-600">Status</th>
                  <th className="text-center p-3 text-xs font-semibold text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, idx) => (
                  <tr key={user.id} className="border-b hover:bg-slate-50 transition-colors">
                    <td className="p-3 text-sm">{idx + 1}</td>
                    <td className="p-3 text-sm font-medium">{user.name}</td>
                    <td className="p-3 text-sm text-slate-600">{user.email}</td>
                    <td className="p-3 text-sm font-mono">{user.employeeId || "—"}</td>
                    <td className="p-3 text-sm">{user.department || "—"}</td>
                    <td className="p-3">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold border ${getRoleBadge(user.role)}`}>{user.role}</span>
                    </td>
                    <td className="p-3">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(user.status)}`}>{user.status}</span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center justify-center gap-1">
                        <Button variant="ghost" size="sm" onClick={() => handleView(user)} title="View" className="h-8 w-8 p-0"><Users className="w-4 h-4 text-slate-600" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(user)} title="Edit" className="h-8 w-8 p-0"><Edit3 className="w-4 h-4 text-blue-600" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => { setDeleteId(user.id); setDeleteDialogOpen(true); }} title="Delete" className="h-8 w-8 p-0"><Trash2 className="w-4 h-4 text-red-500" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete User</DialogTitle><DialogDescription>Are you sure you want to delete this user? This action cannot be undone.</DialogDescription></DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={loading}>{loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
