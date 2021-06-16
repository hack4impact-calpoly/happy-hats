import React, {useState} from 'react';
import { getAuthHeaderFromSession, GetRequestHelpers, RequestPayloadHelpers } from '../../utility/request-helpers';
import withUser from '../../store/user/WithUser';
import styles from "./volunteerForm.module.css"

const VolunteerInfoForm = (props) => {
    const [showForm, setFormstatus] = useState(true)
    const [volunteer, setVolunteer] = useState(
        {
            firstName: '',
            lastName: ''
        }
    );

    const handleChange = (event) => {
        const {name, value} = event.target;
        console.log(name);
        if (name === "firstName") {
            setVolunteer(
                {firstName: value, lastName: volunteer['lastName']}
            );
        } else {
            setVolunteer(
                {firstName: volunteer['firstName'], lastName: value}
            );
        }
    }

    const checkSubmittedPrior = async () => {
        try {
            const GETString = 'email?email=' + props.user.cognitoSession.attributes.email
            const resp = await GetRequestHelpers.makeRequestAndGetResponse(GETString, getAuthHeaderFromSession(props.user.cognitoSession));
            if (!resp) {
                throw new Error('Error occurred getting user info');
            } else {
                console.log("got here")
                if(resp.user.firstName !== '' && resp.user.lastName !== ''){
                    setFormstatus(false)
                }
            }
        } catch (error) {
            console.error(error);
        }

    }

    const submitForm = async () => {

        const aData = {
            "firstName": document.getElementById('firstName').value,
            "lastName": document.getElementById('lastname').value,
            "id": props.user.cognitoSession.username
        }
        if (aData.firstName !== '' && aData.lastName !== '' && aData.id !== '') {
            try {
                const resp = await RequestPayloadHelpers.makeRequest('volunteerData', 'POST', aData, getAuthHeaderFromSession(props.user.cognitoSession));
                if (!resp || !resp.ok) {
                    throw new Error('Error occurred posting user info');
                } else {
                alert("Volunteer Data Successfully Posted")
                setFormstatus(false);
                }
            } catch (error) {
                console.error(error);
            }
            setVolunteer({firstName: '', lastName: ''});
        } else {
            alert("Please Fill All Fields before submitting.");
        }
    }
    checkSubmittedPrior();
    if (showForm) {
    return(
    <div >
        <div className={styles.InfoFormContainer}>
        <h1>Volunteer Information</h1>
        <p>Once you supply this information, an admin will approve your account. Then you can start signing up for volunteer shifts!</p>
        <div>
            <label className={styles.firstNameBox} htmlFor="firstName">First Name: </label>
            <textarea 
                name="firstName"
                id="firstName"
                value={volunteer.firstName}
                onChange={handleChange}
                rows={1}
                cols={75} />

            <br />
            <label className={styles.lastNameBox} htmlFor="lastName">Last Name: </label>
            <textarea 
                name="lastName"
                id="lastname"
                value={volunteer.lastName}
                onChange={handleChange}
                rows={1}
                cols={75} />   

            <br />
            <input type="button" value="Submit Volunteer Information" onClick={submitForm} style={{marginTop:'30px'}}/>
        </div>
    </div>
    </div>
    );
    } else {
        return (
        <div className={styles.InfoFormContainer}>
        <h1>Volunteer Information</h1>
        <h3>Thank you for submiting your Volunteer Information Form. An admin will aprove your account shortly.</h3>
        </div>
        );
    }
}

export default withUser(VolunteerInfoForm);