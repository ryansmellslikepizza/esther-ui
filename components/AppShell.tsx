"use client";

import Link from "next/link";
import { Avatar } from '@/components/avatar'
// import { Sidebar, SidebarBody, SidebarFooter, SidebarItem, SidebarLabel, SidebarSection } from '@/components/sidebar'
import { useRouter, usePathname } from "next/navigation";
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
  SidebarItemUserAccount,
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
  UsersIcon,
} from '@heroicons/react/16/solid'

export default function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [firstName, setFirstName] = useState("");
  const pathname = usePathname();
  
  async function handleLogout() {
    try {
      await api.post("/api/logout");
      router.replace("/login");
    } catch (e) {
      console.error("Logout failed", e);
    }
  }

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  useEffect(() => {
    const u = getSessionUser();
    setIsAdmin(!!u?.isAdmin);
    setFirstName(u?.firstName || "");
  }, []);

  return (
    <SidebarLayout
      navbar={<Navbar />}
      sidebar={
        <Sidebar>
          
          <SidebarHeader>
            <SidebarSection>
              <div className="mb-2 ml-2 mt-2 flex">
                <Link href="/" className="text-xl"><strong>Ester AI</strong></Link>
              </div>
            </SidebarSection>
          </SidebarHeader>

          <SidebarBody>
            <SidebarSection>
              <SidebarItem href="/" {...(isActive("/") ? { current: true } : {})} >
                <HomeIcon />
                <SidebarLabel>Home</SidebarLabel>
              </SidebarItem>
              <SidebarItem href="/jobs" {...(isActive("/jobs") ? { current: true } : {})}>
                <RectangleGroupIcon />
                <SidebarLabel>Jobs</SidebarLabel>
              </SidebarItem>
              <SidebarItem href="/prompts" {...(isActive("/prompts") ? { current: true } : {})}>
                <SparklesIcon />
                <SidebarLabel>Prompts</SidebarLabel>
              </SidebarItem>
              <SidebarItem href="/users" {...(isActive("/users") ? { current: true } : {})}>
                <UsersIcon />
                <SidebarLabel>Users</SidebarLabel>
              </SidebarItem>
            </SidebarSection>
        
            {/* <SidebarSection >
              <SidebarHeading>User Account</SidebarHeading>
              <SidebarItem 
                className="pointer" 
                href="/user/settings" {...(isActive("/user/") ? { current: true } : {})}
              >
                <Cog6ToothIcon />
                <SidebarLabel>Settings</SidebarLabel>
              </SidebarItem>
              <SidebarItem className="pointer" href="#" onClick={handleLogout}>
                <ArrowRightStartOnRectangleIcon />
                <SidebarLabel>Logout</SidebarLabel>
              </SidebarItem>
          </SidebarSection> */}

          </SidebarBody>

          <SidebarFooter className="pb-8 pt-3">
            <SidebarSection>
              <SidebarItemUserAccount>
                <Avatar initials={firstName[0]} className="size-6 bg-zinc-900 text-white dark:bg-white dark:text-black" />
                <SidebarLabel>{firstName}</SidebarLabel>
              </SidebarItemUserAccount>
              <SidebarItem
                className="pointer" 
                href="/user/settings" {...(isActive("/user/") ? { current: true } : {})}
              >
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
