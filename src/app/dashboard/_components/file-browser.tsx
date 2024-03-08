"use client";

import { useQuery } from "convex/react";
import { UploadButton } from "./upload-button";
import { api } from "../../../../convex/_generated/api";
import { useOrganization, useUser } from "@clerk/nextjs";
import FileCard from "./file-card";
import Image from "next/image";
import { FileIcon, Loader2, StarIcon } from "lucide-react";
import SearchBar from "./search-bar";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";


function Placeholder(){
    return (
      <div className="flex flex-col gap-8 items-center mt-24">
      <Image 
      src="/empty.svg"
      width={200}
      height={200}
      alt="picture of empty directory" />
      <div className="text-2xl ">
     You have no files, upload one now!
      </div>
      <UploadButton />
      </div>     
    )
}


export function FileBrowser(
  { title, 
    favorites } : 
  { title: string, 
    favorites?: boolean }) {
  
  const organization = useOrganization();
  const user = useUser();
  const [query, setQuery] = useState("");

  let orgId: string | undefined = undefined;
  if (organization.isLoaded && user.isLoaded) {
    orgId = organization.organization?.id ?? user.user?.id;
  }

  const files = useQuery(api.files.getFiles, orgId ? { orgId, query, favorites } : "skip");
  const isLoading = files === undefined;

  return (
       <div>
       {isLoading && (
       <div className="flex flex-col gap-8 items-center mt-24">
        <Loader2 className="h-32 w-32 animate-spin text-gray-500" />
        <div className="text-2xl ">Loading your files...</div>
        </div>)} 

        {!isLoading && (
            <>
          <div className="flex justify-between items-center mb-8">
          <p className="text-3xl md:text-4xl font-bold ">{title}</p>
          <SearchBar query={query} setQuery={setQuery} />
          <UploadButton />
        </div>

        {files?.length === 0 && <Placeholder />}

         <div className="grid md:grid-cols-3 grid-cols-1 gap-4 ">    
         {files?.map((file) => {
          return <FileCard key={file._id} file={file} />;
        })}
         </div>
         </>
        )}
        </div>  
)}
