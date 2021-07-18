import './CreateEvent.css';

import React, { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import FormLabel from "react-bootstrap/FormLabel";
import FormControl from "react-bootstrap/FormControl";
import { Formik, Form as FormikForm, ErrorMessage } from "formik";
import * as Yup from 'yup';
import { getAuthHeaderFromSession, RequestPayloadHelpers } from '../../../../utility/request-helpers';
import { getTopOfDay, getAdjustedTimeFromDate } from '../../../../utility/date-time';
import { eventTransformer } from '../../event/Event';

const timeSlotOptions = [
  '10AM - 12PM',
  '1PM - 3PM',
  'Custom',
];

const timeSlotToStartEndMap = new Map([
  ['10AM - 12PM', {
    start: (date) => getAdjustedTimeFromDate(date, 10),
    end: (date) => getAdjustedTimeFromDate(date, 12),
  }],
  ['1PM - 3PM', {
    start: (date) => getAdjustedTimeFromDate(date, 13),
    end: (date) => getAdjustedTimeFromDate(date, 15),
  }],
  ['Custom', {
    start: (date, dateStr) => getAdjustedTimeFromDate(date, ...dateStr.split(':')),
    end: (date, dateStr) => getAdjustedTimeFromDate(date, ...dateStr.split(':')),
  }],
]);

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

  return CreateEventSchema;
};

function RequiredIcon() {
  return (
    <span style={{ color: 'red' }}>*</span>
  );
}

function CustomFormControl(props) {
  return (
    <div className={props.outerStyle}>
      <FormLabel style={{fontFamily: 'Raleway', fontSize:"20px", color: "#004AAC"}}>{props.title} {props.required ? <RequiredIcon /> : null}</FormLabel>
      {props.inner}
      <ErrorMessage style={{fontFamily: 'Raleway', fontSize:"20px", color: "#004AAC"}} className="form-error-msg" component="p" name={props.name} />
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
  const { date, dailyEvents } = props;
  const startOfDayDate = getTopOfDay(date);
  // const [availableTimeSlots, setAvailableTimeSlots] = useState(timeSlotOptions);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [eventFormSchema, setEventFormSchema] = useState(getCreateEventSchema());

  /* useEffect(() => {
    const validTimeSlotOptions = timeSlotOptions.filter(slot => {
      return slot !== 'Custom';
    });
  }, [props.dailyEvents]); */

  const createEvent = async (values) => {
    try {
      let start, end;
      if (values.timeSlot !== 'Custom') {
        start = timeSlotToStartEndMap.get(values.timeSlot).start(startOfDayDate);
        end = timeSlotToStartEndMap.get(values.timeSlot).end(startOfDayDate);
      } else {
        start = timeSlotToStartEndMap.get(values.timeSlot).start(startOfDayDate, values.startTime);
        end = timeSlotToStartEndMap.get(values.timeSlot).end(startOfDayDate, values.endTime);
      }

      const event = {
        start,
        end,
        title: values.title,
        description: values.description,
      };

      const resp = await RequestPayloadHelpers.makeRequest('event', 'POST', event,
        getAuthHeaderFromSession(props.user.cognitoSession), true);
      
      if (!resp || !resp.newEvent) {
        alert('Create event failed. Please try again later!');
        return;
      }

      eventTransformer(resp.newEvent);
      props.eventEditor(resp.newEvent);
      props.handleClose();
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
        <Button disabled={isSubmitting} className="float-right" variant="primary" type="submit">
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
      validationSchema={eventFormSchema}
      onSubmit={async (values) => {
        setIsSubmitting(true);
        await createEvent(values);
        setIsSubmitting(false);
      }}
      validateOnChange={true}
      validateOnBlur={true}
    >
      {(props) => renderForm(props)}
    </Formik>
  );
}

export default CreateEvent;
