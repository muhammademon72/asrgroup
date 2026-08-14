"use client";

import React, { useState } from "react";
import { Loader2, Eye, EyeOff, LogIn, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

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
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

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
    if (!name.trim() || !email.trim() || !password.trim()) {
      toast({ title: "Validation", description: "Name, email and password are required", variant: "destructive" });
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
        body: JSON.stringify({ name: name.trim(), email: email.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: "Sign Up Failed", description: data.error || "Could not create account", variant: "destructive" });
        return;
      }
      toast({ title: "Account Created!", description: "You can now sign in with your credentials" });
      setMode("login");
      setPassword("");
      setConfirmPassword("");
    } catch {
      toast({ title: "Error", description: "Connection failed. Please try again.", variant: "destructive" });
    }
    setLoading(false);
  };

  const switchMode = () => {
    setMode(mode === "login" ? "signup" : "login");
    setPassword("");
    setConfirmPassword("");
    setShowPassword(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto mb-4 shadow-lg">
            {mode === "login" ? <LogIn className="w-8 h-8 text-white" /> : <UserPlus className="w-8 h-8 text-white" />}
          </div>
          <h1 className="text-2xl font-bold text-slate-800">ASR GROUP</h1>
          <p className="text-sm text-slate-500 mt-1">Equipment Requisition System</p>
        </div>

        {/* Card */}
        <Card className="shadow-xl border-slate-200">
          <CardContent className="p-8">
            {mode === "login" ? (
              <>
                <h2 className="text-lg font-semibold text-slate-700 mb-1">Sign In</h2>
                <p className="text-sm text-slate-400 mb-6">Enter your credentials to access the system</p>

                <form onSubmit={handleLogin} className="space-y-5">
                  <div>
                    <label className="text-sm font-medium text-slate-600 mb-1.5 block">Email Address</label>
                    <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@asrgroup.com" className="h-11" autoComplete="email" autoFocus />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600 mb-1.5 block">Password</label>
                    <div className="relative">
                      <Input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password" className="h-11 pr-10" autoComplete="current-password" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <Button type="submit" disabled={loading} className="w-full h-11 bg-slate-800 hover:bg-slate-700 text-base font-medium gap-2">
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

                {/* Default credentials hint */}
                <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-xs text-slate-500 font-medium mb-1">Default Credentials:</p>
                  <p className="text-xs text-slate-600">Email: <span className="font-mono font-medium">admin@asrgroup.com</span></p>
                  <p className="text-xs text-slate-600">Password: <span className="font-mono font-medium">123456</span></p>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-lg font-semibold text-slate-700 mb-1">Sign Up</h2>
                <p className="text-sm text-slate-400 mb-6">Create a new account to access the system</p>

                <form onSubmit={handleSignUp} className="space-y-5">
                  {/* Name */}
                  <div>
                    <label className="text-sm font-medium text-slate-600 mb-1.5 block">Full Name *</label>
                    <Input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your full name" className="h-11" autoFocus />
                  </div>
                  {/* Email */}
                  <div>
                    <label className="text-sm font-medium text-slate-600 mb-1.5 block">Email Address *</label>
                    <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" className="h-11" autoComplete="email" />
                  </div>
                  {/* Password */}
                  <div>
                    <label className="text-sm font-medium text-slate-600 mb-1.5 block">Password *</label>
                    <div className="relative">
                      <Input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Create a password" className="h-11 pr-10" autoComplete="new-password" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  {/* Confirm Password */}
                  <div>
                    <label className="text-sm font-medium text-slate-600 mb-1.5 block">Confirm Password *</label>
                    <Input type={showPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm your password" className="h-11" autoComplete="new-password" />
                  </div>
                  <Button type="submit" disabled={loading} className="w-full h-11 bg-slate-800 hover:bg-slate-700 text-base font-medium gap-2">
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
