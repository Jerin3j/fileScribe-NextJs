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
import { ImageIcon, MoreVertical, StarIcon, TrashIcon } from "lucide-react";
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
  } from "@/components/ui/alert-dialog"
import { IoStarSharp } from "react-icons/io5";
import { ReactNode, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useToast } from "@/components/ui/use-toast";
import Image from "next/image";
  

  
  function FileCardActions ({ 
    file, 
    isFavorited } : { 
    file : Doc<"files">; 
    isFavorited: boolean; }) {
    const deleteFile = useMutation(api.files.deleteFile);
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
                This action cannot be undone. This will permanently delete your account
                and remove your data from our servers.
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
                    title: "File deleted!",
                    description: "Your file has been erased from the system.",
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
            onClick={()=> setIsConfirmOpen(true)}
            className="flex gap-1 text-red-600 items-center cursor-pointer">
            <TrashIcon className="w-4 h-4" /> Delete
            </DropdownMenuItem>
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
  
    const typeIcons = {
        "image" : <FaImage />,
        "pdf": <FaFilePdf />,
        "csv": <FaFileCsv />,
      } as Record<Doc<"files">["type"], ReactNode>;
          
      const isFavorited = favorites.some(favorite => favorite.fileId === file._id)


  return (
    <Card>
    <CardHeader className="relative">
      <CardTitle className="flex gap-2">
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
    <CardFooter className="flex justify-center">
      <Button 
      onClick={()=> {
        window.open(getFileUrl(file.fileId), "_blank");
      }}
      >Download</Button>
    </CardFooter>
  </Card>
  
  )
}
