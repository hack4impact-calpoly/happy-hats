import React from 'react';
import styles from "./announcement.module.css"

function Announcement(props) {

    return(
        <div className={styles.header}>
            <h1 className={styles.AnnouncementTitle} > Accouncements</h1>
         </div>
    );
}

export default Announcement;

