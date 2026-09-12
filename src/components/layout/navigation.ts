import {
  CalendarDays,
  LayoutDashboard,
  Settings,
  Sparkles,
  UserRound,
  UsersRound,
} from "lucide-react";

export const primaryNavigation = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/bookings", label: "Bookings", icon: Sparkles },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/clients", label: "Clients", icon: UserRound },
  { href: "/team", label: "Team", icon: UsersRound },
  { href: "/services", label: "Services", icon: Sparkles },
] as const;

export const secondaryNavigation = [
  { href: "/settings", label: "Settings", icon: Settings },
] as const;

export const allNavigation = [
  ...primaryNavigation,
  ...secondaryNavigation,
] as const;

export function isActiveRoute(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}
