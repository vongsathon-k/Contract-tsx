"use client";

import { useState, useMemo } from "react";
import { createColumns } from "@/components/contract/columns";
import { DataTable } from "@/components/contract/data-table";
import { ClipLoader } from "react-spinners";
import { getData } from "@/app/action/contract";
import { useQuery } from "@tanstack/react-query";

export default function ContractPage() {
  // const [data, setData] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);

  const { data, isLoading, error } = useQuery({
    queryKey: ["contract"],
    queryFn: getData,
  });

  const columns = useMemo(() => createColumns(), []);

  if (isLoading) {
    return (
      <div className="container mx-auto py-7">
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <ClipLoader
            color="#f97316"
            loading={loading}
            size={50}
            aria-label="Loading Spinner"
            data-testid="loader"
          />
          <div className="text-center text-lg font-medium text-gray-600">
            กำลังโหลดข้อมูลสัญญา...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-7">
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <div className="text-center text-red-500 text-lg">
            เกิดข้อผิดพลาด: {error.message}
          </div>
          <button className="px-4 py-2 bg-orange-400 hover:bg-orange-500 text-white rounded-md transition-colors">
            ลองใหม่อีกครั้ง
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-5">
      <div className="flex justify-between items-center mb-4"></div>
      <DataTable columns={columns} data={data} />
    </div>
  );
}
