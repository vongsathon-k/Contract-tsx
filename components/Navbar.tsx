import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"

const Navbar = () => {
  return (
    <>  
     <nav className="flex justify-between items-center bg-orange-400 px-8 py-3">
          <div className="flex gap-4 ">
            <Link href="/">Home</Link>
            <Link href={"/contract"}>Contract</Link>
             <Button>Click me</Button>
          </div>

          <div className="flex gap-4 ">
            <Link href={"/login"}>Login</Link>
            <Link href={"/register"}>Register</Link>
          </div>
      </nav>
    </>
  )
}
export default Navbar