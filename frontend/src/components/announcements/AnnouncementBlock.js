import React, {useState} from 'react';
import dateFormat from 'dateformat';
import styles from "./announcement.module.css"
const url = "http://localhost:3001/api/announcement"


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
        .then(data => this.setState({ announcementList : data}));
        
    }

    render(){
        const announcementCount = 2;
        var count = 0;
        return(
            <div >
                {this.state.announcementList && this.state.announcementList.map(a => {
                    const title = a.title;
                    const author = a.author;
                    const content = a.content;
                    const date = dateFormat(a.date, "mmmm dS, hh:mm");
                
                    count ++;
    
                    if (count <= announcementCount) {
                        return (
                            <div className={styles.Announcement}> 
                                <div id ="top3rd">
                                    <h1>{title}</h1>
                                    <h3>{author} </h3>
                                </div>
                                    <p id="content">{content}</p>
                                    <p id="date">{date}</p>
                            </div>
                        )
                    }
                })}
                
            </div>
        );
     }
    
}

export default AnouncementBlock;

