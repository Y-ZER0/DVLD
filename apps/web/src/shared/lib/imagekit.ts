const IMAGEKIT_URL_ENDPOINT = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT

export interface ImageKitTransformOptions {
  thumbnail?: number
  width?: number
  height?: number
}

export function buildPersonPhotoUrl(
  photoUrl: string | undefined | null,
  options: ImageKitTransformOptions = {},
): string | undefined {
  if (!photoUrl) return undefined
  if (!IMAGEKIT_URL_ENDPOINT) return photoUrl

  const { thumbnail, width, height } = options
  const tr: string[] = ['fo:face']
  if (thumbnail) tr.push(`w-${thumbnail}`, `h-${thumbnail}`)
  else {
    if (width) tr.push(`w-${width}`)
    if (height) tr.push(`h-${height}`)
  }

  const raw = photoUrl.startsWith("http") ? photoUrl : `${IMAGEKIT_URL_ENDPOINT}/${photoUrl}`
  const url = new URL(raw)
  url.searchParams.set("tr", tr.join(","))
  return url.toString()
}