"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import Swal from 'sweetalert2'
// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.


export type Contract = {
  id: number
  recorder: string
  end_date: string,
  project_name: string
  // division_name: string
}

export const columns: ColumnDef<Contract>[] = [
  {
    accessorKey: "id",
    /**
     * Renders a sortable header for the ID column using a ghost-styled button.
     * Allows toggling column sorting between ascending and descending order.
     * 
     * @param {Object} column - The column object from react-table with sorting methods
     * @returns {React.ReactNode} A button that enables interactive column sorting
     */
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          ID
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
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
  },
  {
    accessorKey: "",
    header: "แก้ไข",
  },
  {
    accessorKey: "",
    header: "ยกเลิก",
    cell: ({ row }) => {
      const contract = row.original
      
      const handleDelete = async () => {
        const result = await Swal.fire({
          title: 'คุณแน่ใจหรือไม่?',
          text: `คุณต้องการลบสัญญา ID: ${contract.id} หรือไม่?`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#d33',
          cancelButtonColor: '#3085d6',
          confirmButtonText: 'ใช่, ลบเลย!',
          cancelButtonText: 'ยกเลิก'
        })
        if (result.isConfirmed) {
          try {
            const response = await fetch(`/api/delete/${contract.id}`, {
              method: 'DELETE',
            })

            if (response.ok) {
              await Swal.fire({
                title: 'ลบสำเร็จ!',
                text: 'ข้อมูลสัญญาถูกลบแล้ว',
                icon: 'success',
                confirmButtonText: 'ตกลง'
              })
              window.location.reload()
            } else {
              await Swal.fire({
                title: 'เกิดข้อผิดพลาด!',
                text: 'ไม่สามารถลบข้อมูลได้',
                icon: 'error',
                confirmButtonText: 'ตกลง'
              })
            }
          } catch (error) {
            console.error('Error deleting contract:', error)
            await Swal.fire({
              title: 'เกิดข้อผิดพลาด!',
              text: 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้',
              icon: 'error',
              confirmButtonText: 'ตกลง'
            })
          }
        }
      }
      
      return (
        <Button
          variant="destructive"
          size="sm"
          className="delete-btn"
          data-id={contract.id}
          onClick={handleDelete}
        >
          <X className="h-4 w-4" />
        </Button>
      )
    },
  },
  
 
]