// components/AppShell.tsx
"use client";

import Link from "next/link";
import { SidebarLayout } from "@/components/sidebar-layout";

import { Navbar } from "@/components/navbar";
import {
  Sidebar,
  SidebarBody,
  SidebarFooter,
  SidebarHeader,
  SidebarItem,
  SidebarLabel,
  SidebarSection,
  SidebarSpacer,
} from '@/components/sidebar'

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarLayout
      navbar={<Navbar />}
      sidebar={
        <Sidebar>
           <SidebarHeader>
            <SidebarSection>
              <div className="mb-2 ml-2 mt-2 flex">
              <Link href="/" aria-label="Home">
                Ester AI
              </Link>
            </div>
            </SidebarSection>
          </SidebarHeader>
          <SidebarBody>
            <SidebarSection>
              <SidebarItem href="/">
                Home
              </SidebarItem>
              <SidebarItem href="/jobs">
                Jobs
              </SidebarItem>
              <SidebarItem href="/prompts">
                Prompts
              </SidebarItem>
            </SidebarSection>
          </SidebarBody>
        </Sidebar>
      }
    >
      {children}
    </SidebarLayout>
  );
}
