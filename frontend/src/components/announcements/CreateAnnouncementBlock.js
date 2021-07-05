import React, { useState } from 'react';
import styles from "./announcement.module.css"
import { Link } from 'react-router-dom'
import KeyboardReturnIcon from '@material-ui/icons/KeyboardReturn';
import { IconButton } from '@material-ui/core';
import { getAuthHeaderFromSession, RequestPayloadHelpers } from '../../utility/request-helpers';
import withUser from '../../store/user/WithUser';
import AnnouncementAlertSuccess from './AnnouncementAlertSuccess';
import AnnouncementAlertFailure from './AnnouncementAlertFailure';


function CreateAnnouncementBlock(props) {
    const [annoucment, setAnnoucement] = useState(
        {
            title: '',
            content: '',
            author: '',
            date: ''
        }
    );

    const [submitAnnouncement, showSubmitAnnouncement] = useState(false);
    const [submitAnnouncementError, showSubmitAnnouncementError] = useState(false);

    function handleChange(event) {
        const { name, value } = event.target;
        if (name === "content") {
            setAnnoucement(
                { title: annoucment['title'], content: value, author: annoucment["author"] }
            );
        } else if (name === "title") {
            setAnnoucement(
                { title: value, content: annoucment['content'], author: annoucment["author"] }
            );
        } else {
            setAnnoucement(
                { title: annoucment['title'], content: annoucment['content'], author: value }
            );
        }
    }

    async function submitForm() {
        const aData = {
            "title": document.getElementById('title').value,
            "content": document.getElementById('content').value,
            "author": document.getElementById('author').value,
            "date": new Date()
        }

        if (aData.title !== '' && aData.content !== '' && aData.author !== '') {
            try {
                const resp = await RequestPayloadHelpers.makeRequest('announcement', 'POST', aData, getAuthHeaderFromSession(props.user.cognitoSession));
                if (!resp || !resp.ok) {
                    throw new Error('Error occurred posting Announcement');
                } else {
                    showSubmitAnnouncement(true)
                }
            } catch (error) {
                console.error(error);
            }
            setAnnoucement({ title: '', content: '', id: '', author: '', date: '' });
        } else {
            showSubmitAnnouncementError(true)
        }
    }


    return (
        <>
            <AnnouncementAlertSuccess submitAnnouncement={submitAnnouncement} setSubmitAnnouncement={showSubmitAnnouncement} title="Announcement Successfully Posted" />
            <AnnouncementAlertFailure submitAnnouncementError={submitAnnouncementError} showSubmitAnnouncementError={showSubmitAnnouncementError}
                title="Please fill all fields before submission." />
            <h1 className={styles.AnnouncementTitle} > Create Announcements</h1>
            <IconButton className={styles.returnIcon}
                component={Link}
                to="/announcements" >
                <KeyboardReturnIcon className={styles.return} />
            </IconButton>
            <div className={styles.MakeAnnouncementBlock} >
                <h1 className={styles.MakeAnnouncementTitle} > Make an Announcement</h1>
                <div className={styles.create}>
                    <label className={styles.formLabel} htmlFor="title">Title: </label>
                    <textarea className={styles.contentBox}
                        name="title"
                        id="title"
                        value={annoucment.title}
                        onChange={handleChange}
                        rows={1}
                        cols={75} />

                    <label className={styles.formLabel} htmlFor="author">Publisher: </label>
                    <textarea className={styles.contentBox}
                        name="author"
                        id="author"
                        value={annoucment.author}
                        onChange={handleChange}
                        rows={1}
                        cols={75} />

                    <label className={styles.formLabel} htmlFor="content">Message: </label>
                    <textarea className={styles.contentBox}
                        name="content"
                        id="content"
                        value={annoucment.content}
                        onChange={handleChange}
                        rows={8}
                        cols={75} />
                    <input className={styles.submitButton} type="button" value="Submit Announcement" onClick={submitForm} />
                </div>
            </div>
        </>
    );
}

export default withUser(CreateAnnouncementBlock);