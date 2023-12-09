export const rootNotionPageId = '3404a8a0600544d3a11f2a6477280842'
export const rootNotionSpaceId = undefined;

export const previewImagesEnabled = true

export const useOfficialNotionAPI =
  false ||
  (process.env.USE_OFFICIAL_NOTION_API === 'true' && process.env.NOTION_TOKEN)

export const isDev =
  process.env.NODE_ENV === 'development' || !process.env.NODE_ENV

export const port = process.env.PORT || 3000
export const rootDomain = isDev ? `localhost:${port}` : null
