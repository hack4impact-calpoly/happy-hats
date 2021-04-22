import React from "react";
import styles from "./announcement.module.css";
import { getDayMonthDateStr, formatAMPM } from "../../utility/date-time.js";
import withFetch from "../WithFetch";
import { confirmAlert } from 'react-confirm-alert'; // Import
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import css

const url = "announcement";
class AnouncementBlock extends React.Component {

  render() {
    const announcementList = this.props.fetchedData;

    return (
      <div>
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
                  <h1 className={styles.Title}>{title}</h1>
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

export default withFetch(AnouncementBlock, url, formatterFn);
