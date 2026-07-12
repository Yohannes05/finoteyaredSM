/**
 * Compresses an image file client-side before uploading to Supabase.
 * Dramatically reduces file size (e.g., 10MB → ~100KB) while maintaining good visual quality.
 *
 * @param file - The original image File from the file input
 * @param maxDimension - Maximum width/height in pixels (default: 800)
 * @param quality - JPEG quality 0-1 (default: 0.7)
 * @returns A compressed Blob ready for upload
 */
export function compressImage(
  file: File,
  maxDimension: number = 800,
  quality: number = 0.7
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    // If the file is already small enough, skip compression
    if (file.size < 300 * 1024) {
      resolve(file)
      return
    }

    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = (event) => {
      const img = new Image()
      img.src = event.target?.result as string

      img.onload = () => {
        const canvas = document.createElement('canvas')
        let { width, height } = img

        // Resize if the image exceeds max dimension
        if (width > maxDimension || height > maxDimension) {
          const aspectRatio = width / height
          if (width > height) {
            width = maxDimension
            height = Math.round(maxDimension / aspectRatio)
          } else {
            height = maxDimension
            width = Math.round(maxDimension * aspectRatio)
          }
        }

        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Could not get canvas context'))
          return
        }

        // Smooth downscaling
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'

        ctx.drawImage(img, 0, 0, width, height)

        // Convert to JPEG blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error('Canvas toBlob failed'))
            }
          },
          'image/jpeg',
          quality
        )
      }

      img.onerror = () => reject(new Error('Failed to load image'))
    }

    reader.onerror = () => reject(new Error('Failed to read file'))
  })
}
