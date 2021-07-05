
import React from "react";
import Alert from 'react-bootstrap/Alert'

const AnnouncementAlertFailure = ({
    submitAnnouncementError,
    showSubmitAnnouncementError,
    title,
    message
}) => {
    return (
        submitAnnouncementError ?
            <Alert variant="danger" onClose={() => showSubmitAnnouncementError(false)} dismissible>
                <Alert.Heading>{title}</Alert.Heading>
                <p>{message}</p>
            </Alert>
            : null
    );
}

export default AnnouncementAlertFailure