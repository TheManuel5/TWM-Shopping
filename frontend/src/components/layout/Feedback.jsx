import { useEffect, useState } from 'react'
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Snackbar } from '@mui/material'

export default function Feedback() {
  const [notice, setNotice] = useState(null)
  const [confirmation, setConfirmation] = useState(null)
  useEffect(() => {
    const onNotice = event => setNotice(event.detail)
    const onConfirm = event => setConfirmation(event.detail)
    window.addEventListener('shopping:notice', onNotice)
    window.addEventListener('shopping:confirm', onConfirm)
    return () => {
      window.removeEventListener('shopping:notice', onNotice)
      window.removeEventListener('shopping:confirm', onConfirm)
    }
  }, [])
  const answer = value => { confirmation?.resolve(value); setConfirmation(null) }
  return <>
    <Snackbar open={Boolean(notice)} autoHideDuration={4500} onClose={() => setNotice(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
      <Alert severity={notice?.severity || 'success'} onClose={() => setNotice(null)} variant="filled">{notice?.message}</Alert>
    </Snackbar>
    <Dialog open={Boolean(confirmation)} onClose={() => answer(false)} fullWidth maxWidth="xs">
      <DialogTitle>{confirmation?.title}</DialogTitle>
      <DialogContent><DialogContentText>{confirmation?.message}</DialogContentText></DialogContent>
      <DialogActions><Button onClick={() => answer(false)}>Cancelar</Button><Button color="error" variant="contained" onClick={() => answer(true)}>Confirmar</Button></DialogActions>
    </Dialog>
  </>
}
