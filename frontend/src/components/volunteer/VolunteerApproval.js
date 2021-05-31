import React from "react";
import { Row } from "react-bootstrap";
import styles from "./volunteer.module.css";
import Container from "react-bootstrap/Container";
import Col from "react-bootstrap/Col";
import withFetch from "../WithFetch";
import ThumbUpIcon from '@material-ui/icons/ThumbUp';
import ThumbDownIcon from '@material-ui/icons/ThumbDown';
import Button from '@material-ui/core/Button';
import { getAuthHeaderFromSession, RequestPayloadHelpers } from '../../utility/request-helpers';

const url = "users";

class VolunteerApproval extends React.Component {
  
  render() {
    if (!this.props.fetchedData) {
      return null;
    }
    const us = this.props.fetchedData.users || [];

    const handleApprove = async (email) => {
      const vData = {
        "email" : email,
      }
      try {
          const resp = await RequestPayloadHelpers.makeRequest('updateApproved', 'POST', vData, getAuthHeaderFromSession(this.props.user.cognitoSession));
          if (!resp || !resp.ok) {
              throw new Error('Error occurred updating User');
          } else {
            window.location.reload()
          }
      } catch (error) {
          console.error(error);
      }
    }

    const handleReject = async (email) => {
        const vData = {
          "email" : email,
        }
        try {
            const resp = await RequestPayloadHelpers.makeRequest('updateRejected', 'POST', vData, getAuthHeaderFromSession(this.props.user.cognitoSession));
            if (!resp || !resp.ok) {
                throw new Error('Error occurred posting rejected user');
            } else {
              window.location.reload()
            }
        } catch (error) {
            console.error(error);
        }
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
            <h4> Approve Volunteers </h4>
               <h5> Pending: </h5>
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
                            <p> {firstName} {lastName}, {email} </p>
                              <div className={styles.approvalButtons}>
                                  <Button onClick={() => handleApprove(email)} ><ThumbUpIcon className={styles.thumbs} color="primary"></ThumbUpIcon> </Button> 
                                  <Button onClick={() => handleReject(email)} ><ThumbDownIcon className={styles.thumbs} color="primary"> </ThumbDownIcon> </Button> 
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
                          <p> {firstName} {lastName}, {email} </p>
                          <div className={styles.approvalButtons}>
                            <Button onClick={() => handleApprove(email)} ><ThumbUpIcon className={styles.thumbs} color="primary"></ThumbUpIcon> </Button> 
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
