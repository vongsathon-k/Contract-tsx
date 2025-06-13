"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EditContractModal } from "./edit-contract-modal";
import { DeleteContractButton } from "./delete-contract-button";
import { UploadFileModal } from "./upload-file-modal";
import { Contract } from "./contract-types";

// Create a function that returns columns with refresh capability
export const createColumns = (
  onRefresh?: () => void
): ColumnDef<Contract>[] => [
  {
    accessorKey: "id",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          ID
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return <div className="text-center font-medium">{row.index + 1}</div>;
    },
  },
  {
    accessorKey: "end_date",
    header: "วัน/เดือน/ปี",
  },
  {
    accessorKey: "project_name",
    header: "ชื่อโครงการ",
  },
  {
    accessorKey: "recorder",
    header: "ผู้บันทึก",
  },
  {
    accessorKey: "division_name",
    header: "สำนัก/กอง",
  },
  {
    accessorKey: "status",
    header: "ไฟล์",
    cell: ({ row }) => {
      const contract = row.original;
      return <UploadFileModal contract={contract} />;
    },
  },
  {
    accessorKey: "",
    header: "แก้ไข",
    cell: ({ row }) => {
      const contract = row.original;
      return <EditContractModal contract={contract} />;
    },
  },
  {
    accessorKey: "",
    header: "ยกเลิก",
    cell: ({ row }) => {
      const contract = row.original;
      return <DeleteContractButton contract={contract} />;
    },
  },
];

// Export default columns for backward compatibility
export const columns = createColumns();
