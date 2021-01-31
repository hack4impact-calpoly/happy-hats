import React from "react";
import '../styles/announcement.css';
import Announcement from '../components/Announcement';
import AnnouncementBlock from '../components/AnnouncementBlock';

class AnnouncementPage extends React.Component {
    constructor(props) {
        super(props);
    }
	render(){
        
		return(
            <div>
                <Announcement />
                <AnnouncementBlock />
            </div>
		);
	}
}

export default AnnouncementPage



