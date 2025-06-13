export type Contract = {
  id: number;
  recorder: string;
  end_date: string;
  project_name: string;
  division_name: string;
  contract_no: string;
  contract_file_path?: string;
  attachment_file_path?: string;
  contract_file_name?: string;
  attachment_file_name?: string;
  upload_date?: string;
  status?: number;
};
