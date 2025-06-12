import AdminNav from "@/components/admin-nav";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">ระบบจัดการ</h1>
          <p className="text-gray-600">จัดการผู้ใช้งานและระบบ</p>
        </div>

        <AdminNav />

        <main>{children}</main>
      </div>
    </div>
  );
}
