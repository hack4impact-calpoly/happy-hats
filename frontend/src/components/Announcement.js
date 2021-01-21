import React, {useState} from 'react';
import styles from '../styles/announcement.module.css'

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
        //props.handleSubmit(annoucment); Need to connect to backend
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

                <label htmlFor="content">Annoucement Description</label>
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

export default Announcement

