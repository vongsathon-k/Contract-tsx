"use client";

import * as React from "react";

import {
  ColumnDef,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
  RowSelectionState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { DataTablePagination } from "./data-table-pagination";
import { Dialog, DialogClose } from "@radix-ui/react-dialog";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Updated form schema with all required fields
const formSchema = z.object({
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
  way_type: z.string().min(1, {
    message: "กรุณาเลือกประเภทสัญญา",
  }),
  fund_source: z.string().min(1, {
    message: "กรุณากรอกแหล่งที่มาของเงิน",
  }),
  budget: z.string().min(1, {
    message: "กรุณากรอกจำนวนงบประมาณ",
  }),
  contract_budget: z.string().min(1, {
    message: "กรุณากรอกวงเงินตามสัญญา",
  }),
  partner_name: z.string().min(1, {
    message: "กรุณากรอกชื่อคู่สัญญา",
  }),
  deposit_type: z.string().min(1, {
    message: "กรุณาเลือกประเภทหลักประกัน",
  }),
  deposit_amount: z.string().optional(),
  waranty: z.string().optional(),
});

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onRefresh?: () => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  onRefresh,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      recorder: "",
      division: "",
      project_name: "",
      end_date: "",
      way_type: "",
      fund_source: "",
      contract_budget: "",
      partner_name: "",
      deposit_type: "",
    },
  });

  // Updated submit handler with API call
  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const response = await fetch("/api/contracts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        setIsDialogOpen(false);
        // Success
        const Swal = (await import("sweetalert2")).default;
        await Swal.fire({
          title: "สำเร็จ!",
          text: "เพิ่มสัญญาเรียบร้อยแล้ว",
          icon: "success",
          confirmButtonText: "ตกลง",
          confirmButtonColor: "#f59f00",
        });

        // Reset form and close dialog
        form.reset();
        setIsDialogOpen(false);

        // Refresh the page to show new data
        window.location.reload();
      } else {
        throw new Error("Failed to create contract");
      }
    } catch (error) {
      console.error("Error creating contract:", error);
      const Swal = (await import("sweetalert2")).default;
      await Swal.fire({
        title: "เกิดข้อผิดพลาด!",
        text: "ไม่สามารถเพิ่มสัญญาได้",
        icon: "error",
        confirmButtonText: "ตกลง",
      });
    }
  }

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">แสดง</p>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value));
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 25, 30, 40, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm font-medium">สัญญา</p>
        </div>

        <div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="bg-orange-400 hover:bg-orange-500 text-white"
              >
                เพิ่มสัญญา
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[725px]">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-8"
                >
                  <DialogHeader>
                    <DialogTitle>เพิ่มข้อมูลสัญญา</DialogTitle>
                    <DialogDescription>
                      กรอกข้อมูลสัญญาใหม่ แล้วคลิกบันทึกเมื่อเสร็จสิ้น
                    </DialogDescription>
                  </DialogHeader>

                  <div className="grid gap-4">
                    <div className="grid grid-cols-4 gap-4">
                      <div className="grid col-span-2 gap-2">
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
                      </div>
                      <div className="grid col-span-2 gap-2">
                        <FormField
                          control={form.control}
                          name="division"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>สำนัก/กอง</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="เลือกสำนัก/กอง" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="1">
                                    สำนักงานอัยการจังหวัดปราจีนบุรี
                                  </SelectItem>
                                  <SelectItem value="2">
                                    สำนักงานอัยการคดีเยาวชนและครอบครัวจังหวัดปราจีนบุรี
                                  </SelectItem>
                                  <SelectItem value="3">
                                    สำนักงานอัยการคุ้มครองสิทธิและช่วยเหลือทางกฎหมายและการบังคับคดีจังหวัดปราจีนบุรี
                                  </SelectItem>
                                  <SelectItem value="4">
                                    สำนักงานอัยการคุ้มครองสิทธิและช่วยเหลือทางกฎหมายและการบังคับคดีจังหวัดปราจีนบุรี
                                    สาขากบินทร์บุรี{" "}
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <div className="grid gap-3">
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
                    </div>

                    <div className="grid gap-3">
                      <FormField
                        control={form.control}
                        name="way_type"
                        render={({ field }) => (
                          <FormItem className="space-y-3">
                            <FormLabel>วิธีการ</FormLabel>
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="flex flex-row space-x-3"
                              >
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="1" id="specific" />
                                  <Label htmlFor="specific">เฉพาะเจาะจง</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="2" id="eprice" />
                                  <Label htmlFor="eprice">
                                    ประกวดราคาอิเล็กทรอนิกส์
                                  </Label>
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
                    </div>

                    <div className="grid grid-cols-4 gap-4">
                      <div className="grid col-span-2 gap-2">
                        <FormField
                          control={form.control}
                          name="fund_source"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>แหล่งที่มาของเงิน</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="งบประมาณ/เงินรางวัล"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="grid col-span-2 gap-2">
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
                    </div>

                    <div className="grid grid-cols-4 gap-4">
                      <div className="grid col-span-2 gap-2">
                        <FormField
                          control={form.control}
                          name="contract_budget"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>วงเงินตามสัญญา</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="1,000,000 บาท"
                                  {...field}
                                  value={field.value || ""}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="grid col-span-2 gap-2">
                        <FormField
                          control={form.control}
                          name="partner_name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>คู่สัญญา</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="บริษัท 123 จำกัด"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4">
                      <div className="grid col-span-1 gap-2">
                        <FormField
                          control={form.control}
                          name="deposit_type"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>หลักประกัน</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="เลือกหลักประกัน" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="1">เงินสด</SelectItem>
                                  <SelectItem value="2">
                                    หนังสือค้ำประกัน
                                  </SelectItem>
                                  <SelectItem value="3">
                                    ไม่ต้องวางหลักประกัน
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="grid col-span-3 gap-2">
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
                      <div className="grid gap-3">
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
                      </div>
                      <div className="grid col-span-3 gap-2">
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
                    </div>
                  </div>

                  <DialogFooter>
                    <DialogClose asChild>
                      <Button type="button" variant="outline">
                        ยกเลิก
                      </Button>
                    </DialogClose>
                    <Button type="submit">บันทึก</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex items-center py-4">
          <Input
            placeholder="ค้นหาชื่อโครงการ"
            value={
              (table.getColumn("project_name")?.getFilterValue() as string) ??
              ""
            }
            onChange={(event) =>
              table
                .getColumn("project_name")
                ?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  ไม่พบข้อมูล
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Replace the old pagination with the new advanced pagination */}
      <DataTablePagination table={table} />
    </div>
  );
}
