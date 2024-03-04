"use client";

import {  Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useOrganization, useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";


const formSchema = z.object({
  title: z.string().min(1).max(200),
  file: z.custom<FileList>((val) => val instanceof FileList, "Required")
  .refine((files) => files.length > 0, "Required"),
})


export default function Home() {
  const { toast } = useToast();
  const organization = useOrganization();
  const user = useUser();
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const createFile = useMutation(api.files.createFile);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      file: undefined,
    },
  });

  const fileRef = form.register('file');

  let orgId: string | undefined = undefined;
  if (organization.isLoaded && user.isLoaded) {
    orgId = organization.organization?.id ?? user.user?.id;
  }

  const [ isDialogOpen, setIsDiaLogOpen] = useState(false);

  async function onSubmit(values: z.infer<typeof formSchema>) {

    const postUrl = await generateUploadUrl();
    if(!orgId) return;

    const result = await fetch(postUrl, {
      method: "POST",
      headers: { "Content-Type": values.file[0].type },
      body: values.file[0],
    });
    const { storageId } = await result.json();

    try {

      await createFile({
        name: values.title,
        fileId: storageId,
        orgId,
      })
      form.reset()
    setIsDiaLogOpen(false);
    toast({
      variant: "success",
      title: "File Uploaded!",
      description: "Now everyone can view your file.",
    })

    } catch (error) {
      toast({
        variant: "destructive",
        title: "Something went wrong!",
        description: "Your file could not be uploaded.",
      })
    }
  }

  const files = useQuery(api.files.getFiles, orgId ? { orgId } : "skip");
  
  return (
    <div className="container mx-auto pt-12">
     <div className="flex justify-between items-center">
     <p className="text-4xl font-bold">Your Files</p>

     <Dialog open={isDialogOpen} onOpenChange={(isOpen)=>{
      setIsDiaLogOpen(isOpen);
      form.reset();
    }
  }>
  <DialogTrigger asChild>
  <Button>Upload File</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle className="mb-8">Upload your file here</DialogTitle>
      <DialogDescription>
      <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                     {/* Title Input */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
                 {/* File Input */}
        <FormField
          control={form.control}
          name="file"
          render={() => (
            <FormItem>
              <FormLabel>File</FormLabel>
              <FormControl>
                <Input 
                type="file" {...fileRef} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={form.formState.isSubmitting}
        className="flex">
          {form.formState.isSubmitting && (
            <Loader2 className="mr-1 h-4 w-4 animate-spin" />
          )}
          Submit</Button>
      </form>
    </Form>
      </DialogDescription>
    </DialogHeader>
  </DialogContent>
</Dialog>

     </div>

    {files?.map((file)=> {
      return <div key={file._id}>
        {file.name}
      </div>
    })}


    </div>
  )
}
