// imageKit — person-photo URL convention (Session 11 decision): the
// People.PhotoUrl column always stores an ImageKit-hosted URL, and every
// <img> that renders a citizen photo builds its display URL through
// buildPersonPhotoUrl so the same image can be served at arbitrary sizes.
// Works with just the public URL endpoint — no private key, no SDK: the
// ImageKit URL transformation API (?tr=...) is applied client-side at
// render time (https://docs.imagekit.io/features/image-transformations).

const IMAGEKIT_URL_ENDPOINT = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT

export interface ImageKitTransformOptions {
  /** Square-crop thumbnail side in px (applies w + h). */
  thumbnail?: number
  /** Exact width override, e.g. for a full-size portrait. */
  width?: number
  /** Exact height override. */
  height?: number
}

// buildPersonPhotoUrl — turns a stored PhotoUrl into an ImageKit display
// URL. Returns the input unchanged when there is no photo or the endpoint
// is not configured (dev fallback: the raw stored URL still renders).
// `fo:face` crops around the subject's face — the standard treatment for
// citizen portraits and avatars. Never call this with a null/empty photo —
// callers gate on photoUrl presence first (e.g. `<img src={photoUrl ? ... : fallback}>`).
export function buildPersonPhotoUrl(
  photoUrl: string | undefined | null,
  options: ImageKitTransformOptions = {},
): string | undefined {
  if (!photoUrl) return undefined
  if (!IMAGEKIT_URL_ENDPOINT) return photoUrl

  // STEP 1: Compose the transformation string from the smallest set of
  //         query params ImageKit understands — either a square thumbnail
  //         (w+h together, face-cropped) or explicit width/height.
  const { thumbnail, width, height } = options
  const tr: string[] = ['fo:face']
  if (thumbnail) tr.push(`w-${thumbnail}`, `h-${thumbnail}`)
  else {
    if (width) tr.push(`w-${width}`)
    if (height) tr.push(`h-${height}`)
  }

  // STEP 2: Attach the transform to the URL. Per convention the stored
  //         PhotoUrl is already an ImageKit URL; a bare path (edge case)
  //         is prefixed with the configured endpoint so it still resolves.
  const raw = photoUrl.startsWith("http") ? photoUrl : `${IMAGEKIT_URL_ENDPOINT}/${photoUrl}`
  const url = new URL(raw)
  url.searchParams.set("tr", tr.join(","))
  return url.toString()
}