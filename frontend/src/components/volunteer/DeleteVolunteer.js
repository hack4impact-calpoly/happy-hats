import React, {useState} from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import { IconButton } from '@material-ui/core';
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
    const aData = {
      "_id": props.post._id,
      "firstName": props.post.firstName,
      "lastName": props.post.lastName,
      "email": props.post.email,
      "completedHours": props.post.completedHours,
      "scheduledHours": props.post.scheduledHours,
      "nonCompletedHours": props.post.nonCompletedHours,
      "approved":props.post.approved,
      "decisionMade":props.post.decisionMade,
      "role":props.post.role,
    }
    console.log(aData)
    console.log(props.user.cognitoSession)
    try {
      const resp = await RequestPayloadHelpers.makeRequest('volunteer', 'DELETE', aData, getAuthHeaderFromSession(props.user.cognitoSession));
      if (!resp || !resp.ok) {
        alert("This failed!!!")
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
      <IconButton style={{ color: "#004AAC" }} onClick={handleClickOpen}>
        <DeleteIcon />
      </IconButton>
      <Dialog
        open={open}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        PaperProps={{
          style: {
            margin: "3%",
            borderStyle: "solid",
            borderRadius: "46px",
            borderColor: "#004AAC",
            backgroundColor: "#FFFCEF",
            padding: "30px",
            boxShadow: "-10px 10px 5px #F3D352",
          },
        }}
      >

        <DialogTitle disableTypography="true" id="alert-dialog-title" style={{fontFamily: 'Raleway', fontSize:"20px", color: "#004AAC"}}>
          {"Are you sure you want to delete this volunteer?"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description" style={{fontFamily: 'Raleway', fontSize:"15px", color: "#004AAC"}}>
            This action can't be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel} color="primary" style={{fontFamily: 'Raleway'}}>
            Cancel
          </Button>
          <Button onClick={handleDelete} color="primary" style={{fontFamily: 'Raleway'}}>
            Delete Volunteer
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default withUser(AlertDialog);