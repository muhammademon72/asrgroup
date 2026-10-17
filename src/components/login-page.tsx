"use client";

import React, { useEffect, useState } from "react";
import { Loader2, Eye, EyeOff, LogIn, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

// Fallback lists — used only when the DB has no options yet.
// Admin manages the real lists via the Department / Branch tabs.
const DEFAULT_BRANCHES = [
  "Head Office",
  "Dhanmondi Branch",
  "Gulshan Branch",
  "Uttara Branch",
  "Chittagong Branch",
  "Sylhet Branch",
  "Rajshahi Branch",
  "Khulna Branch",
];
const DEFAULT_DEPARTMENTS = [
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

interface LoginUser {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  branch: string;
  employeeId: string;
  status: string;
}

interface LoginPageProps {
  onLogin: (user: LoginUser) => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const { toast } = useToast();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [branch, setBranch] = useState("");
  const [department, setDepartment] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Dropdown options loaded from DB (admin-managed via Department / Branch tabs)
  const [branchOptions, setBranchOptions] = useState<string[]>(DEFAULT_BRANCHES);
  const [departmentOptions, setDepartmentOptions] = useState<string[]>(DEFAULT_DEPARTMENTS);

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [branchRes, deptRes] = await Promise.all([
          fetch("/api/dropdown-options?type=branch"),
          fetch("/api/dropdown-options?type=department"),
        ]);
        if (branchRes.ok) {
          const branches: { id: string; value: string }[] = await branchRes.json();
          if (Array.isArray(branches) && branches.length > 0) setBranchOptions(branches.map((b) => b.value));
        }
        if (deptRes.ok) {
          const depts: { id: string; value: string }[] = await deptRes.json();
          if (Array.isArray(depts) && depts.length > 0) setDepartmentOptions(depts.map((d) => d.value));
        }
      } catch { /* keep defaults */ }
    };
    loadOptions();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast({ title: "Validation", description: "Please enter email and password", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: "Login Failed", description: data.error || "Invalid credentials", variant: "destructive" });
        return;
      }
      toast({ title: "Welcome!", description: `Logged in as ${data.user.name}` });
      onLogin(data.user);
    } catch {
      toast({ title: "Error", description: "Connection failed. Please try again.", variant: "destructive" });
    }
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !branch.trim() || !department.trim() || !employeeId.trim() || !email.trim() || !password.trim()) {
      toast({ title: "Validation", description: "All fields are required", variant: "destructive" });
      return;
    }
    if (password.length < 4) {
      toast({ title: "Validation", description: "Password must be at least 4 characters", variant: "destructive" });
      return;
    }
    if (password !== confirmPassword) {
      toast({ title: "Validation", description: "Passwords do not match", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), branch: branch.trim(), department: department.trim(), employeeId: employeeId.trim(), email: email.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: "Sign Up Failed", description: data.error || "Could not create account", variant: "destructive" });
        return;
      }
      toast({ title: "Account Created!", description: "You can now sign in with your credentials" });
      setMode("login");
      setName("");
      setBranch("");
      setDepartment("");
      setEmployeeId("");
      setPassword("");
      setConfirmPassword("");
    } catch {
      toast({ title: "Error", description: "Connection failed. Please try again.", variant: "destructive" });
    }
    setLoading(false);
  };

  const switchMode = () => {
    setMode(mode === "login" ? "signup" : "login");
    setName("");
    setBranch("");
    setDepartment("");
    setEmployeeId("");
    setPassword("");
    setConfirmPassword("");
    setShowPassword(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className={`w-full ${mode === "signup" ? "max-w-lg" : "max-w-sm"}`}>
        {/* Card */}
        <Card className="shadow-xl border-slate-200">
          <CardContent className="p-6">
            {/* Brand header inside card */}
            <div className="text-center mb-5">
              <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto mb-2 shadow-lg">
                {mode === "login" ? <LogIn className="w-7 h-7 text-white" /> : <UserPlus className="w-7 h-7 text-white" />}
              </div>
              <h1 className="text-xl font-bold text-slate-800">ASR GROUP</h1>
              <p className="text-xs text-slate-500 mt-1">Equipment Requisition System</p>
            </div>
            {mode === "login" ? (
              <>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-slate-600 mb-1.5 block">Email Address</label>
                    <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@asrgroup.com" className="h-10" autoComplete="email" autoFocus />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600 mb-1.5 block">Password</label>
                    <div className="relative">
                      <Input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password" className="h-10 pr-10" autoComplete="current-password" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <Button type="submit" disabled={loading} className="w-full h-10 bg-slate-800 hover:bg-slate-700 text-base font-medium gap-2">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
                    {loading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>

                {/* Switch to Sign Up */}
                <div className="mt-6 text-center">
                  <p className="text-sm text-slate-500">Don&apos;t have an account?</p>
                  <button onClick={switchMode} className="text-sm font-semibold text-slate-800 hover:text-slate-600 mt-1 inline-flex items-center gap-1">
                    <UserPlus className="w-3.5 h-3.5" /> Sign Up
                  </button>
                </div>

                {/* Default credentials hint - hidden for security */}
              </>
            ) : (
              <>
                <form onSubmit={handleSignUp} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div>
                    <label className="text-sm font-medium text-slate-600 mb-1.5 block">Full Name *</label>
                    <Input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your full name" className="h-10" autoFocus />
                  </div>
                  {/* Branch Name */}
                  <div>
                    <label className="text-sm font-medium text-slate-600 mb-1.5 block">Branch Name *</label>
                    <Select value={branch} onValueChange={setBranch}>
                      <SelectTrigger className="h-10 w-full"><SelectValue placeholder="Select branch" /></SelectTrigger>
                      <SelectContent>
                        {branchOptions.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  {/* Department */}
                  <div>
                    <label className="text-sm font-medium text-slate-600 mb-1.5 block">Department *</label>
                    <Select value={department} onValueChange={setDepartment}>
                      <SelectTrigger className="h-10 w-full"><SelectValue placeholder="Select department" /></SelectTrigger>
                      <SelectContent>
                        {departmentOptions.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  {/* Employee ID */}
                  <div>
                    <label className="text-sm font-medium text-slate-600 mb-1.5 block">Employee ID *</label>
                    <Input type="text" value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} placeholder="Enter your employee ID" className="h-10" />
                  </div>
                  {/* Email */}
                  <div className="sm:col-span-2">
                    <label className="text-sm font-medium text-slate-600 mb-1.5 block">Email Address *</label>
                    <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" className="h-10" autoComplete="email" />
                  </div>
                  {/* Password */}
                  <div>
                    <label className="text-sm font-medium text-slate-600 mb-1.5 block">Password *</label>
                    <div className="relative">
                      <Input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Create a password" className="h-10 pr-10" autoComplete="new-password" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  {/* Confirm Password */}
                  <div>
                    <label className="text-sm font-medium text-slate-600 mb-1.5 block">Confirm Password *</label>
                    <Input type={showPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm your password" className="h-10" autoComplete="new-password" />
                  </div>
                  <Button type="submit" disabled={loading} className="sm:col-span-2 w-full h-10 bg-slate-800 hover:bg-slate-700 text-base font-medium gap-2">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                    {loading ? "Creating account..." : "Sign Up"}
                  </Button>
                </form>

                {/* Switch to Sign In */}
                <div className="mt-6 text-center">
                  <p className="text-sm text-slate-500">Already have an account?</p>
                  <button onClick={switchMode} className="text-sm font-semibold text-slate-800 hover:text-slate-600 mt-1 inline-flex items-center gap-1">
                    <LogIn className="w-3.5 h-3.5" /> Sign In
                  </button>
                </div>

                {/* Info note */}
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-xs text-blue-600">New accounts are created with <span className="font-semibold">User</span> role. Contact an admin to upgrade your role.</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-slate-400 mt-6">
          &copy; 2026 ASR GROUP — Information and Technology Department
        </p>
      </div>
    </div>
  );
}
