//rafce
"use client"

import { useState, useEffect } from "react"
import { columns, Contract } from "./columns"
import { DataTable } from "./data-table"
import { Button } from "@/components/ui/button"

export default function ContractPage() {
  const [data, setData] = useState<Contract[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/contracts') // Create this API route
        
        if (!response.ok) {
          throw new Error('Failed to fetch contracts')
        }
        
        const contracts = await response.json()
        setData(contracts)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, []) // Empty dependency array means this runs only once

  if (loading) {
    return (
      <div className="container mx-auto py-10">
        <div className="text-center">กำลังโหลด...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-10">
        <div className="text-center text-red-500">เกิดข้อผิดพลาด: {error}</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-4">
      </div>
      <DataTable columns={columns} data={data} />
    </div>
  )
}