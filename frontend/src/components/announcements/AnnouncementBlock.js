import React from "react";
import styles from "./announcement.module.css";
import { getDayMonthDateStr, formatAMPM } from "../../utility/date-time.js";
import withFetch from "../WithFetch";
import AlertDialog from './DeleteAnnouncement'
import { Link } from 'react-router-dom'


const url = "announcement";
class AnouncementBlock extends React.Component {
  render() {
    const announcementList = this.props.fetchedData;

    return (
      <div>
        {console.log(this.props)}
            {this.props.user?.role === "admin" && 
                <Link to ="/create-announcements" className={styles.createButton}> Create an Announcement</Link>}
        {announcementList &&
          announcementList.map(({
            title,
            author,
            content,
            date,
          }, index) => {
            const tempDate = new Date(date);
            date = getDayMonthDateStr(tempDate) + " " + formatAMPM(tempDate);

            return (
              <div className={styles.Announcement} key={`announcement-${index}`}>
                <div className={styles.top}>
                  <div className={styles.right}>
                  {this.props.user?.role === "admin" && 
                    <AlertDialog post={announcementList[index]}/>}
                      
                    <p>  </p>
                    <h1 className={styles.Title}>{title}</h1>
                  </div>
                  <h3 className={styles.Author}>{author} </h3>
                </div>

                <p className={styles.Content}>{content}</p>
                <p className={styles.Date}>{date}</p>
              </div>
            );
          })}
      </div>
    );
  }
}

const formatterFn = (data) => {
  return data?.reverse();
};

export default withFetch(AnouncementBlock, url, {
  formatter: formatterFn,
  withAuth: true,
});
