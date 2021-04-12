import React from 'react';

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
                {this.state.vol.map(v => {
                    console.log(this.state.volunteers)
                    const fName = v.firstName;
                    const lName = v.lastName;
                    const email = v.email;
                    const completed = v.completedHours;
                    const scheduled = v.scheduledHours;
                    const notCompleted = v.nonCompletedHours;
                    return (
                        <div> 
                            <h1>{fName} {lName}</h1>
                            <h3> {email} </h3>
                            <p> {completed} {scheduled} {notCompleted}</p>
                        </div>
                    )
                })}
            </div>
        );
     }
    
}

export default Volunteer;

