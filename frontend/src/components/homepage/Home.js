import { Link } from "react-router-dom";
import './Home.css';
import { useState, useEffect } from 'react'
import  { Redirect } from 'react-router-dom'

export default function Home(props){
    const [pageContent, setPageContent] = useState()
    const [layerContent, setLayerContent] = useState(
        <></>
    )

    useEffect(() => {

        // 1. Retrieve Google ID
        var role = props.user.role
        var loggedIn = false

        if(role == null){
            console.log(role)
            setLayerContent(<Redirect to='/login' />)

        }else{
            setLayerContent(
            <div className="Home" style={{paddingLeft: '8%', paddingTop: '90px'}}>

                <h1 className='welcomeMsg'>Welcome, {props.name}</h1>

                {pageContent}

            </div>)

            loggedIn = true
        }
        
        if(role === "admin" && loggedIn){
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

        }else if(role === "hospital" && loggedIn){
            setPageContent(<div style={{display: 'flex', width: '66%', justifyContent: 'center'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', width: '60%', height: '180px', flexDirection: 'column', marginTop: '80px'}}>
                    <div style={{display: 'inline-flex', justifyContent: 'space-between', width: '100%'}}>
                        <Link to="/orders" className='link' >
                            <button className="buttonFormat order">Manage Cape Orders</button>
                        </Link>

                        <Link to="/announcements" className='link' >
                            <button className="buttonFormat announcement">View Announcements</button>
                        </Link>
                    </div>

                </div>
            </div>)

        }else if(role === 'user' && loggedIn){
            setPageContent(<div style={{display: 'flex', width: '66%', justifyContent: 'center'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', width: '60%', height: '180px', flexDirection: 'column', marginTop: '80px'}}>
                    <div style={{display: 'inline-flex', justifyContent: 'space-between', width: '100%'}}>
                        <Link to="/calendar" className='link' >
                            <button className="buttonFormat calendar">Manage Shifts</button>
                        </Link>

                        <Link to="/announcements" className='link' >
                            <button className="buttonFormat announcement">View Announcements</button>
                        </Link>
                    </div>

                </div>
            </div>)
        }
    }, [props.user.role])

    return (
        <>
        {layerContent}
        </>
    )
}
