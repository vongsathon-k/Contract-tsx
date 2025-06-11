"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Contract } from "./contract-types"
import { EditContractModal } from "./edit-contract-modal"
import { DeleteContractButton } from "./delete-contract-button"

export const contractColumns: ColumnDef<Contract>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        ID
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
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
  },
  {
    accessorKey: "",
    header: "แก้ไข",
    cell: ({ row }) => <EditContractModal contract={row.original} />,
  },
  {
    accessorKey: "",
    header: "ยกเลิก",
    cell: ({ row }) => <DeleteContractButton contract={row.original} />,
  },
]