import React from 'react';
import styles from "./announcement.module.css"

function Announcement() {

    return(
        <div className={styles.header}>
            <h1 className={styles.AnnouncementTitle} > Announcements </h1>
         </div>
    );
}

export default Announcement;

