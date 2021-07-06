import './CreateEvent.css';

import React from "react";
import { Button } from "react-bootstrap";
import FormLabel from "react-bootstrap/FormLabel";
import FormControl from "react-bootstrap/FormControl";
import { Formik, Form as FormikForm, ErrorMessage } from "formik";
import * as Yup from 'yup';
import { RequestPayloadHelpers } from '../../../../utility/request-helpers';

const timeSlotOptions = [
  '10AM - 12PM',
  '1PM - 3PM',
  'Custom',
];


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
      .test('start_time_valid', 'Start time must be less than end time', function(value) { // Must NOT be arrow function
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
      .test('end_time_valid', 'End time must be after the start time', function(value) { // Must NOT be arrow function
        const { startTime } = this.parent;

        if (!startTime) {
          return true;
        }
        return new Date(`01/01/2000 ${value}`).getTime() > new Date(`01/01/2000 ${startTime}`).getTime();
      })
  }),
});

function RequiredIcon() {
  return (
    <span style={{ color: 'red' }}>*</span>
  );
}

function CustomFormControl(props) {
  return (
    <div className={props.outerStyle}>
      <FormLabel>{props.title} {props.required ? <RequiredIcon /> : null}</FormLabel>
      {props.inner}
      <ErrorMessage className="form-error-msg" component="p" name={props.name} />
      {props.children}
    </div>
  );
}

export function CustomBasicFormControl(props) {
  const { formikProps, formControlChildren, children, outerStyle, ...others} = props;

  return (
    <CustomFormControl
      inner={
        <FormControl
          onChange={formikProps.handleChange}
          onBlur={formikProps.handleBlur}
          value={formikProps.values[props.name]}
          style={(formikProps.errors[props.name] && formikProps.touched[props.name] ? { border: '1px solid red' } : {})}
          {...others}
        >
          {formControlChildren}
        </FormControl>
      }
      {...others}
      outerStyle={outerStyle}
    >
      {children}
    </CustomFormControl>
  );
}

function CreateEvent(props) {

  const createEvent = (values) => {
    try {
      RequestPayloadHelpers.makeRequest('')
    } catch (err) {
      console.log(err);
    }
  };

  const renderForm = (formikProps) => {
    return (
      <FormikForm noValidate>
        <CustomBasicFormControl
          title="Event Time Slot"
          required
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
            </div>
          ) : null}
        </CustomBasicFormControl>
        <CustomBasicFormControl formikProps={formikProps} name="title" required type="text" title="Event Title" placeholder="Enter title" />
        <CustomBasicFormControl formikProps={formikProps} name="description" title="Event Description" placeholder="Enter description" />
        <Button className="float-right" variant="primary" type="submit">
          Create Event
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
      }}
      validationSchema={CreateEventSchema}
      onSubmit={values => createEvent(values)}
      validateOnChange={true}
      validateOnBlur={true}
    >
      {(props) => renderForm(props)}
    </Formik>
  );
}

export default CreateEvent;
