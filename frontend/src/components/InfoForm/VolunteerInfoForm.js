import React from "react";
import {
  getAuthHeaderFromSession,
  RequestPayloadHelpers,
} from "../../utility/request-helpers";
import withUser from "../../store/user/WithUser";
import styles from "./volunteerForm.module.css";
import { Formik, Form as FormikForm } from "formik";
import { Button } from "react-bootstrap";
import * as Yup from 'yup';
import { CustomBasicFormControl } from "../calendar/event-dialog/create-event/CreateEvent";

const VolunteerInfoSchema = Yup.object().shape({
  firstName: Yup.string().max(50, "First name too long!").required("Required"),
  lastName: Yup.string().max(50, "Last name too long!").required("Required"),
});

const VolunteerInfoForm = (props) => {
  const submitForm = async (values) => {
    try {
      const worked = await RequestPayloadHelpers.makeRequest(
        "volunteerData",
        "POST",
        values,
        getAuthHeaderFromSession(props.user.cognitoSession)
      );
      if (!worked) {
        alert('Update failed. Please contact an administrator for assistance.');
      } else {
        props.modifyUser({
          otherUserInfo: {
            ...props.user?.otherUserInfo,
            ...values,
          }
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <div className={styles.InfoFormContainer}>
        <h1>Volunteer Information</h1>
        <p>
          Once you supply this information, an administrator will approve your account.
          You can then start signing up for volunteer shifts!
        </p>
        <Formik
          enableReinitialize={true}
          initialValues={{
            firstName: "",
            lastName: "",
          }}
          validationSchema={VolunteerInfoSchema}
          onSubmit={(values) => submitForm(values)}
          validateOnChange={true}
          validateOnBlur={true}
        >
          {(formikProps) => (
            <FormikForm noValidate>
              <CustomBasicFormControl
                formikProps={formikProps}
                outerStyle="mb-3"
                name="firstName"
                required
                type="text"
                title="First Name"
                placeholder="Enter First Name"
              />
              <CustomBasicFormControl
                formikProps={formikProps}
                name="lastName"
                required
                type="text"
                title="Last Name"
                placeholder="Enter Last Name"
              />
              <div className="pt-2 d-flex justify-content-end">
                <Button className={styles.buttonSubmit} variant="primary" type="submit">
                  Submit
                </Button>
              </div>
            </FormikForm>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default withUser(VolunteerInfoForm);
