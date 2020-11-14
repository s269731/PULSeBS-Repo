import React, {Component} from 'react';
import {BigCalendar, Calendar, momentLocalizer} from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/nb';
import '../../assets/sass/styles.scss'
import API from "../../api/api";
import {Button,Popover, OverlayTrigger} from 'react-bootstrap';
const localizer = momentLocalizer(moment);

const popover = (
  <Popover id="popover-basic">
    <Popover.Title as="h3">Cancel reservation</Popover.Title>
    <Popover.Content>
     for <strong>canceling</strong> course. Click here:
     <Button variant='danger'>Cancel</Button>
    </Popover.Content>
  </Popover>
);


const Event = ({event}) => (
  <OverlayTrigger trigger="click" placement="top" overlay={popover}>
    <Button variant='info'
    // style={{ color:"#138D75"}}
    >{event.title} <br/> Lecture Room:{event.room}<br/> Teacher: {event.instructor}</Button>
  </OverlayTrigger>
);

export default class NewCalendarView extends Component {
  componentDidMount() {
    API.getLectures().then((res)=>{
      console.log(res)
       const cal=res.map((lec)=>{
         let lecture= {
           instructor: lec.teacherName,
          room: lec.room,
          title: lec.subject,
          startDate : moment(lec.date+"T"+lec.hour).toDate(),
          endDate:  moment(lec.date+"T"+lec.hour+"-02:00").toDate()
          }   
          return lecture;
      })
          this.setState({events:cal,loading:null,serverErr:null})
    }).catch((err)=>{
        this.setState({serverErr:true,loading:null})
    })
}
  constructor(props) {
    super(props);

    this.state = {
       events: []
    }
  }

  render() {
    return (
      <div style={{
        flex: 1
      }}>
        {console.log(this.state.events)}

        <Calendar
          localizer={localizer}
          events={this.state.events}
          startAccessor='startDate'
          endAccessor='endDate'
          defaultView='week'
          views={['month', 'week', 'day']}
          min={new Date(2020, 1, 0, 7, 0, 0)} 
          max={new Date(2022, 1, 0, 21, 0, 0)}
          culture='en'
          components={{
            event: Event
          }}

          />
      </div>
    );
  }
}