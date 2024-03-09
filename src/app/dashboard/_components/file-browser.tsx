"use client";

import { useQuery } from "convex/react";
import { UploadButton } from "./upload-button";
import { api } from "../../../../convex/_generated/api";
import { useOrganization, useUser } from "@clerk/nextjs";
import FileCard from "./file-card";
import Image from "next/image";
import { GridIcon, Loader2, Table2Icon } from "lucide-react";
import SearchBar from "./search-bar";
import { useState } from "react";
import { DataTable } from "./file-table";
import { columns } from "./columns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Doc } from "../../../../convex/_generated/dataModel";
import { Label } from "@/components/ui/label";



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
    favoritesOnly,
    deletedOnly,  
  } : 
  { title: string; 
    favoritesOnly?: boolean; 
    deletedOnly?: boolean; 
  }) {
      
  const organization = useOrganization();
  const user = useUser();
  const [query, setQuery] = useState("");
  const [type, setType] = useState<Doc<"files">["type"] | "all">("all");

  let orgId: string | undefined = undefined;
  if (organization.isLoaded && user.isLoaded) {
    orgId = organization.organization?.id ?? user.user?.id;
  }

  const favorites = useQuery(
    api.files.getAllFavorites,
    orgId ? { orgId } : "skip"  
    );

  const files = useQuery(api.files.getFiles, orgId ? { orgId, type: type === "all" ? undefined : type, query, favorites: favoritesOnly, deletedOnly } : "skip");
  const isLoading = files === undefined;

  const modifiedFiles = files?.map((file) => ({
    ...file,
    isFavorited: (favorites ?? []).some(
     (favorite) => favorite.fileId === file._id
    ),
  })) ?? [];

  return (
       <div>
          <div className="flex justify-between items-center mb-8">
          <p className="text-3xl md:text-4xl font-bold ">{title}</p>
          <SearchBar query={query} setQuery={setQuery} />
          <UploadButton />
        </div>

        <Tabs defaultValue="grid" className="w-[400px] md:w-full">
         <div className="flex justify-between items-center">
        <TabsList className="mb-8">
          <TabsTrigger value="grid"
          className="flex gap-2 items-center"
          ><GridIcon /> Grid</TabsTrigger>
          <TabsTrigger value="table"
          className="flex gap-2 items-center"
          ><Table2Icon /> Table</TabsTrigger>
        </TabsList>
         
         <div className="flex gap-2 items-center">
         <Label htmlFor="type-select">Type Filter</Label> 
         <Select value={type} onValueChange={(newType) =>{
          setType(newType as any);
          }}>
          <SelectTrigger id="type-select" className="w-[180px]" >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="image">Image</SelectItem>
            <SelectItem value="csv">CSV</SelectItem>
            <SelectItem value="pdf">Pdf</SelectItem>
          </SelectContent>
        </Select>
         </div>
        </div> 

        {isLoading && (
       <div className="flex flex-col gap-8 items-center mt-24">
        <Loader2 className="h-32 w-32 animate-spin text-gray-500" />
        <div className="text-2xl ">Loading your files...</div>
        </div>)} 

        <TabsContent value="grid">
        <div className="grid md:grid-cols-3 grid-cols-1 gap-4 ">    
         {modifiedFiles?.map((file) => {
          return <FileCard key={file._id} file={file} />;
        })}
         </div>
        </TabsContent>
        <TabsContent value="table">
        <DataTable columns={columns} data={modifiedFiles} />
        </TabsContent>
      </Tabs>

        {files?.length === 0 && <Placeholder />} 

        </div>  
)}
