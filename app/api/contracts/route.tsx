import { createConnection } from '../../../lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const connection = await createConnection()
    const [rows] = await connection.execute('SELECT * FROM contract WHERE isdelete = 0')
    const contracts = rows as any[]
    
    // Status mapping object
    const statusMap: { [key: number]: string } = {
      1: "ทดสอบ",
      2: "อนุมัติ",
      3: "ปิด"
    }
    
    // Thai date formatting function
    const formatThaiDate = (dateString: string): string => {
      if (!dateString) return "ไม่ระบุวันที่"
      
      const date = new Date(dateString)
      const thaiMonths = [
        "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
        "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
      ]
      
      const day = date.getDate()
      const month = thaiMonths[date.getMonth()]
      const year = date.getFullYear() + 543
      
      return `${day} ${month} ${year}`
    }
      const divisionMap: { [key: number]: string } = {
      1: "สำนักงานอัยการจังหวัดปราจีนบุรี",
      2: "สำนักงานอัยการคดีเยาวชนและครอบครัวจังหวัดปราจีนบุรี", 
      3: "สำนักงานอัยการคุ้มครองสิทธิและช่วยเหลือทางกฎหมายและการบังคับคดีจังหวัดปราจีนบุรี",      
      4: "สำนักงานอัยการคุ้มครองสิทธิและช่วยเหลือทางกฎหมายและการบังคับคดีจังหวัดปราจีนบุรี สาขากบินทร์บุรี"      
    }

    const formattedContracts = contracts.map((contract) => ({
      id: contract.id,
      recorder: contract.recorder,
      end_date: formatThaiDate(contract.end_date),
    //   status: statusMap[contract.status] || "ไม่ระบุ",
      division_name: divisionMap[contract.division_name] || "ไม่ระบุ", // Map status with fallback
      project_name: contract.project_name
    }))
    
    return NextResponse.json(formattedContracts)
    
  } catch (error) {
    console.error('Error fetching contracts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch contracts' },
      { status: 500 }
    )
  }
}