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



const url = "users";

class VolunteerApproval extends React.Component {

  render() {
    if (!this.props.fetchedData) {
      return null;
    }
    const us = this.props.fetchedData.users || [];

    const handleApprove = async () => {
      console.log(this.props.user.cognitoSession.attributes.email);
      const vData = {
        "approved": this.props.approved,
        "decisonMade": this.props.decisionMade
      }
      console.log(vData.approved)
      console.log(vData.decisionMade)
      ///call backednd
    }

    const handleReject = async () => {
        console.log(this.props.user.cognitoSession.attributes.email);
        const vData = {
          "approved": this.props.approved,
          "decisonMade": this.props.decisionMade
        }
        console.log(vData.approved)
        console.log(vData.decisionMade)
        ///call backednd
    }
  

    return (
      <>
          
        <Container>
          <Row>
            <Col>
            <h1 className={styles.title}>Volunteers</h1>
            </Col>
            <Col>
            <div className={styles.ApprovalSection}> 
            
            {/* change user schema, make an approve attribute, decision made  */}
            {/* display roles that are pending, if role is none */}
            {/* thumsb up or thumbs down */}
            {/* send request to backend */}
            {/* pending (can approve or reject them), then approved (be able to later reject them), rejcted (be able to reapprove them) */}
            {/* approved: decision made true, role volunteer, rejected: decision made true, role none, pending: role none */}
            {/* look at the calender //backend issue  */}
            {/* rerender page  */}
            <h4> Approve Volunteers </h4>
               <h5> Pending: </h5>
               {/* pending: approved false, decison made false */}
               {us.map(({
                email, 
                role,
                firstName, 
                lastName, 
                approved, 
                decisionMade, 
              }, index) => {

                if(!approved && !decisionMade){
                    return (
                      <>
                        <div className={styles.personRow}>
                            <p> Email: {email} </p>
                            <div className={styles.approvalButtons}>
                                <Button onClick={handleApprove} ><ThumbUpIcon ></ThumbUpIcon> </Button> 
                                <Button onClick={handleReject} ><ThumbDownIcon className={styles.thumbs}> </ThumbDownIcon> </Button> 
                            </div>
                            </div>
                      </>
                    );
                }

              })}
              <h5> Rejected: </h5>
              {us.map(({
                email, 
                role,
                firstName, 
                lastName, 
                approved, 
                decisionMade, 
              }, index) => {

                if(!approved && decisionMade){
                    return (
                      <>
                        <div className={styles.personRow}>
                          <p> Email: {email} </p>
                          <div className={styles.approvalButtons}>
                            <Button onClick={handleApprove} ><ThumbUpIcon ></ThumbUpIcon> </Button> 
                          </div>
                        </div>
                      </>
                    );
                }

              })}
              
            </div>
            </Col>
          </Row>
        </Container>
      </>
    );
  }
}

export default withFetch(VolunteerApproval, url, {
  withAuth: true,
});
