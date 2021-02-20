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
        
        const aData = {
            "title": document.getElementById('title').value,
            "content": document.getElementById('content').value,
            "id":'',
            "author": '',
            "date": new Date()
        }
        console.log(aData)

        try {
            fetch('http://localhost:3001/api/announcement', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }, 
                body: JSON.stringify(aData) 
            });

        } catch (error) {
            console.error(error)
        }

        setAnnoucement({title: '', content: '', id:'', author: '', date: ''});

    }

    return(
        <div>
            <h1>Make An Accouncement</h1>

            <div className={styles.create}>
                <label htmlFor="title">Annoucement Title</label>
                <textarea className={styles.titleBox}
                    name="title"
                    id="title"
                    value={annoucment.title}
                    onChange={handleChange}
                    rows={2}
                    cols={75} />

                <label htmlFor="content">Announcement Description</label>
                <textarea
                    name="content"
                    id="content"
                    value={annoucment.content}
                    onChange={handleChange}
                    rows={10}
                    cols={75} />    

                <input type="button" value="Submit Annoucement" onClick={submitForm} />
            </div>
        </div>
    );
}

export default Announcement;

