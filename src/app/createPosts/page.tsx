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
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const { startUpload } = useUploadThing("imageUploader")

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
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
      let imageUrl: string | null = null
      if (imageFile) {
        const uploaded = await startUpload([imageFile])
        imageUrl = uploaded?.[0]?.url ?? null
      }

      // auto fetch coordinates from location name, user doesn't do anything
      const coords = await getCoordinates(postData.location)
      // if location is "Paris" this returns { latitude: 48.8566, longitude: 2.3522 }
      // if location not found, coords is null and we just save without coordinates

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
          images: imageUrl ? [imageUrl] : [],
          tags: postData.tags
            ? postData.tags.split(",").map((t) => t.trim()).filter(Boolean)
            : [],
        },
        { withCredentials: true }
      )

      toast.success("Post created successfully!")
      setPostData({ title: "", location: "", description: "", review: "", tags: "" })
      setImageFile(null)
      setImagePreview(null)
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

        <div
          className={styles.imageBox}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          {imagePreview ? (
            <img src={imagePreview} alt="Preview" className={styles.preview} />
          ) : (
            <p>Drop your image here or <span className={styles.browse}>browse</span></p>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleImageChange}
          />
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