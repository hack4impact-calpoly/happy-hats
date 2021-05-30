import React from "react";
import { Row } from "react-bootstrap";
import styles from "./volunteer.module.css";
import Container from "react-bootstrap/Container";
import Col from "react-bootstrap/Col";
import withFetch from "../WithFetch";
import AlertDialog from './DeleteVolunteer'

const url = "volunteers";

class Volunteer extends React.Component {

  render() {
    if (!this.props.fetchedData) {
      return null;
    }
    
    const vol = this.props.fetchedData.volunteers || [];

    return (
      <>
        <Container>
          <Row>
            <Col>
            <h1 className={styles.title}>Volunteers</h1>
            </Col>
            <Col>
            <div className={styles.ApprovalSection}> 
            
            
            <h4> Approve Volunteers </h4>
              <div className={styles.personRow}>
                  <p> Name </p>
                  <button className={styles.ApprovalButton}> Approve </button>
              </div>
            </div>
            </Col>
          </Row>
        </Container>
        <div className={styles.scroll}>
          {vol.map(({
            firstName,
            lastName,
            email,
            completedHours,
            scheduledHours,
            nonCompletedHours,
          }, index) => {
            console.log(vol);

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
          })}
        </div>
      </>
    );
  }
}

export default withFetch(Volunteer, url, {
  withAuth: true,
});
