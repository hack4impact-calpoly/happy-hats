import React from "react";
import Announcement from "./Announcement";
import AnnouncementBlock from "./AnnouncementBlock";

class AnnouncementPage extends React.Component {
  render() {
    return (
      <>
        <Announcement />
        <AnnouncementBlock />
      </>
    );
  }
}

export default AnnouncementPage;
