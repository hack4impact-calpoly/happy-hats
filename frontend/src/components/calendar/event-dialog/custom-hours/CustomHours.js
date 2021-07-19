
import { Button as BootstrapButton } from "react-bootstrap";
import {
  getMilitaryTimeFromDate,
  getTopOfDayAdjustedTime,
} from "../../../../utility/date-time";
import { CustomBasicFormControl } from "../../../../utility/form-helpers/form-helpers";
import { Formik, Form as FormikForm } from "formik";
import * as Yup from "yup";
import { getAuthHeaderFromSession, RequestPayloadHelpers } from "../../../../utility/request-helpers";
import { eventTransformer } from "../../event/Event";
import { useState } from "react";
import {
  IconButton,
} from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";

const SetCustomHoursSchema = Yup.object().shape({
  startTime: Yup.string()
    .required("Required")
    .test(
      "start_time_after_end_time",
      "Start time must be less than end time",
      function (value) {
        // Must NOT be arrow function
        const { endTime } = this.parent;

        if (!endTime) {
          return true;
        }
        return (
          new Date(`01/01/2000 ${value}`).getTime() <
          new Date(`01/01/2000 ${endTime}`).getTime()
        );
      }
    ),
  endTime: Yup.string()
    .required("Required")
    .test(
      "end_time_after_start_time",
      "End time must be after the start time",
      function (value) {
        // Must NOT be arrow function
        const { startTime } = this.parent;

        if (!startTime) {
          return true;
        }
        return (
          new Date(`01/01/2000 ${value}`).getTime() >
          new Date(`01/01/2000 ${startTime}`).getTime()
        );
      }
    ),
});

function CustomHours(props) {
  const [doingRequest, setDoingRequest] = useState(false);

  const makeCustomHourRequest = async (fields) => {
    const customHourPostBody = {
      start: getTopOfDayAdjustedTime(props.eventStart, ...fields.startTime.split(':')),
      end: getTopOfDayAdjustedTime(props.eventEnd, ...fields.endTime.split(':')),
    };

    try {
      const resp = await RequestPayloadHelpers.makeRequest(`event/${props.eventId}/volunteer/custom-hours`, 'POST',
        customHourPostBody, getAuthHeaderFromSession(props.user.cognitoSession), true);
      
      if (!resp || !resp.newEvent) {
        alert('Could not update hours. Please try again later!');
        return;
      }

      eventTransformer(resp.newEvent);
      props.eventEditor(resp.newEvent);
      props.updateEvent(resp.newEvent);

      setDoingRequest(false);
    } catch (err) {
      console.log(err);
    }
  };

  const requestBtnHit = () => {
    if (!doingRequest) {
      setDoingRequest(true);
    }
  };

  const renderForm = (formikProps) => (
    <FormikForm noValidate>
      <CustomBasicFormControl
        size="small"
        title="Start Time"
        required
        type="time"
        name="startTime"
        formikProps={formikProps}
      />
      <CustomBasicFormControl
        size="small"
        title="End Time"
        required
        type="time"
        name="endTime"
        formikProps={formikProps}
      />
      <BootstrapButton
        type="submit"
        style={{ margin: "5% 0" }}
        onClick={(e) => formikProps.handleSubmit(e)}
      >
        {doingRequest ? "Request" : "Request Custom Hours"}
      </BootstrapButton>
    </FormikForm>
  );

  return (
    <div>
      {doingRequest && (
        <IconButton
          style={{ padding: 0, float: 'right' }}
          aria-label="close"
          onClick={() => setDoingRequest(false)}
        >
          <CloseIcon />
        </IconButton>
      )}
      {doingRequest && (
        <Formik
          enableReinitialize={true}
          initialValues={{
            startTime: getMilitaryTimeFromDate(props.eventStart),
            endTime: getMilitaryTimeFromDate(props.eventEnd),
          }}
          validationSchema={SetCustomHoursSchema}
          onSubmit={(values) => makeCustomHourRequest(values)}
          validateOnChange={true}
          validateOnBlur={true}
        >
          {(props) => renderForm(props)}
        </Formik>
      )}
      {!doingRequest && (
        <BootstrapButton
          type="submit"
          style={doingRequest ? { margin: "5% 0" } : {margin: "0 0 2%"}}
          onClick={() => requestBtnHit()}
        >
          {doingRequest ? "Request" : "Request Custom Hours"}
        </BootstrapButton>
      )}
    </div>
  );
}

export default CustomHours;