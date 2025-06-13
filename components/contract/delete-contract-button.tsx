"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Contract } from "./contract-types";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteData } from "@/app/action/contract";
import {
  showConfirmAlert,
  showErrorAlert,
  showSuccessAlert,
} from "@/lib/swal-config";

interface DeleteContractButtonProps {
  contract: Contract;
  onSuccess?: () => void;
}

export const DeleteContractButton = ({
  contract,
  onSuccess,
}: DeleteContractButtonProps) => {
  const queryclient = useQueryClient();
  const mutation = useMutation({
    mutationFn: deleteData,
    onSuccess: async (data) => {
      const response = data;
      queryclient.invalidateQueries({ queryKey: ["contract"] });

      if (response.ok) {
        await showSuccessAlert("สำเร็จ!", "ลบข้อมูลเรียบร้อยแล้ว", 2000);
      } else {
        throw new Error("Delete failed");
      }
    },
  });
  const handleDelete = async () => {
    const result = await showConfirmAlert(
      "ยืนยันการลบ",
      `คุณต้องการลบสัญญาเลขที่: ${contract.contract_no} หรือไม่?`
    );

    if (result.isConfirmed) {
      try {
        mutation.mutate({
          id: contract.id,
        });
      } catch (error) {
        console.error("Error deleting contract:", error);
        await showErrorAlert("เกิดข้อผิดพลาด", `ไม่สามารถลบข้อมูลได้`);
      }
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleDelete}
      className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
};
