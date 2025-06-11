"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"

// Form schema for editing
const editFormSchema = z.object({
  recorder: z.string().min(2, {
    message: "ชื่อผู้บันทึกต้องมีอย่างน้อย 2 ตัวอักษร",
  }),
  division: z.string().min(1, {
    message: "กรุณาเลือกสำนัก/กอง",
  }),
  project_name: z.string().min(2, {
    message: "ชื่อโครงการต้องมีอย่างน้อย 2 ตัวอักษร",
  }),
  end_date: z.string().min(1, {
    message: "กรุณาเลือกวันที่สิ้นสุด",
  }),
  contract_type: z.string().optional(),
  way_type: z.string().optional(),
  fund_source: z.string().optional(),
  budget: z.string().optional(),
  contract_budget: z.string().optional(),
  partner_name: z.string().optional(),
  deposit_type: z.string().optional(),
  deposit_amount: z.string().optional(),
  waranty: z.string().optional(),
})

const EditContractModal = ({ contract }: { contract: Contract }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [contractData, setContractData] = useState<any>(null)

  const form = useForm<z.infer<typeof editFormSchema>>({
    resolver: zodResolver(editFormSchema),
    defaultValues: {
      recorder: "",
      division: "",
      project_name: "",
      end_date: "",
      contract_type: "",
      way_type: "",
      fund_source: "",
      budget: "",
      contract_budget: "",
      partner_name: "",
      deposit_type: "",
      deposit_amount: "",
      waranty: "",
    },
  })

  // Fetch contract data when modal opens
  const fetchContractData = async (id: number) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/contracts/${id}`)
      if (response.ok) {
        const data = await response.json()
        setContractData(data)
        
        // Populate form with fetched data
        form.reset({
          recorder: data.recorder || "",
          division: data.division_name?.toString() || "",
          project_name: data.project_name || "",
          end_date: data.end_date ? new Date(data.end_date).toISOString().split('T')[0] : "",
          way_type: data.way_type?.toString() || "",
          fund_source: data.fund_source || "",
          budget: data.budget || "",
          contract_budget: data.contract_budg || "",
          partner_name: data.partner_name || "",
          deposit_type: data.deposit_type.toString() || "",
          deposit_amount: data.deposit_amount || "",
          waranty: data.waranty || "",
        })
      } else {
        console.error('Failed to fetch contract data')
      }
    } catch (error) {
      console.error('Error fetching contract:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = () => {
    setIsOpen(true)
    fetchContractData(contract.id)
  }

  const onSubmit = async (values: z.infer<typeof editFormSchema>) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/contracts/${contract.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: contract.id,
          ...values,
        }),
      })

      if (response.ok) {
        const Swal = (await import('sweetalert2')).default
        await Swal.fire({
          title: 'สำเร็จ!',
          text: 'แก้ไขสัญญาเรียบร้อยแล้ว',
          icon: 'success',
          confirmButtonText: 'ตกลง'
        })
        
        setIsOpen(false)
        window.location.reload()
      } else {
        throw new Error('Failed to update contract')
      }
    } catch (error) {
      console.error('Error updating contract:', error)
      const Swal = (await import('sweetalert2')).default
      await Swal.fire({
        title: 'เกิดข้อผิดพลาด!',
        text: 'ไม่สามารถแก้ไขสัญญาได้',
        icon: 'error',
        confirmButtonText: 'ตกลง'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          onClick={handleOpenModal}
          className="h-8 w-8 p-0 bg-orange-400 hover:bg-orange-500 text-white"
        >
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[725px]">
        <DialogHeader>
          <DialogTitle>แก้ไขข้อมูลสัญญา</DialogTitle>
          <DialogDescription>
            แก้ไขข้อมูลสัญญา ID: {contract.id}
          </DialogDescription>
        </DialogHeader>
        
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            <span className="ml-2">กำลังโหลดข้อมูล...</span>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="recorder"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ผู้บันทึก</FormLabel>
                      <FormControl>
                        <Input placeholder="ชื่อผู้บันทึก" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="division"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>สำนัก/กอง</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="เลือกสำนัก/กอง" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1">สำนักงานอัยการจังหวัดปราจีนบุรี</SelectItem>
                          <SelectItem value="2">สำนักงานอัยการคดีเยาวชนและครอบครัวจังหวัดปราจีนบุรี</SelectItem>
                          <SelectItem value="3">สำนักงานอัยการคุ้มครองสิทธิและช่วยเหลือทางกฎหมายและการบังคับคดีจังหวัดปราจีนบุรี</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="project_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ชื่อโครงการ</FormLabel>
                    <FormControl>
                      <Textarea placeholder="ชื่อโครงการ" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="way_type"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>วิธีการ</FormLabel>
                      <FormControl>
                        <RadioGroup onValueChange={field.onChange}
                          value={field.value}
                          className="flex flex-row space-x-3"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="1" id="specific" />
                            <Label htmlFor="specific">เฉพาะเจาะจง</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="2" id="eprice" />
                            <Label htmlFor="eprice">ประกวดราคาอิเล็กทรอนิกส์</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="3" id="selected" />
                            <Label htmlFor="selected">คัดเลือก</Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="fund_source"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>แหล่งที่มาของเงิน</FormLabel>
                      <FormControl>
                        <Input placeholder="งบประมาณ/เงินรางวัล" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="budget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>งบประมาณ</FormLabel>
                      <FormControl>
                        <Input placeholder="100,000 บาท" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="fund_source"
                  render={({ field }) => (
                    <FormField
                      control={form.control}
                      name="contract_budget"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>วงเงินตามสัญญา</FormLabel>
                          <FormControl>
                            <Input placeholder="" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                />
                <FormField
                  control={form.control}
                  name="partner_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>คู่สัญญา</FormLabel>
                      <FormControl>
                        <Input placeholder="บริษัท 123 จำกัด" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
               <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="deposit_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>หลักประกัน</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="เลือกหลักประกัน" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1">เงินสด</SelectItem>
                          <SelectItem value="2">หนังสือค้ำประกัน</SelectItem>
                          <SelectItem value="3">ไม่ต้องวางหลักประกัน</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="deposit_amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>จำนวนหลักประกัน</FormLabel>
                      <FormControl>
                        <Input placeholder="" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
               <div className="grid grid-cols-2 gap-4">

              <FormField
                control={form.control}
                name="end_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>วันที่สิ้นสุด</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="waranty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>รับประกัน</FormLabel>
                    <FormControl>
                      <Input placeholder="" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                >
                  ยกเลิก
                </Button>
                <Button type="submit" disabled={loading} className="bg-orange-400 hover:bg-orange-500 text-white">
                  {loading ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  )
}

export type Contract = {
  id: number
  recorder: string
  end_date: string,
  project_name: string
  division_name: string
  
}

export const columns: ColumnDef<Contract>[] = [
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
    cell: ({ row }) => {
      const contract = row.original
      return <EditContractModal contract={contract} />
    },
  },
  {
    accessorKey: "",
    header: "ยกเลิก",
    cell: ({ row }) => {
      const contract = row.original
      
      const handleDelete = async () => {
        // if (!confirm(`คุณต้องการลบสัญญา ID: ${contract.id} หรือไม่?`)) {
        //   return
        // }
        const temptext = `คุณต้องการลบสัญญา ID: ${contract.id} หรือไม่?`
        const Swal = (await import('sweetalert2')).default
        await Swal.fire({
          title: "ยืนยันการลบ",
          text: temptext,
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "ใช่ ลบเลย",
          cancelButtonText: "ยกเลิก",
        }).then(async (result) => {
          if (result.isConfirmed) {
            try {
              const response = await fetch(`/api/contracts/${contract.id}`, {
                method: 'DELETE',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id: contract.id }),
              })

              if (response.ok) {
                await Swal.fire({
                  title: 'สำเร็จ!',
                  text: 'ลบข้อมูลเรียบร้อยแล้ว',
                  icon: 'success',
                  confirmButtonText: 'ตกลง'
                })
                window.location.reload()
              } else {
                throw new Error('Delete failed')
              }
            } catch (error) {
              console.error('Error deleting contract:', error)
              const Swal = (await import('sweetalert2')).default
              await Swal.fire({
                title: 'เกิดข้อผิดพลาด!',
                text: 'ไม่สามารถลบข้อมูลได้',
                icon: 'error',
                confirmButtonText: 'ตกลง'
              })
            }
          }else{
            return false
          }
        });
      }

      return (
        <Button
          variant="outline"
          size="sm"
          onClick={handleDelete}
          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )
    },
  },
]