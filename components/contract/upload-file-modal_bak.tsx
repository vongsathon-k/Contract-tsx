"use client";

import { useState, useCallback } from "react";
import { Upload, FileText, X, Check, Download, Eye } from "lucide-react";

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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { showErrorAlert, showSuccessAlert } from "@/lib/swal-config";
import { Contract } from "./contract-types";

interface UploadFileModalProps {
  contract: Contract;
  onSuccess?: () => void;
}

export const UploadFileModal = ({
  contract,
  onSuccess,
}: UploadFileModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [contractFile, setContractFile] = useState<File | null>(null);
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [contractData, setContractData] = useState<Contract | null>(null);

  const queryclient = useQueryClient();

  // Check if contract has files uploaded
  const hasFilesUploaded =
    contract?.contract_file_path && contract?.attachment_file_path;
  const mutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch(`/api/contracts/${contract.id}/upload`, {
        method: "POST",
        body: formData,
      });
      return response;
    },
    onSuccess: async (data) => {
      if (data.ok) {
        setIsOpen(false);
        await showSuccessAlert("สำเร็จ!", "อัพโหลดไฟล์เรียบร้อยแล้ว", 2000);
        queryclient.invalidateQueries({ queryKey: ["contract"] });
        resetForm();
        if (onSuccess) onSuccess();
      } else {
        throw new Error("Failed to upload files");
      }
    },
    onError: async (error) => {
      console.error("Upload error:", error);
      await showErrorAlert("เกิดข้อผิดพลาด!", "ไม่สามารถอัพโหลดไฟล์ได้");
    },
  });

  // Fetch contract data when modal opens
  const fetchContractData = useCallback(async (id: number) => {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/contracts/${id}`);
      if (!response.ok) {
        throw new Error(
          `Failed to fetch contract data: ${response.statusText}`
        );
      }
      const data = await response.json();
      setContractData(data);
    } catch (error) {
      console.error("Error fetching contract:", error);
    } finally {
      queryclient.invalidateQueries({ queryKey: ["contract"] });
      setIsLoading(false);
    }
  }, []);

  const handleOpenModal = () => {
    setIsOpen(true);
    fetchContractData(contract.id);
  };

  const resetForm = () => {
    setContractFile(null);
    setAttachmentFile(null);
    setUploadProgress(0);

    // Clear file inputs
    const contractInput = document.getElementById(
      "contract-file"
    ) as HTMLInputElement;
    const attachmentInput = document.getElementById(
      "attachment-file"
    ) as HTMLInputElement;

    if (contractInput) contractInput.value = "";
    if (attachmentInput) attachmentInput.value = "";
  };

  // Handle contract file selection
  const handleContractFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        showErrorAlert("ไฟล์ไม่ถูกต้อง!", "กรุณาเลือกไฟล์ PDF เท่านั้น");
        event.target.value = "";
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        showErrorAlert("ไฟล์ใหญ่เกินไป!", "ขนาดไฟล์ต้องไม่เกิน 10MB");
        event.target.value = "";
        return;
      }
      setContractFile(file);
    } else {
      setContractFile(null);
    }
  };

  // Handle attachment file selection
  const handleAttachmentFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        showErrorAlert("ไฟล์ไม่ถูกต้อง!", "กรุณาเลือกไฟล์ PDF เท่านั้น");
        event.target.value = "";
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        showErrorAlert("ไฟล์ใหญ่เกินไป!", "ขนาดไฟล์ต้องไม่เกิน 10MB");
        event.target.value = "";
        return;
      }
      setAttachmentFile(file);
    } else {
      setAttachmentFile(null);
    }
  };

  const removeContractFile = () => {
    setContractFile(null);
    const fileInput = document.getElementById(
      "contract-file"
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const removeAttachmentFile = () => {
    setAttachmentFile(null);
    const fileInput = document.getElementById(
      "attachment-file"
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const handleUpload = async () => {
    // If no files uploaded yet, require both files
    if (!hasFilesUploaded && (!contractFile || !attachmentFile)) {
      await showErrorAlert(
        "กรุณาเลือกไฟล์",
        "กรุณาเลือกไฟล์สัญญาและไฟล์เอกสารแนบ"
      );
      return;
    }

    try {
      setIsLoading(true);
      setUploadProgress(0);

      // Create FormData for file upload
      const formData = new FormData();

      // Append files
      if (contractFile) {
        formData.append("contract_file", contractFile);
      }
      if (attachmentFile) {
        formData.append("attachment_file", attachmentFile);
      }

      // Add contract ID
      formData.append("id", contract.id.toString());

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      mutation.mutate(formData);
    } catch (error) {
      console.error("Error uploading files:", error);
      await showErrorAlert("เกิดข้อผิดพลาด!", "ไม่สามารถอัพโหลดไฟล์ได้");
    } finally {
      setIsLoading(false);
      setUploadProgress(100);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleDownload = (filePath: string, fileName: string) => {
    const link = document.createElement("a");
    link.href = filePath;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePreview = (filePath: string) => {
    window.open(filePath, "_blank");
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {hasFilesUploaded ? (
          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenModal}
            className="h-8 w-8 p-0 bg-blue-500 hover:bg-blue-600 text-white"
          >
            <FileText className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenModal}
            className="h-8 w-8 p-0 bg-green-500 hover:bg-green-600 text-white"
          >
            <Upload className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {hasFilesUploaded ? "ไฟล์สัญญา" : "อัพโหลดไฟล์สัญญา"}
          </DialogTitle>
          <DialogDescription>
            {hasFilesUploaded
              ? "ดูและจัดการไฟล์สัญญา"
              : "อัพโหลดไฟล์สัญญาเลขที่"}{" "}
            : {contract.contract_no}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            <span className="ml-2">กำลังโหลดข้อมูล...</span>
          </div>
        ) : (
          <div className="space-y-6">
            {/* File Status Section - Show when files are uploaded */}
            {hasFilesUploaded && (
              <div className="space-y-4 p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-green-800">
                    ไฟล์ที่อัพโหลดแล้ว
                  </h3>
                  <Badge
                    variant="outline"
                    className="text-green-600 border-green-600"
                  >
                    <Check className="w-3 h-3 mr-1" />
                    อัพโหลดเรียบร้อย
                  </Badge>
                </div>

                {contractData?.upload_date && (
                  <p className="text-sm text-green-700">
                    อัพโหลดเมื่อ: {formatDate(contractData.upload_date)}
                  </p>
                )}

                {/* Contract File Info */}
                <div className="bg-white p-4 rounded-lg border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-8 w-8 text-red-500" />
                      <div>
                        <p className="font-medium text-gray-900">ไฟล์สัญญา</p>
                        <p className="text-sm text-gray-600">
                          {contractData?.contract_file_name || "contract.pdf"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handlePreview(contractData?.contract_file_path || "")
                        }
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        ดู
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleDownload(
                            contractData?.contract_file_path || "",
                            contractData?.contract_file_name || "contract.pdf"
                          )
                        }
                        className="text-green-600 hover:text-green-700"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        ดาวน์โหลด
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Attachment File Info */}
                <div className="bg-white p-4 rounded-lg border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-8 w-8 text-blue-500" />
                      <div>
                        <p className="font-medium text-gray-900">
                          ไฟล์เอกสารแนบหลักประกัน
                        </p>
                        <p className="text-sm text-gray-600">
                          {contractData?.attachment_file_name ||
                            "attachment.pdf"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handlePreview(
                            contractData?.attachment_file_path || ""
                          )
                        }
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        ดู
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleDownload(
                            contractData?.attachment_file_path || "",
                            contractData?.attachment_file_name ||
                              "attachment.pdf"
                          )
                        }
                        className="text-green-600 hover:text-green-700"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        ดาวน์โหลด
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* File Upload Section - Show when no files uploaded */}
            {!hasFilesUploaded && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  อัพโหลดไฟล์
                </h3>

                {/* Contract File Upload */}
                <div className="space-y-2">
                  <Label
                    htmlFor="contract-file"
                    className="text-sm font-medium"
                  >
                    ไฟล์สัญญา (PDF) <span className="text-red-500">*</span>
                  </Label>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1">
                      <Input
                        id="contract-file"
                        type="file"
                        accept=".pdf"
                        onChange={handleContractFileChange}
                        className="hidden"
                      />
                      <Label
                        htmlFor="contract-file"
                        className="flex items-center justify-center w-full h-32 border-2 border-dashed border-orange-300 rounded-lg cursor-pointer hover:border-orange-400 hover:bg-orange-50 transition-colors"
                      >
                        <div className="text-center">
                          <Upload className="mx-auto h-8 w-8 text-orange-400 mb-2" />
                          <p className="text-sm text-gray-600">
                            คลิกเพื่อเลือกไฟล์สัญญา
                          </p>
                          <p className="text-xs text-gray-500">
                            PDF เท่านั้น (สูงสุด 10MB)
                          </p>
                        </div>
                      </Label>
                    </div>
                  </div>

                  {contractFile && (
                    <div className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-5 w-5 text-red-500" />
                        <div>
                          <p className="text-sm font-medium">
                            {contractFile.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatFileSize(contractFile.size)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Check className="h-4 w-4 text-green-500" />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={removeContractFile}
                          className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Attachment File Upload */}
                <div className="space-y-2">
                  <Label
                    htmlFor="attachment-file"
                    className="text-sm font-medium"
                  >
                    ไฟล์เอกสารแนบหลักประกัน (PDF){" "}
                    {/* ✅ Remove required asterisk */}
                    <span className="text-gray-500 text-xs">(ไม่บังคับ)</span>
                  </Label>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1">
                      <Input
                        id="attachment-file"
                        type="file"
                        accept=".pdf"
                        onChange={handleAttachmentFileChange}
                        className="hidden"
                      />
                      <Label
                        htmlFor="attachment-file"
                        className="flex items-center justify-center w-full h-32 border-2 border-dashed border-blue-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
                      >
                        <div className="text-center">
                          <Upload className="mx-auto h-8 w-8 text-blue-400 mb-2" />
                          <p className="text-sm text-gray-600">
                            คลิกเพื่อเลือกไฟล์เอกสารแนบหลักประกัน
                          </p>
                          <p className="text-xs text-gray-500">
                            PDF เท่านั้น (สูงสุด 10MB) - ไม่บังคับ
                          </p>
                        </div>
                      </Label>
                    </div>
                  </div>

                  {attachmentFile && (
                    <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-5 w-5 text-blue-500" />
                        <div>
                          <p className="text-sm font-medium">
                            {attachmentFile.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatFileSize(attachmentFile.size)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Check className="h-4 w-4 text-green-500" />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={removeAttachmentFile}
                          className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Upload Progress */}
                {isLoading && uploadProgress > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>กำลังอัพโหลด...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setIsOpen(false);
              resetForm();
            }}
          >
            {hasFilesUploaded ? "ปิด" : "ยกเลิก"}
          </Button>

          {!hasFilesUploaded && (
            <Button
              onClick={handleUpload}
              disabled={isLoading || !contractFile || !attachmentFile}
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>กำลังอัพโหลด...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Upload className="h-4 w-4" />
                  <span>อัพโหลดไฟล์</span>
                </div>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
