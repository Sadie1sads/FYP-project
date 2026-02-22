import { createUploadthing, type FileRouter } from "uploadthing/next"

const f = createUploadthing()

export const ourFileRouter = {
  imageUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(async ({ req }) => {
      
      return {}
    })
    .onUploadComplete(async ({ file }) => {
      console.log("Upload complete:", file.url)
    }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter