import React, {useState} from 'react';
import styles from "./announcement.module.css"
import { Link } from 'react-router-dom'

function Announcement(props) {

    return(
        <div>
            <h1 className={styles.AnnouncementTitle} > Accouncements</h1>
            <Link className="create-announcement" to ="/create-announcements" className={styles.createButton}> Create an Announcements</Link>
        </div>
    );
}

export default Announcement;

