import React, {useState} from 'react';

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
        return(
            <div id="announce">
                {this.state.announcementList && this.state.announcementList.map(a => {
                    const title = a.title;
                    const author = a.author;
                    const content = a.content;
    
                    return (
                        <div id="block"> 
                            <h1>{title}</h1>
                            <h3>{author} </h3>
                            <p>{content}</p>
                        </div>
                    )
                })}
                
            </div>
        );
     }
    
}

export default AnouncementBlock;

