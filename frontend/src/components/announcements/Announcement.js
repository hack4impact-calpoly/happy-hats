import React, {useState} from 'react';
import styles from "./announcement.module.css"
import { Link } from 'react-router-dom'

function Announcement(props) {

    return(
        <div>
            <div className={styles.header}>
                <h1 className={styles.AnnouncementTitle} > Accouncements</h1>
                <Link to ="/create-announcements" className={styles.createButton}> Create an Announcement</Link>
            </div>
        </div>
    );
}

export default Announcement;

