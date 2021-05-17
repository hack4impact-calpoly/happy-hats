import './StandardPage.css';

import defaultBackground from "../../imgs/bg.png";
import calendarBackground from '../../imgs/bg_calendar.png';
import announcementBackground from '../../imgs/bg_announcement.png';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

function StandardPage(props) {
  const location = useLocation();
  const [backgroundImg, setBackgroundImg] = useState(defaultBackground);

  const setBackground = (basePath) => {
    switch (basePath) {
      case '/calendar':
        setBackgroundImg(calendarBackground);
        break;
      case '/announcements':
      case '/create-announcements':
        setBackgroundImg(announcementBackground);
        break;
      default:
        setBackgroundImg(defaultBackground);
        break;
    }
  };

  useEffect(() => {
    setBackground(location.pathname);
  }, [location]);

  return (
    <div style={{'backgroundImage': `url(${backgroundImg})`}} className="page">
      {props.children}
    </div>
  );
}

export default StandardPage;
