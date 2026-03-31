'use client'

import { useState, useRef } from "react"
import styles from "./createPosts.module.css"
import axios from "axios"
import { toast } from "react-hot-toast"
import { useRouter } from "next/navigation"
import { useUploadThing } from "@/helpers/uploadthing"

//new helper function
async function getCoordinates(locationName: string): Promise<{ latitude: number; longitude: number } | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(locationName)}&format=json&limit=1`,
      {
        headers: {
          // Nominatim requires a User-Agent header
          "User-Agent": "VoyageVerse/1.0"
        }
      }
    )
    const data = await res.json()
    if (data.length === 0) return null  // location not found
    return {
      latitude: parseFloat(data[0].lat),
      longitude: parseFloat(data[0].lon),
    }
  } catch {
    return null  // if it fails just continue without coordinates
  }
}

export default function CreatePostPage() {
  const [postData, setPostData] = useState({
    title: "",
    location: "",
    description: "",
    review: "",
    tags: ""
  })
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const { startUpload } = useUploadThing("imageUploader")

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const files = Array.from(e.target.files || [])
  if (!files.length) return
  setImageFiles((prev) => [...prev, ...files])
  setImagePreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))])
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
  e.preventDefault()
  const files = Array.from(e.dataTransfer.files || [])
  if (!files.length) return
  setImageFiles((prev) => [...prev, ...files])
  setImagePreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))])
}

  const handleSubmit = async () => {
    if (!postData.title.trim() || !postData.location.trim()) {
      toast.error("Title and location are required")
      return
    }
    const desc = [postData.description, postData.review].filter(Boolean).join("\n\n")
    if (!desc.trim()) {
      toast.error("Please add a description or review")
      return
    }

    try {
      setUploading(true)

      // upload image
      let imageUrls: string[] = []
      if (imageFiles.length > 0) {
        const uploaded = await startUpload(imageFiles)
        imageUrls = uploaded?.map((u) => u.url) ?? []

        console.log('uploaded URLs:', imageUrls)  // ← add this
      }

      const coords = await getCoordinates(postData.location)

      console.log('sending images:', imageUrls)

      await axios.post(
        "/api/Posts/createPosts",
        {
          title: postData.title,
          description: desc,
          location: {
            name: postData.location,
            latitude: coords?.latitude ?? null,   
            longitude: coords?.longitude ?? null,
          },
          images: imageUrls,
          tags: postData.tags
            ? postData.tags.split(",").map((t) => t.trim()).filter(Boolean)
            : [],
        },
        { withCredentials: true }
      )

      toast.success("Post created successfully!")
      setPostData({ title: "", location: "", description: "", review: "", tags: "" })
      setImageFiles([])
      setImagePreviews([])
      router.push("/home")
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to create post")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Create Post</h1>
      <div className={styles.content}>
        <div className={styles.imageCol}>
            {imagePreviews.map((src, i) => (
              <div key={i} className={styles.imageBox}>
                <img src={src} alt={`Preview ${i}`} className={styles.preview} />
              </div>
            ))}
            <div
              className={styles.imageBox}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
            >
              <p>Drop your image here or <span className={styles.browse}>browse</span></p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                style={{ display: "none" }}
                onChange={handleImageChange}
              />
            </div>
          </div>

        <div className={styles.form}>
          <input
            type="text"
            placeholder="Place name/title"
            value={postData.title}
            onChange={(e) => setPostData({ ...postData, title: e.target.value })}
          />
          <input
            type="text"
            placeholder="Location (e.g. Paris, France)"
            value={postData.location}
            onChange={(e) => setPostData({ ...postData, location: e.target.value })}
          />
          <input
            type="text"
            placeholder="Short description"
            value={postData.description}
            onChange={(e) => setPostData({ ...postData, description: e.target.value })}
          />
          <textarea
            placeholder="The start of a wonderful experience"
            value={postData.review}
            onChange={(e) => setPostData({ ...postData, review: e.target.value })}
          />
          <input
            type="text"
            placeholder="Tags (comma separated)"
            value={postData.tags}
            onChange={(e) => setPostData({ ...postData, tags: e.target.value })}
          />
          <button onClick={handleSubmit} disabled={uploading} className={styles.postButton}>
            {uploading ? "Posting..." : "POST"}
          </button>
        </div>
      </div>
    </div>
  )
}