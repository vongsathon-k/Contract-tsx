//rafce
"use client"

import { useState, useEffect } from "react"
import { columns, Contract } from "./columns"
import { DataTable } from "./data-table"
import { ClipLoader, BeatLoader, PulseLoader } from 'react-spinners'

async function getData(): Promise<Contract[]> {
  const response = await fetch('/api/contracts')
  if (!response.ok) {
    throw new Error('Failed to fetch contracts')
  }
  return response.json()
}

export default function ContractPage() {
  const [data, setData] = useState<Contract[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const contracts = await getData()
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
      <div className="container mx-auto py-7">
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <ClipLoader
            color="#f97316"
            loading={loading}
            size={50}
            aria-label="Loading Spinner"
            data-testid="loader"
          />
          <div className="text-center text-lg font-medium text-gray-600">
            กำลังโหลดข้อมูลสัญญา...
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-7">
        <div className="text-center text-red-500">เกิดข้อผิดพลาด: {error}</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-7">
      <div className="flex justify-between items-center mb-4">
      </div>
          <DataTable columns={columns} data={data} />
    </div>
  )
}