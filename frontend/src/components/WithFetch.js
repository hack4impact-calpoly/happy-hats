import React, { useState, useEffect } from "react";
import moment from 'moment';

function withFetch(WrappedComponent, reqUrl, formatter = null) {
  function WithFetch(props) {
    const [data, setData] = useState([]);

    useEffect(() => {
      // setFetchData();
      mockedData();
    }, []);

    const setFetchData = async () => {
      try {
        const response = await fetch(reqUrl);
        if (!response.ok) {
          console.log(response);
          return;
        }
        const jsonResponse = await response.json();
        setData(!!formatter ? formatter(jsonResponse) : jsonResponse);
      } catch (e) {
        console.log(e);
      }
    };

    const mockedData = () => {
      switch (props.accountType) {
        case 'volunteer':
        case 'admin': {
          return {
            events: [
              {
                start: moment().toDate(),
                allDay: false,
                end: moment().add(1, "hours").toDate(),
                title: "Some title",
                resource: "test"
              },
              {
                start: moment().toDate(),
                allDay: false,
                end: moment().add(1, "hours").toDate(),
                title: "Other stuff",
                resource: "test"
              },
              {
                start: moment().add(2, "hours").toDate(),
                allDay: false,
                end: moment().add(1, "hours").toDate(),
                title: "More",
                resource: "test"
              },
            ],
          }
        }
        case 'hospital': {
          return {
            events: [
              {
                start: moment().toDate(),
                allDay: false,
                end: moment().add(1, "hours").toDate(),
                resource: "cape order"
              },
              {
                start: moment().add(1, "days").toDate(),
                allDay: false,
                end: moment().add(1, "days").toDate(),
                resource: "cape order"
              },
            ],
          }
        }
        default: {
          console.log('Invalid stuff');
          break;
        }
      }
    };

    return <WrappedComponent data={data} {...props} />;
  }

  return WithFetch;
}

export default withFetch;
