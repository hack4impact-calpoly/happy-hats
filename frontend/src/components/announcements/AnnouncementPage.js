import React from "react";
import Announcement from "./Announcement";
import AnnouncementBlock from "./AnnouncementBlock";
import Navbar from "../Navbar";

class AnnouncementPage extends React.Component {
  render() {
    return (
      <div>
        <Navbar />
        <Announcement />
        <AnnouncementBlock />
      </div>
    );
  }
}

export default AnnouncementPage;
