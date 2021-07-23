import React, {useState} from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import { IconButton } from '@material-ui/core';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import DeleteIcon from '@material-ui/icons/Delete';
import { getAuthHeaderFromSession, GetRequestHelpers, RequestPayloadHelpers } from '../../utility/request-helpers';
import withUser from '../../store/user/WithUser';

const AlertDialog = (props) => {
  const [open, setOpen] = useState(false);

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
    try {
      const resp = await RequestPayloadHelpers.makeRequest('updateDisabled', 'POST', aData, getAuthHeaderFromSession(props.user.cognitoSession));
      if (!resp || !resp.ok) {
        throw new Error('Error occurred deleting user');
      } else {
          try {
            const updatedUsers = await GetRequestHelpers.makeRequest('volunteers', getAuthHeaderFromSession(props.user.cognitoSession))
              .then(response => response.json());
            if (!updatedUsers) {
              throw new Error('Error occurred deleting user.');
            } else {
              props.update(updatedUsers)
            }
          } catch (error) {
            console.error(error)
          }
      }
    } catch (error) {
      console.error(error)
    }
  };

  const handleCancel = () => {
    setOpen(false);
  };

  return (
    <>
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
          {"Are you sure you want to disable this volunteer?"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description" style={{fontFamily: 'Raleway', fontSize:"15px", color: "#004AAC"}}>
            This action will move the user into the 'rejected' field.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel} color="primary" style={{fontFamily: 'Raleway'}}>
            Cancel
          </Button>
          <Button onClick={handleDelete} color="primary" style={{fontFamily: 'Raleway'}}>
            Disable Volunteer
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default withUser(AlertDialog);