import React, {useState} from 'react';
import styles from "./announcement.module.css"
import { Link } from 'react-router-dom'
import KeyboardReturnIcon from '@material-ui/icons/KeyboardReturn';
import { IconButton } from '@material-ui/core';

function CreateAnnouncementBlock(props) {
    const [annoucment, setAnnoucement] = useState(
        {
            title: '',
            content: '',
            author: '',
            date: ''
        }
    );

    function handleChange(event) {
        const {name, value} = event.target;
        if (name === "content") {
            setAnnoucement(
                {title: annoucment['title'], content: value, author: annoucment["author"]}
            );
        } else if (name === "title") {
            setAnnoucement(
                {title: value, content: annoucment['content'], author: annoucment["author"] }
            );
        } else {
            setAnnoucement(
                {title: annoucment['title'], content: annoucment['content'], author: value }
            );
        }
    }

    function submitForm() {
        console.log("In SubmitForm")
        const aData = {
    
            "title": document.getElementById('title').value,
            "content": document.getElementById('content').value,
            "author": document.getElementById('author').value,
            "date": new Date()
        }
           
        if (aData.title !== '' && aData.content !== '' && aData.author !== '') {
            try {
                fetch("http://localhost:3001/api/announcement", {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }, 
                    body: JSON.stringify(aData) 
                });
                alert("Announcement Successfully Posted")
            } catch (error) {
                console.error(error)
            }

            //Left blank to create a hole to be updated later
            setAnnoucement({title: '', content: '', id:'', author: '', date: ''});
        } else {
            alert("Please Fill All Fields before Submitting Announcement.");
        }
    }


    return(
        <div>
            <h1 className={styles.AnnouncementTitle} > Create Accouncements</h1>
            <IconButton className={styles.returnIcon}
                component={ Link } 
                to ="/announcements" >
                <KeyboardReturnIcon className={styles.return}/>
            </IconButton>
            <div className={styles.MakeAnnouncementBlock} >
                <h1 className={styles.MakeAnnouncementTitle} > Make an Accouncement</h1>
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
        </div>
    );
}

export default CreateAnnouncementBlock;