"use client";

import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Edit } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

import { Contract } from "./contract-types";
import { editFormSchema, EditFormData } from "./contract-schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { editData } from "@/app/action/contract";
import { showErrorAlert, showSuccessAlert } from "@/lib/swal-config";

interface EditContractModalProps {
  contract: Contract;
  onSuccess?: () => void;
}

export const EditContractModal = ({
  contract,
  onSuccess,
}: EditContractModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const queryclient = useQueryClient();

  const mutation = useMutation({
    mutationFn: editData,
    onSuccess: async (data) => {
      const response = data;
      if (response.ok) {
        queryclient.invalidateQueries({ queryKey: ["contract"] });
        setIsOpen(false);
        await showSuccessAlert("สำเร็จ!", "แก้ไขสัญญาเรียบร้อยแล้ว", 2000);
        setIsOpen(false);
      } else {
        throw new Error("Failed to update contract");
      }
    },
  });

  const form = useForm<EditFormData>({
    resolver: zodResolver(editFormSchema),
    defaultValues: {
      project_name: "",
      end_date: "",
      way_type: "",
      fund_source: "",
      budget: "",
      contract_budget: "",
      partner_name: "",
      deposit_type: "",
      deposit_amount: "",
      waranty: "",
      contract_no: "",
    },
  });

  // Memoize fetch function to prevent unnecessary re-creations
  const fetchContractData = useCallback(
    async (id: number) => {
      setIsLoading(true);

      try {
        const response = await fetch(`/api/contracts/${id}`);
        if (!response.ok) {
          throw new Error(
            `Failed to fetch contract data: ${response.statusText}`
          );
        }
        const data = await response.json();

        // Set form values after data is fetched. Ensure all fields are handled.
        form.reset({
          project_name: data.project_name || "",
          end_date: data.end_date
            ? new Date(data.end_date).toISOString().split("T")[0]
            : "",
          way_type: data.way_type?.toString() || "",
          fund_source: data.fund_source || "",
          budget: data.budget || "",
          contract_budget: data.contract_budg || "",
          partner_name: data.partner_name || "",
          deposit_type: data.deposit_type?.toString() || "",
          deposit_amount: data.deposit_amount || "",
          waranty: data.waranty || "",
          contract_no: data.contract_no || "",
        });
      } catch (error) {
        console.error("Error fetching contract:", error);
        // Optionally show a user-friendly error message
      } finally {
        setIsLoading(false);
      }
    },
    [form]
  ); // Add form to dependency array

  const handleOpenModal = () => {
    setIsOpen(true);
    fetchContractData(contract.id);
  };

  const onSubmit = async (values: EditFormData) => {
    try {
      setIsLoading(true);
      mutation.mutate({
        id: contract.id,
        ...values,
      });

      // const response = await fetch(`/api/contracts/${contract.id}`, {
      //   method: "PUT",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify({
      //     id: contract.id,
      //     ...values,
      //   }),
      // });
      return;
    } catch (error) {
      console.error("Error updating contract:", error);
      await showErrorAlert("เกิดข้อผิดพลาด!", "ไม่สามารถแก้ไขสัญญาได้");
    } finally {
      setIsLoading(false);
    }
  };

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
            แก้ไขข้อมูลสัญญา ID: {contract.contract_no}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
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
                  name="contract_no"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>เลขที่สัญญา</FormLabel>
                      <FormControl>
                        <Input placeholder="เลขที่สัญญา" {...field} />
                      </FormControl>
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
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
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
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="เลือกหลักประกัน" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1">เงินสด</SelectItem>
                          <SelectItem value="2">หนังสือค้ำประกัน</SelectItem>
                          <SelectItem value="3">
                            ไม่ต้องวางหลักประกัน
                          </SelectItem>
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
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-orange-400 hover:bg-orange-500 text-white"
                >
                  {isLoading ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
};
