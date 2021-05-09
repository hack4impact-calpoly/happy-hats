import React from 'react';
import { useState } from 'react';
import EventDialog from './EventDialog';

function withEventDialog(WrappedComponent) {
  function WithEventDialog(props) {
    // Event, whether dialog is open
    const [dialogOptions, setDialogOptions] = useState({
      event: null,
      open: false,
    });

    const generateOptions = (overrides) => {
      setDialogOptions({
        event: null,
        open: false,
        newEvent: false,
        ...overrides,
      });
    };

    const handleClickOpen = (event) => {
      generateOptions({ event, open: true, });
    };

    const handleClose = () => {
      generateOptions({ open: false, });
    };

    const handleEdit = () => {
        /* edit an event */
    };

    const handleDelete = () => {
        /* delete an event */
    };

    const createEvent = (day) => {
      generateOptions({ open: true, newEvent: true, event: { start: day } });
    };

    return (
      <React.Fragment>
        <WrappedComponent
          dialogOptions={{
            handleEventDialogOpen: handleClickOpen,
            handleEventDialogClose: handleClose,
            createEvent,
            ...dialogOptions,
          }}

          {...props}
        />
        <EventDialog {...dialogOptions} handleClose={handleClose} />
      </React.Fragment>
    );
  }

  return WithEventDialog;
}

export default withEventDialog;
