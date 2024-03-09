import Image from "next/image";
import Link from "next/link";


export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-solid">
  <div className="mx-auto max-w-screen-xl px-4 py-8 sm:px-6 lg:px-8">
    <div className="sm:flex sm:items-center sm:justify-between">
      <div className="flex justify-center text-teal-600 sm:justify-start items-center gap-2">
      <Image
            className="grayscale" 
            src="/Logo.png" width={40} height={40} alt="logo" />
            <p className="text-semi-bold text-xl">FileScribe</p>
      </div>

      <p className="mt-4 text-center text-sm text-gray-500 lg:mt-0 lg:text-right">
        Copyright &copy; 2024. All rights reserved.
      </p>
    </div>
  </div>
</footer>
  )
}
