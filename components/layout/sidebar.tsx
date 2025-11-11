"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export function Sidebar() {
  const pathname = usePathname()

  const links = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/friends", label: "Friends" },
    { href: "/activity", label: "Activity" },
  ]

  return (
    <aside className="w-64 border-r border-border bg-card min-h-screen">
      <nav className="p-4 space-y-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "block px-4 py-2 rounded-lg transition-colors",
              pathname === link.href
                ? "bg-primary text-primary-foreground font-medium"
                : "text-foreground hover:bg-secondary",
            )}
          >
            {link.href === "/dashboard" && link.label}
            {link.href === "/friends" && link.label}
            {link.href === "/activity" && link.label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
