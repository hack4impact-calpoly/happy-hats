import React, {useState} from 'react';
import styles from '../styles/announcement.module.css'

function Announcement(props) {
    const [annoucment, setAnnoucement] = useState(
        {
            title: '',
            content: '',
            id:''
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
        setAnnoucement({title: '', content: '', id:''});
    }

    return(
        <div>
            <h1>Make An Accouncement</h1>
            <form id="form">
                <label htmlFor="title">Annoucement Title</label>
                <input 
                    type="text"
                    name="title"
                    id="title"
                    value={annoucment.title}
                    onChange={handleChange} />
                <label htmlFor='content'>Annoucement Description</label>
                <input
                    type="text"
                    name="content"
                    id="content"
                    value={annoucment.content}
                    onChange={handleChange} />
                <input type="button" value="Submit Annoucement" onClick={submitForm} />
            </form>
        </div>
    );
}

export default Announcement

