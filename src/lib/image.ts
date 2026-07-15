/**
 * Compresses an image file client-side before uploading to Supabase.
 * Dramatically reduces file size (e.g., 10MB → ~100KB) while maintaining good visual quality.
 * Supports HEIC/HEIF (iPhone default format), WebP, and standard image formats.
 *
 * @param file - The original image File from the file input
 * @param maxDimension - Maximum width/height in pixels (default: 800)
 * @param quality - JPEG quality 0-1 (default: 0.7)
 * @returns A compressed Blob ready for upload
 */
export async function compressImage(
  file: File,
  maxDimension: number = 800,
  quality: number = 0.7
): Promise<Blob> {
  // If the file is already small enough, skip compression entirely
  if (file.size < 300 * 1024) {
    return file
  }

  // --- HEIC/HEIF conversion ---
  // iPhones default to HEIC format which browsers cannot natively decode.
  // Use the heic2any WASM library to convert to JPEG first.
  const isHeic =
    file.type === 'image/heic' ||
    file.type === 'image/heif' ||
    /\.heic$/i.test(file.name) ||
    /\.heif$/i.test(file.name)

  let imageFile: File | Blob = file

  if (isHeic) {
    try {
      const heic2any = (await import('heic2any')).default
      const convertedBlob = await heic2any({
        blob: file,
        toType: 'image/jpeg',
        quality,
      })
      // heic2any returns Blob | Blob[]; take the first if it's an array
      imageFile = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob
    } catch {
      // If HEIC conversion fails, fall through to the standard pipeline
      // (it will likely fail there too, but the error will be more descriptive)
      throw new Error(
        'Could not convert HEIC image. Please ensure you have selected a valid photo or change your iPhone camera format to "Most Compatible" (JPEG) in Settings > Camera.'
      )
    }
  }

  // --- Standard browser-based compression ---
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(imageFile)
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

        // Fill with white background first (handles transparency in PNGs)
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, width, height)
        ctx.drawImage(img, 0, 0, width, height)

        // Convert to JPEG blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error('Canvas toBlob failed. The image may be in an unsupported format.'))
            }
          },
          'image/jpeg',
          quality
        )
      }

      img.onerror = () =>
        reject(
          new Error(
            'Failed to load image. This format may not be supported by your browser. Please try a JPEG or PNG image.'
          )
        )
    }

    reader.onerror = () => reject(new Error('Failed to read file'))
  })
}
