import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import DeleteIcon from '@material-ui/icons/Delete';
import { getAuthHeaderFromSession, RequestPayloadHelpers } from '../../utility/request-helpers';
import withUser from '../../store/user/WithUser';

function AlertDialog(props) {
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleDelete = async () => {
    setOpen(false);
    console.log(props.post._id);
    const aData = {
      "_id": props.post._id,
      "firstName": props.post.firstName,
      "lastName": props.post.lastName,
      "email": props.post.email,
      "completedHours": props.post.completedHours,
      "scheduledHours": props.post.scheduledHours,
      "nonCompletedHours": props.post.nonCompletedHours
    }

    try {
      const resp = await RequestPayloadHelpers.makeRequest('volunteer', 'DELETE', aData, getAuthHeaderFromSession(props.user.cognitoSession));
      if (!resp || !resp.ok) {
        throw new Error('Error occurred deleting user');
      } else {
        alert("Volunteer Successfully Deleted. \nPlease refresh page to see change.");
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
      <DeleteIcon onClick={handleClickOpen}/>
      <Dialog
        open={open}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Are you sure you want to delete this volunteer?"}</DialogTitle>
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
            Delete Volunteer
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default withUser(AlertDialog);