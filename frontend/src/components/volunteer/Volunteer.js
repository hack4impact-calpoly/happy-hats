import React from "react";
import { Row } from "react-bootstrap";
import styles from "./volunteer.module.css";
import Container from "react-bootstrap/Container";
import Col from "react-bootstrap/Col";
import withFetch from "../WithFetch";
import AlertDialog from './DeleteVolunteer';
import VolunteerApproval from './VolunteerApproval.js';
const url = "users";

class Volunteer extends React.Component {

  render() {
    if (!this.props.fetchedData) {
      return null;
    }
    
    const vol = this.props.fetchedData.users || [];

    return (
      <>
      <VolunteerApproval></VolunteerApproval>
        <div className={styles.scroll}>
          {vol.map(({
            firstName,
            lastName,
            email,
            completedHours,
            scheduledHours,
            nonCompletedHours,
            approved,
            decisionMade
          }, index) => {
            console.log(vol);
            if(approved && decisionMade){
              return (
                <div className={styles.volunteerContainer}>
                  <h2>
                    Volunteer Name: {firstName} {lastName}
                  </h2>
                  <h3> Contact: {email} </h3>
                  <Container>
                    <Row>
                      <Col>
                        <div className={styles.hours}>
                          Completed Hours: {completedHours}
                        </div>
                      </Col>
                      <Col>
                        <div className={styles.hours}>
                          Scheduled Hours: {scheduledHours}
                        </div>
                      </Col>
                      <Col>
                        <div className={styles.hours}>
                          Hours not Completed: {nonCompletedHours}
                        </div>
                      </Col>
                    </Row>
                  </Container>
                  {this.props.user?.role === "admin" &&
                    <AlertDialog post={vol[index]}/>}
                </div>
              );

            }

          })}
        </div>
      </>
    );
  }
}

export default withFetch(Volunteer, url, {
  withAuth: true,
});
