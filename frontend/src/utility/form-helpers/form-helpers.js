import './form-helpers.css';

import FormLabel from "react-bootstrap/FormLabel";
import FormControl from "react-bootstrap/FormControl";
import { ErrorMessage } from "formik";

function RequiredIcon() {
  return <span style={{ color: "red" }}>*</span>;
}

function CustomFormControl(props) {
  return (
    <div className={props.outerStyle}>
      <FormLabel
        style={{ fontFamily: "Raleway", fontSize: "20px", color: "#004AAC" }}
      >
        {props.title} {props.required ? <RequiredIcon /> : null}
      </FormLabel>
      {props.inner}
      <ErrorMessage
        style={{ fontFamily: "Raleway" }}
        className="form-error-msg"
        component="p"
        name={props.name}
      />
      {props.children}
    </div>
  );
}

export function CustomBasicFormControl(props) {
  const { formikProps, formControlChildren, children, outerStyle, ...others } = props;

  return (
    <CustomFormControl
      inner={
        <FormControl
          onChange={formikProps.handleChange}
          onBlur={formikProps.handleBlur}
          value={formikProps.values[props.name]}
          style={
            formikProps.errors[props.name] && formikProps.touched[props.name]
              ? { border: "1px solid red" }
              : {}
          }
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
