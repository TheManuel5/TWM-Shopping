import { Box } from '@mui/material'
export default function ReferenceBadge({ image }) {
  if (!image?.includes('/catalog/referenciales/')) return null
  return <Box component="span" sx={{ position: 'absolute', bottom: 8, left: 8, zIndex: 1, bgcolor: 'rgba(255,255,255,.94)', color: 'text.secondary', border: '1px solid', borderColor: 'divider', borderRadius: 1.5, px: 1, py: 0.25, fontSize: 10, lineHeight: 1.5, pointerEvents: 'none' }}>Imagen referencial</Box>
}
