"use client";

import { Button } from "@/components/ui/button";
import { SignInButton, SignOutButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";


export default function Home() {
  
  const files = useQuery(api.files.getFiles);
  const createFile  = useMutation(api.files.createFile);
  
  return (
    <div className="h-screen w-full flex flex-col gap-10 items-center justify-center">
    <SignedIn>
      <SignOutButton>
      <Button>Sign Out</Button>
      </SignOutButton>
    </SignedIn>
    <SignedOut>   
    <SignInButton mode="modal">
    <Button>Sign In</Button>
    </SignInButton>
    </SignedOut>

    {files?.map((file)=> {
      return <div key={file._id}>
        {file.name}
      </div>
    })}

    <Button onClick={()=> {
      createFile({
        name: "Hello world",
      })
    }}>Click Me</Button>
    </div>
  )
}
