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
                Esther AI
              </Link>
            </div>
            </SidebarSection>
          </SidebarHeader>
          <SidebarBody>
            
            <SidebarSection>
              <SidebarItem>
                <Link href="/">Home</Link>
              </SidebarItem>
              <SidebarItem>
                <Link href="/jobs">Jobs</Link>
              </SidebarItem>
              <SidebarItem>
                <Link href="/admin/prompts">Prompts</Link>
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
