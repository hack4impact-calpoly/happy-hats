
import React from "react";
import Alert from 'react-bootstrap/Alert'

const VolunteerAlertDeleted = ({
    deleteVolunteer,
    setDeleteVolunteer,
    title,
    message
}) => {
    return (
        deleteVolunteer ?
            <Alert variant="danger" onClose={() => setDeleteVolunteer(false)} dismissible>
                <Alert.Heading>{title}</Alert.Heading>
                <p>{message}</p>
            </Alert>
            : null
    );
}

export default VolunteerAlertDeleted