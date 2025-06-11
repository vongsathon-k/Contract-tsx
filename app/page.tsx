'use client'
import  Contacts  from "@/components/Contracts";
import { useRouter} from 'next/navigation'
import { useEffect } from "react";
const page = () => {
  const user = localStorage.getItem('user')
  const router = useRouter()
  useEffect(() => {
    if (!user) {
      router.push('/login')
    }else{
      router.push('/contacts')
    }
  }, [user, router])
  
  return (
    <div>
      {/* <Contacts /> */}
    </div>
  )
}
export default page