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
  constructor(props) {
    super(props);

    this.state = {
      users: this.props.fetchedData?.users,
    };
    this.updateUserList = this.updateUserList.bind(this);
  }

  componentDidUpdate(prevProps) {
    if (this.props.fetchedData?.users !== prevProps.fetchedData?.users) {
      this.setState({
        users: this.props.fetchedData?.users,
      });
    }
  }

  updateUser(modifiedUser) {
    if (!this.state.users) {
      alert('User changed without users existing');
      return;
    }

    const users = [...this.state.users];
    const userIndex = users.findIndex((user) => user.email === modifiedUser.email);
    if (userIndex === -1) {
      alert('User changed email not found');
      return;
    }

    users[userIndex] = modifiedUser;

    this.setState({
      users,
    })
  }

  updateUserList = (updatedList) => {
    console.log(updatedList)
    if (!this.state.users) {
      alert('User deleted without existing');
      return;
    }
    const updated = updatedList.volunteers
    console.log(this.state.users)
    console.log(typeof updated)
    console.log(JSON.stringify(updated))
    // console.log(JSON.stringify(updated))
    this.setState({
      users: updatedList.volunteers,
    })
  }

  render() {
    if (!this.props.fetchedData) {
      return null;
    }
    
    const vol = this.state.users || [];

    return (
      <>
        <VolunteerApproval updateUser={(u) => this.updateUser(u)} users={this.state.users} />
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
            if (!approved || !decisionMade) {
              return null;
            }

            return (
              <div className={styles.volunteerContainer} key={`approved-volunteers-${index}`}>
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
                  <AlertDialog post={vol[index]}
                  update={this.updateUserList}/>}
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
