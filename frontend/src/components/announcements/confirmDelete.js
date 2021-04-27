import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import DeleteIcon from '@material-ui/icons/Delete';

export default function AlertDialog(props) {
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleDelete = () => {
    setOpen(false);
    const aData = {

        "title": props.post.title,
        "content": props.post.content,
        "author": props.post.author,
        "date": props.post.date
    }
    try {
        fetch("http://localhost:3001/api/announcement", {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }, 
            body: JSON.stringify(aData) 
        });
        alert("Announcement Successfully Deleted")
    } catch (error) {
        console.error(error)
    }
  };

  const handleCancel = () => {
    setOpen(false);
  };

  return (
    <div>
      <DeleteIcon onClick={handleClickOpen}/>
      <Dialog
        open={open}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Are you sure you want to delete this announcement?"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            This action can't be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDelete} color="primary" autoFocus>
            Delete Announcement
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}