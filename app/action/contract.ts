import { EditFormData } from "@/components/contract/contract-schema";
import axios from "axios";

export async function getData() {
  const response = await axios.get(`/api/contracts`);
  if (axios.isAxiosError(response)) {
    throw new Error("Failed to fetch contracts");
  }
  return response.data;
}

export async function editData(data: EditFormData & { id: number }) {
  console.log("Received data:", data);
  const response = await axios.put(`/api/contracts/${data.id}`, data);
  console.log("Response data:", response.data);
  return response.data;
}

export async function deleteData(data: any) {
  const response = await fetch(`/api/contracts/${data.id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response;
}

export async function addData(data: any) {
  console.log("Received data:", data);
  const response = await axios.post(`/api/contracts`, data.values);
  return response;
}
