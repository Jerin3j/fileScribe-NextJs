import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"
import { Doc, Id } from "../../../../convex/_generated/dataModel"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DownloadIcon, ImageIcon, MoreVertical, StarIcon, TrashIcon, UndoIcon } from "lucide-react";
import { FaFilePdf, FaFileCsv } from "react-icons/fa6";
import { FaImage } from "react-icons/fa";
import { BsFiletypePdf } from "react-icons/bs";
import { GrDocumentCsv } from "react-icons/gr";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
  } from "@/components/ui/alert-dialog";
import { format, formatDistance, formatRelative, subDays } from 'date-fns'  
import { IoStarSharp } from "react-icons/io5";
import { ReactNode, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useToast } from "@/components/ui/use-toast";
import Image from "next/image";
import { Protect } from "@clerk/nextjs";
  

  
  function FileCardActions ({ 
    file, 
    isFavorited } : { 
    file : Doc<"files">; 
    isFavorited: boolean; }) {
    const deleteFile = useMutation(api.files.deleteFile);
    const restoreFile = useMutation(api.files.restoreFile);
    const toggleFavorite = useMutation(api.files.toggleFavorite);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const { toast } = useToast();

    return (
        <>
        <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
                This action will mark the file for our deletion process. Files are deleted periodically.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={async ()=> {
               await deleteFile({
                    fileId: file._id
                })
                toast({
                    variant: "default",
                    title: "File marked for deletion!",
                    description: "Your file will be deleted soon.",
                  })
            }}>Continue</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
        </AlertDialog>

        <DropdownMenu>
        <DropdownMenuTrigger><MoreVertical /></DropdownMenuTrigger>
        <DropdownMenuContent>
            <DropdownMenuItem
            onClick={()=> {
              toggleFavorite({
                fileId: file._id,
              })
            }}
            className="flex gap-1 items-center cursor-pointer">
            {isFavorited ?
            <div className="flex gap-1 items-center"> 
            <IoStarSharp className="w-4 h-4" /> Favorite
            </div> :
            <div className="flex gap-1 items-center">
            <StarIcon className="w-4 h-4" /> Unfavorite
            </div>}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
            onClick={()=> {
              window.open(getFileUrl(file.fileId), "_blank");
            }}
            className="flex gap-1 items-center cursor-pointer">
             <DownloadIcon className="w-4 h-4" /> Download
            </DropdownMenuItem> 
            <Protect role="org:admin" fallback={<></>}>
            <DropdownMenuSeparator />  
            <DropdownMenuItem
            onClick={()=> {
              if(file.shouldDelete){
                restoreFile({
                  fileId: file._id,
                });
              }else{
                setIsConfirmOpen(true);
              }
              }}
            className="flex gap-1 items-center cursor-pointer"
            >
             {file.shouldDelete ? 
             <div className="flex gap-1 text-green-600 items-center cursor-pointer">
             <UndoIcon className="w-4 h-4" /> Restore     
             </div> : 
              <div className="flex gap-1 text-red-600 items-center cursor-pointer">
              <TrashIcon className="w-4 h-4" /> Delete 
              </div>} 
            </DropdownMenuItem>
            </Protect>
        </DropdownMenuContent>
        </DropdownMenu>
        </>
    )
  }

function getFileUrl (fileId: Id<"_storage">) : string {
        return `${process.env.NEXT_PUBLIC_CONVEX_URL}/api/storage/${fileId}`
}  

export default function FileCard({ 
  file, 
  favorites } : { 
file: Doc<"files">; 
favorites: Doc<"favorites">[]; }) {

  const userProfile = useQuery(api.users.getUserProfiles, {
    userId: file.userId,
  });
  
    const typeIcons = {
        "image" : <FaImage />,
        "pdf": <FaFilePdf />,
        "csv": <FaFileCsv />,
      } as Record<Doc<"files">["type"], ReactNode>;
          
      const isFavorited = favorites.some(favorite => favorite.fileId === file._id)


  return (
    <Card>
    <CardHeader className="relative">
      <CardTitle className="flex gap-2 text-base font-normal items-center">
      <p>{typeIcons[file.type]}</p>
        {file.name}
      </CardTitle>
       <div className="absolute top-2 right-2 outline-none">
        <FileCardActions isFavorited={isFavorited} file={file} />
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
