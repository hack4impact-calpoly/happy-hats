import React from "react";
import { Row } from "react-bootstrap";
import styles from "./volunteer.module.css";
import Container from "react-bootstrap/Container";
import Col from "react-bootstrap/Col";
import withFetch from "../WithFetch";
import AlertDialog from './DeleteVolunteer';
import ThumbUpIcon from '@material-ui/icons/ThumbUp';
import ThumbDownIcon from '@material-ui/icons/ThumbDown';
import Button from '@material-ui/core/Button';
import VolunteerApproval from './VolunteerApproval.js';



const url = "volunteers";

class Volunteer extends React.Component {

  render() {
    if (!this.props.fetchedData) {
      return null;
    }
    
    const vol = this.props.fetchedData.volunteers || [];

    const handleApprove = async () => {
      console.log(this.props.user.cognitoSession.attributes.email);
      const vData = {
        "approved": this.props.approved,
        "decisonMade": this.props.decisionMade
      }
      console.log(vData.approved)
      console.log(vData.decisionMade)
    }

    return (
      <>
      <VolunteerApproval></VolunteerApproval>
        {/*<Container>
          <Row>
            <Col>
            <h1 className={styles.title}>Volunteers</h1>
            </Col>
            <Col>
            <div className={styles.ApprovalSection}> 
            
            {/* change user schema, make an approve attribute, decision made  
            {/* display roles that are pending, if role is none 
            {/* thumsb up or thumbs down 
            {/* send request to backend 
            {/* pending (can approve or reject them), then approved (be able to later reject them), rejcted (be able to reapprove them)
            {/* approved: decision made true, role volunteer, rejected: decision made true, role none, pending: role none
            {/* look at the calender //backend issue 
            {/* rerender page  
            <h4> Approve Volunteers </h4>

            
            


               <h5> Pending: </h5>
               {/* pending: approved false, decison made false 
               <div className={styles.personRow}>
                  <p> Email </p>
                  <div className={styles.approvalButtons}>
                      <Button onClick={handleApprove} ><ThumbUpIcon ></ThumbUpIcon> </Button> 
                      <ThumbDownIcon className={styles.thumbs}> </ThumbDownIcon>
                  </div>
              </div>
              {/* approved = approved true, decision made true  
              <h5> Approved: </h5>
              <div className={styles.personRow}>
                  <p> Email </p>
                  <div className={styles.approvalButtons}>
                      <ThumbDownIcon className={styles.thumbs}> </ThumbDownIcon>
                  </div>
              </div>
              {/* rejected = approved false, decison made false  
              <h5> Rejected: </h5>
              <div className={styles.personRow}>
                  <p> Email </p>
                  <div className={styles.approvalButtons}>
                      <ThumbUpIcon ></ThumbUpIcon>
                  </div>
              </div>

            </div>
            </Col>
          </Row>
        </Container>*/}
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
