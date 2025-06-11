"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Briefcase } from "lucide-react";

interface UserData {
  id: number;
  username: string;
  firstname: string;
  surname: string;
  position: string;
  picture?: string;
}

export default function UserProfile() {
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
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <Avatar className="w-20 h-20">
            <AvatarImage
              src={user.picture ? user.picture : undefined}
              alt={`${user.firstname} ${user.surname}`}
            />
            <AvatarFallback className="bg-orange-400 text-white text-lg">
              {getInitials(user.firstname, user.surname)}
            </AvatarFallback>
          </Avatar>
        </div>
        <h2 className="text-xl font-semibold text-gray-800">
          {user.firstname} {user.surname}
        </h2>
        <Badge variant="secondary" className="mt-2">
          {user.position}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center space-x-3 text-gray-600">
          <User className="w-4 h-4" />
          <span className="text-sm">{user.username}</span>
        </div>
        <div className="flex items-center space-x-3 text-gray-600">
          <Briefcase className="w-4 h-4" />
          <span className="text-sm">{user.position}</span>
        </div>
      </CardContent>
    </Card>
  );
}
