import React, {useState} from 'react';
import styles from "./announcement.module.css"
import {getDayMonthDateStr, formatAMPM} from "../../utility/date-time.js"
//const url = "http://localhost:3001/api/announcement"
const url = "process.env.REACT_APP_SERVER_URL"


class AnouncementBlock extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            announcementList: []
        };
    }

    componentDidMount(){
        fetch(url)
        .then(response => response.json())
        .then(data => data.reverse())
        .then(data => this.setState({ announcementList : data}));
    }

    render(){
        return(
            <div>
                {this.state.announcementList && this.state.announcementList.map(a => {
                    const title = a.title;
                    const author = a.author;
                    const content = a.content;
                    const tempDate = new Date(a.date);
                    const date = getDayMonthDateStr(tempDate) + " " + formatAMPM(tempDate);
                
                    return (
                        <div className={styles.Announcement}> 
                            <div className={styles.top}>
                                <h1 className={styles.Title} >{title}</h1>
                                <h3 className={styles.Author} >{author} </h3>
                            </div>

                            <p className={styles.Content}>{content}</p>
                            <p className={styles.Date}>{date}</p>
                        </div>
                    )
                })}
                
            </div>
        );
     }
    
}

export default AnouncementBlock;

