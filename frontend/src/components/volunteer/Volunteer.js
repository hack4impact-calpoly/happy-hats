import React from 'react';
import { Row } from 'react-bootstrap';
import styles from "./volunteer.module.css";
import Container from 'react-bootstrap/Container';
import Col from 'react-bootstrap/Col';

const url = "http://localhost:3001/api/volunteers"

class Volunteer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            vol: []
        };
    }

    componentDidMount(){
        fetch(url)
        .then(response => response.json())
        .then(v => this.setState({ vol : v.volunteers }))
    }

    render(){
        return(
            <div>
                <h1 className={styles.title}>Volunteers</h1>
                <div className={styles.scroll}>
                {this.state.vol.map(v => {
                    console.log(this.state.volunteers)
                    const fName = v.firstName;
                    const lName = v.lastName;
                    const email = v.email;
                    const completed = v.completedHours;
                    const scheduled = v.scheduledHours;
                    const notCompleted = v.nonCompletedHours;
                    return (
                        <div className={styles.volunteerContainer}> 
                            <h1>Volunteer Name: {fName} {lName}</h1>
                            <h3> Contact: {email} </h3>
                            <Container>
                                <Row>
                                    <Col><div className={styles.hours}>Completed Hours: {completed}</div></Col>
                                    <Col><div className={styles.hours}>Scheduled Hours: {scheduled}</div></Col>
                                    <Col><div className={styles.hours}>Hours not Completed: {notCompleted}</div></Col>
                                </Row>
                            </Container>
                        </div>
                    )
                })}
                </div>
                
            </div>
        );
     }
    
}

export default Volunteer;

