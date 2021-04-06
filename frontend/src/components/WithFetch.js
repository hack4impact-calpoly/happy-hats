import React, { useState, useEffect } from "react";
import moment from 'moment';
import { findNearestWeekday } from "../utility/date-time";

function withFetch(WrappedComponent, reqUrl, formatter = null) {
  function WithFetch(props) {
    const [data, setData] = useState([]);

    useEffect(() => {
      // setFetchData();
      setData(mockedData().events);
    }, [props.user.userType]);

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
      switch (props.user.userType) {
        case 'volunteer':
        case 'admin': {
          return {
            events: [
              {
                start: findNearestWeekday(moment().add(1, "days").toDate()),
                allDay: false,
                end: findNearestWeekday(moment().add(1, "days").add(1, "hours").toDate()),
                title: "Some title",
                description: "More info about soem of the other stuff",
                volunteers: [
                  {
                    name: 'Freddie J',
                    start: moment().add(1, "days").add(30, "minutes").toDate(),
                    end: moment().add(1, "days").add(1, "hours").toDate()
                  },
                  {
                    name: 'Freddie J Numero dos',
                    start: moment().add(1, "days").add(12, "minutes").toDate(),
                    end: moment().add(1, "days").add(72, "minutes").toDate()
                  },
                ],
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
              {
                start: moment().add(-5, "days").toDate(),
                allDay: false,
                end: moment().add(-5, "days").add(1, "hours").toDate(),
                title: "Some title",
                description: "More info about soem of the other stuff",
                volunteers: [
                  {
                    name: 'Freddie J',
                    start: moment().add(1, "days").add(30, "minutes").toDate(),
                    end: moment().add(1, "days").add(1, "hours").toDate()
                  },
                  {
                    name: 'Freddie J Numero dos',
                    start: moment().add(1, "days").add(12, "minutes").toDate(),
                    end: moment().add(1, "days").add(72, "minutes").toDate()
                  },
                ],
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
          return { events: [] };
        }
      }
    };

    return <WrappedComponent data={data} {...props} />;
  }

  return WithFetch;
}

export default withFetch;
