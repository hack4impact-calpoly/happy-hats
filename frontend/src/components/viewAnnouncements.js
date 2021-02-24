import React, {useState, useEffect} from 'react';
import axios from 'axios';

function viewAnnouncement(props) {
    const [annoucements, setAnnoucements] = useState([])

    useEffect(() => {
        fetchMostRecent().then(result => {
            if (result)
                setAnnoucements(result);
        });
    }, []);

    async function fetchMostRecent() {
        try {
            const response = await axios.get(); //insert database??
            return response.data;
        }

        catch (error) {
            console.log(error);
            return false;
        }
    }

    return(
        <div>
            <h1>Most Recent Annoucements</h1>
        </div>
    );
}

export default viewAnnouncement