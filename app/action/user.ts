import axios from "axios";

export async function getData() {
  const response = await axios.get(`/api/admin/users`);
  if (axios.isAxiosError(response)) {
    throw new Error("Failed to fetch users");
  }
  return response.data;
}

export async function updateStatus(id: any, status: string) {
  //   console.log("Received data:", id, status);
  const response = await axios.put(`/api/admin/users/${id}`, {
    status: status,
  });
  return response;
}
