import { Link } from "react-router-dom";
import './Home.css';
import { useState, useEffect } from 'react'

export default function Home(props){
    const [pageContent, setPageContent] = useState()

    useEffect(() => {
        if(props.role === "admin"){
            setPageContent(<div style={{display: 'flex', width: '66%', justifyContent: 'center'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', width: '60%', height: '180px', flexDirection: 'column', marginTop: '80px'}}>
                    <div style={{display: 'inline-flex', justifyContent: 'space-between', width: '100%'}}>
                        <Link to="/volunteers" className='link' >
                            <button className="buttonFormat volunteer">Manage Volunteers</button>
                        </Link>
    
                        <Link to="/announcements" className='link' >
                            <button className="buttonFormat announcement">Make an Announcement</button>
                        </Link>
                    </div>
    
                    <div style={{display: 'flex', justifyContent: 'space-around'}}>
                        <Link to="/calendar" className='link' >
                            <button className="buttonFormat calendar">Manage Calendar</button>
                        </Link>
                    </div>
    
                </div>
            </div>)
    
        }else if(props.role === "hospital"){
            setPageContent(<h1>Hospital</h1>)
        }else{
            setPageContent(<h1>User</h1>)
        }
    })

    return (
        <div className="Home" style={{paddingLeft: '8%', paddingTop: '90px'}}>
            
            <h1 className='welcomeMsg'>Welcome, {props.name}</h1>
            
            {pageContent}
            
        </div>
    )
}