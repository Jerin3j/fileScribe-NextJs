import { Button } from "@/components/ui/button";
import { OrganizationSwitcher, SignInButton, SignedOut, UserButton } from "@clerk/nextjs";
import logo from "@public/Logo.png";
import Image from "next/image";
import Link from "next/link";


export default function Header() {
  return (
    <div className="relative z-10 border-b py-4 bg-gray-50">
      <div className="container mx-auto flex md:flex-row flex-col md:gap-0 gap-5 justify-between items-center">
         <Link href="/" className="flex gap-2 items-center text-2xl font-semibold text-black hover:opacity-75">
            <Image
            className="" 
            src={logo} width={50} height={50} alt="logo" />
            <p>File<span className="text-blue-700">Scribe</span></p>
            </Link>
            <Button variant="outline">
            <Link href="/dashboard/files">
             Your Files
            </Link>
            </Button>
            <div className="flex gap-16 md:gap-2">
            <OrganizationSwitcher />
            <UserButton />
            <SignedOut>
            <SignInButton>
              <Button>Sign In</Button>
              </SignInButton>
            </SignedOut>
            </div>
      </div>
    </div>
  )
}
