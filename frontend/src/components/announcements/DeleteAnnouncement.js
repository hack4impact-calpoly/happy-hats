import React, { useState } from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import DeleteIcon from '@material-ui/icons/Delete';
import { IconButton } from '@material-ui/core';
import { getAuthHeaderFromSession, RequestPayloadHelpers } from '../../utility/request-helpers';
import withUser from '../../store/user/WithUser';

function AlertDialog(props) {
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleDelete = async () => {
    setOpen(false);
    const aData = {
      "title": props.post.title,
      "content": props.post.content,
      "author": props.post.author,
      "date": props.post.date,
      "_id": props.post._id
    }

    try {
      const resp = await RequestPayloadHelpers.makeRequest('announcement', 'DELETE', aData, getAuthHeaderFromSession(props.user.cognitoSession));
      if (!resp || !resp.ok) {
        throw new Error('Error occurred deleting user');
      } else {
        alert("Success")
      }
    } catch (error) {
      console.error(error)
    }
  };

  const handleCancel = () => {
    setOpen(false);
  };

  return (
    <div>
      <IconButton style={{ color: "#004AAC" }} onClick={handleClickOpen}>
        <DeleteIcon />
      </IconButton>
      <Dialog
        open={open}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        maxWidth="xs"
        
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

export default withUser(AlertDialog);