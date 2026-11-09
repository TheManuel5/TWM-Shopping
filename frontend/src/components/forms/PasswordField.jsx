import { useState } from 'react'
import { VisibilityOutlined, VisibilityOffOutlined } from '@mui/icons-material'
import { IconButton, InputAdornment, TextField } from '@mui/material'
export default function PasswordField({ label, slotProps = {}, ...props }) {
  const [visible, setVisible] = useState(false)
  return <TextField {...props} label={label} type={visible ? 'text' : 'password'} slotProps={{ ...slotProps, input: { ...slotProps.input, endAdornment: <InputAdornment position="end"><IconButton edge="end" aria-label={`${visible ? 'Ocultar' : 'Mostrar'} ${String(label).toLocaleLowerCase()}`} aria-pressed={visible} onMouseDown={event => event.preventDefault()} onClick={() => setVisible(value => !value)}>{visible ? <VisibilityOffOutlined fontSize="small" /> : <VisibilityOutlined fontSize="small" />}</IconButton></InputAdornment> } }} />
}
