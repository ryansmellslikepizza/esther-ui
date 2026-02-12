"use client";

import Link from "next/link";
import { Avatar } from '@/components/avatar'
// import { Sidebar, SidebarBody, SidebarFooter, SidebarItem, SidebarLabel, SidebarSection } from '@/components/sidebar'
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { getSessionUser } from "@/lib/session";
import { SidebarLayout } from "@/components/sidebar-layout";
import { Navbar } from "@/components/navbar";
import { useEffect, useState } from "react";
import {
  Sidebar,
  SidebarBody,
  SidebarHeader,
  SidebarItem,
  SidebarSection,
  SidebarLabel,
  SidebarFooter,
  SidebarHeading,
} from "@/components/sidebar";

import {
  ArrowRightStartOnRectangleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  Cog8ToothIcon,
  LightBulbIcon,
  PlusIcon,
  ShieldCheckIcon,
  UserIcon,
  Cog6ToothIcon,
  HomeIcon,
  RectangleGroupIcon,
  SparklesIcon,
} from '@heroicons/react/16/solid'

export default function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  
  async function handleLogout() {
    try {
      await api.post("/api/logout");
      router.replace("/login");
    } catch (e) {
      console.error("Logout failed", e);
    }
  }

  useEffect(() => {
    const u = getSessionUser();
    setIsAdmin(!!u?.isAdmin);
  }, []);

  return (
    <SidebarLayout
      navbar={<Navbar />}
      sidebar={
        <Sidebar>
          <SidebarHeader>
            <SidebarSection>
              <div className="mb-2 ml-2 mt-2 flex">
                <Link href="/">Ester Dashboard</Link>
              </div>
            </SidebarSection>
          </SidebarHeader>
          <SidebarBody>
            <SidebarSection>
              
              <SidebarItem href="/">
                <HomeIcon />
                <SidebarLabel>Home</SidebarLabel>
              </SidebarItem>
              <SidebarItem href="/jobs">
                <RectangleGroupIcon />
                <SidebarLabel>Jobs</SidebarLabel>
              </SidebarItem>
              <SidebarItem href="/prompts">
                <SparklesIcon />
                <SidebarLabel>Prompts</SidebarLabel>
              </SidebarItem>
            </SidebarSection>

            <SidebarSection>
              <SidebarHeading>User Account</SidebarHeading>
              <SidebarItem className="pointer" href="/user/settings">
                <Cog6ToothIcon />
                <SidebarLabel>Settings</SidebarLabel>
              </SidebarItem>
              <SidebarItem className="pointer" href="#" onClick={handleLogout}>
                <ArrowRightStartOnRectangleIcon />
                <SidebarLabel>Logout</SidebarLabel>
              </SidebarItem>
          </SidebarSection>
          </SidebarBody>

          <SidebarFooter className="pb-10 hide">
            <SidebarSection>
              <SidebarItem className="pointer" href="/user/settings">
                <Cog6ToothIcon />
                <SidebarLabel>Settings</SidebarLabel>
              </SidebarItem>
              <SidebarItem className="pointer" href="#" onClick={handleLogout}>
                <ArrowRightStartOnRectangleIcon />
                <SidebarLabel>Sign Out</SidebarLabel>
              </SidebarItem>
            </SidebarSection>
          </SidebarFooter>
      </Sidebar>
      }
    >
      {children}
    </SidebarLayout>
  );
}
