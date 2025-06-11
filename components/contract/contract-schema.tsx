import { z } from "zod"

export const editFormSchema = z.object({
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

export type EditFormData = z.infer<typeof editFormSchema>