'use client'

import Link from "next/link"
import Image from 'next/image'
import { signup } from '@/app/actions/auth'
import { useActionState } from 'react'
const [state, action, pending] = useActionState(signup, undefined)


const RegisterForm = () => {
  return (
    <div className="container mx-auto py-5">
        <div className="flex justify-between items-center mb-4">
            <form action={action}>

            </form>
        </div>
    </div>
  )
}

export default RegisterForm