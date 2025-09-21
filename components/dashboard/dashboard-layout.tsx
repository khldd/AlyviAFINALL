"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import {
  Building2,
  Users,
  FileText,
  CreditCard,
  BarChart3,
  Settings,
  Menu,
  Bell,
  Search,
  LogOut,
  User,
  Shield,
  Brain,
} from "lucide-react"

interface DashboardLayoutProps {
  children: React.ReactNode
}

const navigationItems = [
  {
    name: "Vue d'ensemble",
    href: "/",
    icon: BarChart3,
    current: true,
    roles: ["super_admin", "hr_manager", "employee"], // All roles can access dashboard
  },
  {
    name: "Entreprises",
    href: "/companies",
    icon: Building2,
    current: false,
    roles: ["super_admin", "hr_manager"], // Super admin sees all, HR manager sees assigned
  },
  {
    name: "Employés",
    href: "/employees",
    icon: Users,
    current: false,
    roles: ["super_admin", "hr_manager", "employee"], // All roles but different scopes
  },
  {
    name: "Paie",
    href: "/payroll",
    icon: CreditCard,
    current: false,
    roles: ["super_admin", "hr_manager"], // Only admins and HR can access payroll
  },
  {
    name: "Documents",
    href: "/documents",
    icon: FileText,
    current: false,
    roles: ["super_admin", "hr_manager", "employee"], // All roles but different scopes
  },
  {
    name: "ScanPaie IA",
    href: "/scanpaie",
    icon: Brain,
    current: false,
    roles: ["super_admin"], // Only super admin can access ScanPaie
  },
  {
    name: "Audit",
    href: "/audit",
    icon: Shield,
    current: false,
    roles: ["super_admin"], // Only super admin can access audit logs
  },
  {
    name: "Paramètres",
    href: "/settings",
    icon: Settings,
    current: false,
    roles: ["super_admin", "hr_manager", "employee"], // All roles can access settings
  },
]

function Sidebar({ className }: { className?: string }) {
  const { userProfile } = useAuth()

  return (
    <div className={`flex flex-col h-full bg-sidebar border-r border-sidebar-border ${className}`}>
      {/* Logo */}
      <div className="flex items-center gap-2 px-6 py-4 border-b border-sidebar-border">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
          <Building2 className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-sidebar-foreground">AlyviaHR</h1>
          <p className="text-xs text-muted-foreground">{userProfile?.company?.name || "Chargement..."}</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1">
        {navigationItems.map((item) => {
          if (!item.roles.includes(userProfile?.role || "")) {
            return null
          }

          return (
            <a
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${
                item.current
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50"
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </a>
          )
        })}
      </nav>

      {/* User info */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3">
          <Avatar className="w-8 h-8">
            <AvatarImage src={userProfile?.avatar_url || "/placeholder.svg"} alt={userProfile?.first_name} />
            <AvatarFallback>
              {userProfile?.first_name?.[0]}
              {userProfile?.last_name?.[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">
              {userProfile?.first_name} {userProfile?.last_name}
            </p>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {userProfile?.role === "hr_manager"
                  ? "RH Manager"
                  : userProfile?.role === "super_admin"
                    ? "Super Admin"
                    : "Employé"}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { userProfile, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
    window.location.href = "/auth/login"
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col">
        <Sidebar />
      </div>

      {/* Mobile sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="p-0 w-64">
          <Sidebar />
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top header */}
        <header className="bg-card border-b border-border px-4 py-3 lg:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="lg:hidden">
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
              </Sheet>

              <div className="hidden md:flex items-center gap-2 bg-background border border-border rounded-lg px-3 py-2 w-96">
                <Search className="w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Rechercher un employé, document..."
                  className="flex-1 bg-transparent border-0 outline-none text-sm placeholder:text-muted-foreground"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-destructive rounded-full"></span>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 px-2">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={userProfile?.avatar_url || "/placeholder.svg"} alt={userProfile?.first_name} />
                      <AvatarFallback>
                        {userProfile?.first_name?.[0]}
                        {userProfile?.last_name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden md:block text-left">
                      <p className="text-sm font-medium">
                        {userProfile?.first_name} {userProfile?.last_name}
                      </p>
                      <p className="text-xs text-muted-foreground">{userProfile?.email}</p>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="w-4 h-4 mr-2" />
                    Profil
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="w-4 h-4 mr-2" />
                    Paramètres
                  </DropdownMenuItem>
                  {userProfile?.role === "super_admin" && (
                    <DropdownMenuItem>
                      <Shield className="w-4 h-4 mr-2" />
                      Administration
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive" onClick={handleSignOut}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Déconnexion
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  )
}
