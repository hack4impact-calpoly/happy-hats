import React from "react";
import { Row } from "react-bootstrap";
import styles from "./volunteer.module.css";
import Container from "react-bootstrap/Container";
import Col from "react-bootstrap/Col";
import ThumbUpIcon from '@material-ui/icons/ThumbUp';
import ThumbDownIcon from '@material-ui/icons/ThumbDown';
import Button from '@material-ui/core/Button';
import { getAuthHeaderFromSession, getJsonResponse, RequestPayloadHelpers } from '../../utility/request-helpers';
import withUser from "../../store/user/WithUser";

class VolunteerApproval extends React.Component {
  
  render() {
    if (!this.props.users) {
      return null;
    }
    const us = this.props.users || [];

    const handleApprove = async (email) => {
      const vData = {
        "email" : email,
      }
      try {
          const resp = await RequestPayloadHelpers.makeRequest('updateApproved', 'POST', vData, getAuthHeaderFromSession(this.props.user.cognitoSession));
          const userJson = await getJsonResponse(resp);
          if (!resp || !resp.ok || !userJson) {
              throw new Error('Error occurred updating User');
          }

          this.props.updateUser(userJson.user);
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
          const userJson = await getJsonResponse(resp);
          if (!resp || !resp.ok || !userJson) {
              throw new Error('Error occurred updating User');
          }

          this.props.updateUser(userJson.user);
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
                      <div className={styles.personRow} key={`pending-volunteer-${index}`}>
                        <p> {firstName} {lastName}, {email} </p>
                        <div className={styles.approvalButtons}>
                            <Button onClick={() => handleApprove(email)} ><ThumbUpIcon className={styles.thumbs} color="primary"></ThumbUpIcon> </Button> 
                            <Button onClick={() => handleReject(email)} ><ThumbDownIcon className={styles.thumbs} color="primary"> </ThumbDownIcon> </Button> 
                        </div>
                      </div>
                    );
                }
                return null;
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
                      <div className={styles.personRow} key={`rejected-volunteer-${index}`}>
                        <p> {firstName} {lastName}, {email} </p>
                        <div className={styles.approvalButtons}>
                          <Button onClick={() => handleApprove(email)} ><ThumbUpIcon className={styles.thumbs} color="primary"></ThumbUpIcon> </Button> 
                        </div>
                      </div>
                    );
                }

                return null;
              })}
              
            </div>
            </Col>
          </Row>
        </Container>
      </>
    );
  }
}

export default withUser(VolunteerApproval);
