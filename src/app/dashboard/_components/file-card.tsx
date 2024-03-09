import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"
import { Doc } from "../../../../convex/_generated/dataModel"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FaFilePdf, FaFileCsv } from "react-icons/fa6";
import { FaImage } from "react-icons/fa";
import { BsFiletypePdf } from "react-icons/bs";
import { GrDocumentCsv } from "react-icons/gr";
import { formatRelative } from 'date-fns'  
import { ReactNode } from "react";
import {  useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import Image from "next/image";
import { FileCardActions, getFileUrl } from "./file-actions";

  

export default function FileCard({ 
  file } : { 
file: Doc<"files"> & { isFavorited: boolean }; }) {

  const userProfile = useQuery(api.users.getUserProfiles, {
    userId: file.userId,
  });
  
    const typeIcons = {
        "image" : <FaImage />,
        "pdf": <FaFilePdf />,
        "csv": <FaFileCsv />,
      } as Record<Doc<"files">["type"], ReactNode>;
          

  return (
    <Card>
    <CardHeader className="relative">
      <CardTitle className="flex gap-2 text-base font-normal items-center">
      <p>{typeIcons[file.type]}</p>
        {file.name}
      </CardTitle>
       <div className="absolute top-2 right-2 outline-none">
        <FileCardActions isFavorited={file.isFavorited} file={file} />
       </div>
      {/* <CardDescription>Card Description</CardDescription> */}
    </CardHeader>
    <CardContent className="h-[200px] flex items-center justify-center">
      {file.type === 'image' && <Image
      alt={file.name}
      width= "200"
      height= "200"
      src={getFileUrl(file.fileId)} />}

      {file.type === 'csv' && <GrDocumentCsv className="w-20 h-20" />}
      {file.type === 'pdf' && <BsFiletypePdf className="w-20 h-20" />}
    </CardContent>
    <CardFooter className="flex justify-between">
      <div className="flex gap-2 text-xs text-gray-700 w-[70%] items-center">
      <Avatar className="w-6 h-6">
      <AvatarImage src={userProfile?.image} />
      <AvatarFallback>CN</AvatarFallback>
      </Avatar>
      {userProfile?.name}
      </div>
      <div className="text-xs text-gray-800">
      Uploaded {formatRelative((new Date(file._creationTime)), new Date())}
      </div>
    </CardFooter>
  </Card>
  
  )
}
