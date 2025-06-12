"use client";

import { useEffect, useState } from "react";
import jwt from "jsonwebtoken";

export default function DebugPage() {
  const [debugInfo, setDebugInfo] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    const cookieToken = document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1];

    let decodedToken = null;
    if (token) {
      try {
        decodedToken = jwt.decode(token);
      } catch (e) {
        console.error("Token decode error:", e);
      }
    }

    setDebugInfo({
      localStorageToken: token ? token.substring(0, 50) + "..." : "none",
      cookieToken: cookieToken ? cookieToken.substring(0, 50) + "..." : "none",
      user: user ? JSON.parse(user) : null,
      decodedToken,
      cookies: document.cookie,
    });
  }, []);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Debug Information</h1>
      <pre className="bg-gray-100 p-4 rounded overflow-auto">
        {JSON.stringify(debugInfo, null, 2)}
      </pre>
    </div>
  );
}
