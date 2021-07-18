import React from 'react';
import { useState } from 'react';
import withUser from '../../../store/user/WithUser';
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
        eventEditor: null,
        dailyEvents: [],
        ...overrides,
      });
    };

    const overrideOptions = (overrides) => {
      setDialogOptions({
        ...dialogOptions,
        ...overrides,
      });
    };

    const handleClickOpen = (event, eventEditor) => {
      generateOptions({ event, open: true, eventEditor });
    };

    const handleClose = () => {
      generateOptions({ open: false, });
    };

    const createEvent = (day, eventEditor, dailyEvents) => {
      generateOptions({ open: true, newEvent: true, event: { start: day }, eventEditor, dailyEvents });
    };

    const updateEvent = (newEvent) => {
      overrideOptions({ event: newEvent });
    };

    return (
      <React.Fragment>
        <WrappedComponent
          dialogOptions={{
            handleEventDialogOpen: handleClickOpen,
            handleEventDialogClose: handleClose,
            createEvent,
            updateEvent,
            ...dialogOptions,
          }}
          {...props}
        />
        <EventDialog user={props.user} updateEvent={updateEvent} {...dialogOptions} handleClose={handleClose} />
      </React.Fragment>
    );
  }

  return withUser(WithEventDialog);
}

export default withEventDialog;
