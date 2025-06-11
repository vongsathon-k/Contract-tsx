import Swal from "sweetalert2";

export const showSuccessAlert = (
  title: string,
  text: string,
  timer?: number
) => {
  return Swal.fire({
    title,
    text,
    icon: "success",
    confirmButtonText: "ตกลง",
    confirmButtonColor: "#f97316",
    timer: timer || 3000,
    timerProgressBar: true,
  });
};

export const showErrorAlert = (title: string, text: string) => {
  return Swal.fire({
    title,
    text,
    icon: "error",
    confirmButtonText: "ตกลง",
    confirmButtonColor: "#f97316",
  });
};

export const showConfirmAlert = (title: string, text: string) => {
  return Swal.fire({
    title,
    text,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#f97316",
    cancelButtonColor: "#6b7280",
    confirmButtonText: "ยืนยัน",
    cancelButtonText: "ยกเลิก",
  });
};
