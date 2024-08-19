import { ConvexError, v } from "convex/values";
import { MutationCtx, QueryCtx, internalMutation, mutation, query } from "./_generated/server";
import { getUser } from "./users";
import { fileTypes } from "./schema";
import { Doc, Id } from "./_generated/dataModel";


export const generateUploadUrl = mutation(async (ctx ) => {
    const identity = await ctx.auth.getUserIdentity();

    if(!identity){
        throw new ConvexError("You must be logged in to upload a file!");
    }

    return await ctx.storage.generateUploadUrl();
  });
  
  export const getUrl = mutation(
     async (ctx) => {
    //   const messages = await ctx.db.query("files").collect();
      return  await ctx.storage.getUrl('kg28etfjwwr2y0btxrdjp143m56w9c7k') 
          
    })
  
  

   async function hasAccessToOrg(ctx: QueryCtx | MutationCtx, orgId: any){
    const identity = await ctx.auth.getUserIdentity();
    if(!identity){
       return null;     
    }    
    // const user = await ctx.db.query("users").withIndex("by_tokenIdentifier", 
    // q => q.eq("tokenIdentifier", identity.tokenIdentifier)).first();   

    const user = await getUser(ctx, identity.tokenIdentifier)
    if(!user){
        return null;
    }
    // const hasAccess = user.orgIds.some(item => item.orgId === orgId) || user.tokenIdentifier ===orgId 
    const hasAccess = user.orgIds.map(item =>(item.orgId === orgId)) || user.tokenIdentifier ===orgId 
    if(!hasAccess){
        return null;
    }
    console.log(identity.tokenIdentifier)
    console.log(user.tokenIdentifier)
    console.log(user.orgIds)
    console.log(orgId)
 
    return { user };
}


export const createFile = mutation({
    args: {
        name: v.string(),
        type: fileTypes,
        fileId: v.id("_storage"),
        orgId: v.string(),

    },
    async handler(ctx, args) {
        const hasAccess = await hasAccessToOrg(ctx, args.orgId);

        if(!hasAccess){
            throw new ConvexError("You do not have access to this org");
        }
        await ctx.db.insert("files", {
            name: args.name,
            type: args.type,
            fileId: args.fileId,
            orgId: args.orgId,
            userId: hasAccess.user._id,
        })
    },
});


export const getFiles = query({
    args: {
        orgId: v.string(),
      type: v.optional(fileTypes),
      query: v.optional(v.string()),
      favorites: v.optional(v.boolean()),
      deletedOnly: v.optional(v.boolean()),
    },
    async handler(ctx, args) {
        const hasAccess = await hasAccessToOrg(ctx, args.orgId);
        
        if(!hasAccess){
            return [];
          }

        let files = await ctx.db.query("files").withIndex('by_orgId', (q) => q.eq('orgId', args.orgId))
        .collect();

        const query = args.query;

        if(query){
         files = files.filter((file)=> 
         file.name.toLowerCase().includes(query.toLowerCase()));
           
        }

        if(args.favorites){
            
          const favorites = await ctx.db
          .query("favorites").withIndex("by_userId_orgId_fileId", (q) => 
          q.eq("userId", hasAccess.user._id).eq("orgId", args.orgId))
          .collect();

          files = files.filter(file => favorites.some((favorite)=> favorite.fileId === file._id))
        }

        if(args.deletedOnly){
            files = files.filter(file => file.shouldDelete);
          } else {
            files = files.filter(file => !file.shouldDelete);
          }
        
        if(args.type){
            files = files.filter(file => file.type === args.type);
        }  

        return files;
    },
});


export const deleteAllFiles = internalMutation({
    args: {},
    async handler(ctx, args) {
        const files = await ctx.db.query("files")
        .withIndex("by_shouldDelete", q => q.eq("shouldDelete", true))
        .collect();

        await Promise.all(files.map(async (file) => {
            await ctx.storage.delete(file.fileId)
            return await ctx.db.delete(file._id)
        }))
    },
})

function assertCanDeleteFiles(user: Doc<"users">,file: Doc<"files">){
    const canDelete = file.userId === user._id || 
        user.orgIds.find((org) => org.orgId === file.orgId)?.role === "admin";

        if(!canDelete){
            throw new ConvexError("you have no access to delete this file")
        }
}

export const deleteFile = mutation({
    args: {
        fileId: v.id("files"),
    },
    async handler(ctx, args) {
        const access = await hasAccessToFile(ctx, args.fileId);

        if(!access){
            throw new ConvexError("no access to file");
        }
        
        assertCanDeleteFiles(access.user, access.file);

        await ctx.db.patch(args.fileId, {
            shouldDelete: true,
        })
    },
})

export const restoreFile = mutation({
    args: {
        fileId: v.id("files"),
    },
    async handler(ctx, args) {
        const access = await hasAccessToFile(ctx, args.fileId);

        if(!access){
            throw new ConvexError("no access to file");
        }

        assertCanDeleteFiles(access.user, access.file);

        await ctx.db.patch(args.fileId, {
            shouldDelete: false,
        })
    },
})



export const toggleFavorite = mutation({
    args: {
        fileId: v.id("files"),
    },
    async handler(ctx, args) {
        const access = await hasAccessToFile(ctx, args.fileId);

        if(!access){
            throw new ConvexError("no access to file");
        }
        
        const favorite = await ctx.db.query("favorites")
        .withIndex("by_userId_orgId_fileId", 
        q => q
        .eq("userId", access.user._id)
        .eq("orgId", access.file.orgId)
        .eq("fileId", access.file._id) )
        .first();

        if(!favorite){
            await ctx.db.insert("favorites", {
                fileId: access.file._id,
                userId: access.user._id,
                orgId: access.file.orgId,
            })
        } else {
           await ctx.db.delete(favorite._id);
        }
    },
})


export const getAllFavorites = query({
    args: {
        orgId: v.string(),
    },
    async handler(ctx, args) {
       
        const hasAccess = await hasAccessToOrg(
            ctx, 
            args.orgId);

        if(!hasAccess){
            return[];
        }
        
        const favorites = await ctx.db.query("favorites")
        .withIndex("by_userId_orgId_fileId", 
        q => q
        .eq("userId", hasAccess.user._id)
        .eq("orgId", args.orgId))
        .collect();
       
        return favorites;
    },
})


async function hasAccessToFile(
    ctx: QueryCtx | MutationCtx, 
    fileId: Id<"files">) {

    const file = await ctx.db.get(fileId);

    if(!file){
       return null;
    }
    
    const hasAccess = await hasAccessToOrg(ctx, file.orgId);
    if(!hasAccess){
        throw new ConvexError("You do not have access to this org");
    }
 
    return { user: hasAccess.user, file };
}