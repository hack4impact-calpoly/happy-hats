import './EventForm.css';

import * as Yup from 'yup';
import { Button } from "react-bootstrap";
import { Formik, Form as FormikForm } from "formik";
import { useState } from "react";
import { CustomBasicFormControl } from '../../../../utility/form-helpers/form-helpers';
import { getHoursMinutesStr } from '../../../../utility/date-time';

const timeSlotOptions = [
  '10AM - 12PM',
  '1PM - 3PM',
  'Custom',
];

const timeSlotMapper = new Map([
  ['10:00-12:00', timeSlotOptions[0]],
  ['13:00-15:00', timeSlotOptions[1]],
]);

export const getTimeSlotFromEvent = (event) => {
  const startTimeStr = getHoursMinutesStr(event.start);
  const endTimeStr = getHoursMinutesStr(event.end);
  const timeInterval = `${startTimeStr}-${endTimeStr}`;
  return timeSlotMapper.get(timeInterval) || 'Custom';
};

const getCreateEventSchema = () => {
  const CreateEventSchema = Yup.object().shape({
    timeSlot: Yup.string()
      .required('Required'),
    title: Yup.string()
      .max(75, 'Title too long!')
      .required('Required'),
    description: Yup.string()
      .max(200, 'Description too long!')
      .optional(),
    startTime: Yup.string().when('timeSlot', {
      is: 'Custom',
      then: Yup.string().required('Required')
        .test('start_time_valid', 'Start time must be less than end time', function (value) { // Must NOT be arrow function
          const { endTime } = this.parent;

          if (!endTime) {
            return true;
          }
          return new Date(`01/01/2000 ${value}`).getTime() < new Date(`01/01/2000 ${endTime}`).getTime();
        })
    }),
    endTime: Yup.string().when('timeSlot', {
      is: 'Custom',
      then: Yup.string().required('Required')
        .test('end_time_valid', 'End time must be after the start time', function (value) { // Must NOT be arrow function
          const { startTime } = this.parent;

          if (!startTime) {
            return true;
          }
          return new Date(`01/01/2000 ${value}`).getTime() > new Date(`01/01/2000 ${startTime}`).getTime();
        })
    }),
  });

  return CreateEventSchema;
};

function EventForm(props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [eventFormSchema, setEventFormSchema] = useState(getCreateEventSchema());

  const renderForm = (formikProps) => {
    return (
      <FormikForm noValidate>
        <CustomBasicFormControl
          title="Event Time Slot"
          required
          disabled={!!props.disableTime}
          formikProps={formikProps}
          name="timeSlot"
          as="select"
          formControlChildren={timeSlotOptions.map((timeSlot, idx) => {
            return <option key={idx}>{timeSlot}</option>
          })}
        >
          {formikProps.values.timeSlot === 'Custom' ? (
            <div style={{ paddingTop: '5px', marginLeft: '1rem' }}>
              <CustomBasicFormControl
                size="small"
                title="Start Time"
                required
                disabled={!!props.disableTime}
                type="time"
                name="startTime"
                formikProps={formikProps}
              />
              <CustomBasicFormControl
                size="small"
                title="End Time"
                required
                disabled={!!props.disableTime}
                type="time"
                name="endTime"
                formikProps={formikProps}
              />
            </div>
          ) : null}
        </CustomBasicFormControl>
        {props.disableTime && <p><i>Time is not editable. Once there are volunteers for an event, the timeframe may not be changed.</i></p>}
        <CustomBasicFormControl formikProps={formikProps} name="title" required type="text" title="Event Title" placeholder="Enter title" />
        <CustomBasicFormControl formikProps={formikProps} name="description" title="Event Description" placeholder="Enter description" />
        <Button
          style={{
            backgroundColor: "#004AAC",
            color: "white",
            textDecoration: "none !important",
            borderRadius: "25px",
            border: "none"
          }}
          disabled={isSubmitting} className="float-right" variant="primary" type="submit">
          {props.buttonText}
        </Button>
      </FormikForm>
    );
  };

  return (
    <Formik
      enableReinitialize={true}
      initialValues={{
        timeSlot: timeSlotOptions[0],
        startTime: '',
        endTime: '',
        title: '',
        description: '',
        ...(props.initialValues || {}),
      }}
      validationSchema={eventFormSchema}
      onSubmit={async (values) => {
        setIsSubmitting(true);
        await props.onSubmit(values);
        setIsSubmitting(false);
      }}
      validateOnChange={true}
      validateOnBlur={true}
    >
      {(props) => renderForm(props)}
    </Formik>
  );
}

export default EventForm;