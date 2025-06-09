import Link from "next/link"
import { Button } from "@/components/ui/button"
import Image from 'next/image'
import { Scale } from 'lucide-react'

const Navbar = () => {
  return (
    <nav className="flex justify-between items-center bg-orange-400 dark:bg-orange-600 px-8 py-3 border-b">
      <div className="flex justify-between items-center h-20">
        {/* Government Logo Section */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center space-x-4">
            {/* Logo Icon */}
            <div className="bg-white dark:bg-gray-100 p-3 rounded-full shadow-md">
              <Image
                src="/OAG_Logo.png"
                alt="สำนักงานอัยการจังหวัดปราจีนบุรี"
                width={40}
                height={40}
                className="h-10 w-10 object-contain"
              />
            </div>
            <div className="flex flex-col text-white">
              <span className="text-lg font-bold">
                สำนักงานอัยการจังหวัดปราจีนบุรี
              </span>
              <span className="text-sm opacity-90">
                ระบบจัดการสัญญา
              </span>
            </div>
          </Link>
        </div>
        
        {/* Navigation Links */}
        <div className="flex items-center space-x-6 ml-8">
          <Link href="/" className="text-white hover:text-orange-100 font-medium transition-colors">
            Home
          </Link>
          <Link href={"/contract"} className="text-white hover:text-orange-100 font-medium transition-colors">
            Contract
          </Link>
          <Button variant="secondary" size="sm">
            Click me
          </Button>
        </div>
      </div>

      <div className="flex gap-4">
        <Link href={"/login"} className="text-white hover:text-orange-100 font-medium transition-colors">
          Login
        </Link>
        <Link href={"/register"} className="text-white hover:text-orange-100 font-medium transition-colors">
          Register
        </Link>
      </div>
    </nav>
  )
}

export default Navbar