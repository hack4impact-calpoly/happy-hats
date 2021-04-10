import React, {useState} from 'react';
import styles from "./announcement.module.css"

function Announcement(props) {
    const [annoucment, setAnnoucement] = useState(
        {
            title: '',
            content: '',
            id:'',
            author: '',
            date: ''
        }
    );

    function handleChange(event) {
        const {name, value} = event.target;
        if (name === "content") {
            setAnnoucement(
                {title: annoucment['title'], content: value}
            );
        } else {
            setAnnoucement(
                {title: value, content: annoucment['content']}
            );
        }
    }

    function submitForm() {
        console.log("In SubmitForm")
        const aData = {
            "title": document.getElementById('title').value,
            "content": document.getElementById('content').value,
            "id":'',
            "author": '',
        }
        console.log(aData)

        try {
            fetch("http://localhost:3001/api/announcement", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }, 
                body: JSON.stringify(aData) 
            });

        } catch (error) {
            console.error(error)
        }

        //Left blank to create a hole to be updated later
        setAnnoucement({title: '', content: '', id:'', author: '', date: ''});

    }

    return(
        <div>
            <h1 className={styles.AnnouncementTitle} > Accouncements</h1>

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

export default Announcement;

