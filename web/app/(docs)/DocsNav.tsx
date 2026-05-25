"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const PAGES = [
  { href: "/architecture", title: "Architecture" },
  { href: "/methodology", title: "Methodology" },
  { href: "/security", title: "Security" },
  { href: "/user-guide", title: "User guide" },
  { href: "/sustainability", title: "Sustainability" },
];

export default function DocsNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Documentation sections"
      className="flex gap-1 overflow-x-auto -mx-1 px-1"
    >
      {PAGES.map((page) => {
        const isActive = pathname === page.href;
        return (
          <Link
            key={page.href}
            href={page.href}
            aria-current={isActive ? "page" : undefined}
            className={`relative px-3 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              isActive
                ? "text-white border-emerald-400"
                : "text-slate-400 border-transparent hover:text-white hover:border-white/[0.16]"
            }`}
          >
            {page.title}
          </Link>
        );
      })}
    </nav>
  );
}
