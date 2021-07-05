
import React from "react";
import Alert from 'react-bootstrap/Alert'

const AnnouncementAlertSuccess = ({
    submitAnnouncement,
    setSubmitAnnouncement,
    title,
    message
}) => {
    return (
        submitAnnouncement ?
            <Alert variant="success" onClose={() => setSubmitAnnouncement(false)} dismissible>
                <Alert.Heading>{title}</Alert.Heading>
                <p>{message}</p>
            </Alert>
            : null
    );
}

export default AnnouncementAlertSuccess