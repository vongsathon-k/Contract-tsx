"use client";

import Link from "next/link";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { User, Settings, LogOut, FileText } from "lucide-react";
import LogoutButton from "./logout-button";
import { useState, useEffect } from "react";

interface UserData {
  id: number;
  username: string;
  firstname: string;
  surname: string;
  position: string;
  picture?: string;
}

const Navbar = () => {
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);
  if (!user) return null;
  const getInitials = (firstname: string, surname: string) => {
    return `${firstname.charAt(0)}${surname.charAt(0)}`.toUpperCase();
  };

  return (
    <nav className="flex justify-between items-center bg-orange-400 dark:bg-orange-600 px-8 py-3 border-b">
      <div className="flex justify-between items-center h-20">
        {/* Government Logo Section */}
        <div className="flex items-center">
          <Link href="/contract" className="flex items-center space-x-4">
            {/* Logo Icon */}
            <div className="bg-white dark:bg-gray-100 p-3 rounded-full shadow-md">
              <Image
                src="/OAG_Logo.png"
                alt="สำนักงานอัยการจังหวัดปราจีนบุรี"
                width={40}
                height={40}
                className="h-10 w-10 object-contain"
              />
            </div>
            <div className="flex flex-col text-white">
              <span className="text-lg font-bold">
                สำนักงานอัยการจังหวัดปราจีนบุรี
              </span>
              <span className="text-sm opacity-90">ระบบทะเบียนคุมสัญญา</span>
            </div>
          </Link>
        </div>

        {/* Navigation Links */}
        <div className="flex items-center space-x-6 ml-8"></div>
      </div>

      <div className="flex items-center space-x-4">
        <span className="hidden md:block text-sm text-gray-600">
          สวัสดี, {user.firstname}
        </span>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={user.picture ? user.picture : undefined}
                  alt={`${user.firstname} ${user.surname}`}
                />
                <AvatarFallback className="bg-orange-400 text-white">
                  {getInitials(user.firstname, user.surname)}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {user.firstname} {user.surname}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user.username}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user.position}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile" className="flex items-center">
                <User className="mr-2 h-4 w-4" />
                <span>โปรไฟล์</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              {/* <Link href="/settings" className="flex items-center">
                <Settings className="mr-2 h-4 w-4" />
                <span>ตั้งค่า</span>
              </Link> */}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <div className="w-full">
                <LogoutButton />
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
};

export default Navbar;
