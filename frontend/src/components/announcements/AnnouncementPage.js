import React from "react";
import Announcement from './Announcement';
import AnnouncementBlock from './AnnouncementBlock';

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



