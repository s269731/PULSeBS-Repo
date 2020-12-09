import React, {Component} from 'react';
import {
  Row,
  Button, Container, Tab, Tabs, Alert
  } from 'react-bootstrap'

import Jumbotron from "../../assets/graduated.png";
import Jumbotron1 from "../../assets/teacher.png";
import Jumbotron2 from "../../assets/education.png";
import Jumbotron3 from "../../assets/language.png";
import Jumbotron4 from "../../assets/classroom.png";
import AddStudent from "./AddStudent";
import ModifyLecture from "./ModifyLecture";
import API from "../../api/api";




import { withRouter } from "react-router-dom";


class OfficerPage extends Component {

  constructor(props) {
    super(props);
    this.state={
      loading: true, 
      serverErr: null ,
      modality:"lectures", 
      noLect:false, 
      noSubj:false,
      routeChange: null,
      lects: [
        {
          lectureId: 4,
          subjectName: "Web Applications II",
          teacherName: "Mario Rossi",
          dateHour: "2020-12-07T17:30:00.000Z",
          modality: "In person",
          className: "12A",
          capacity: 25,
          bookedPeople: 9,
          booked: 2
          }
      ]
    }
    this.cancelLecture = this.cancelLecture.bind(this);
    this.changeModalityLecture = this.changeModalityLecture.bind(this);
}
setModality(k){
  this.setState({modality:k})
}
cancelLecture(id) {
API.deleteLectureByTeacher(id)
  .then((res) => {
    this.getLectures();
  })
  .catch((err) => {
    console.log(err.status);
    if (err.status === 401) {
    }
    this.setState({ serverErr: true });
  });
}
changeModalityLecture(id){
  API.changeModalityLecture(id)
      .then((res) => {
          this.getLectures();
      })
      .catch((err) => {
          console.log(err.status);
          if (err.status === 401) {
              // this.props.notLoggedUser();
          }
          this.setState({ serverErr: true });
      });
}
getLectures() {
API.getLecturesTeacher()
  .then((lects) => {
      console.log(lects)
    API.getCourses().then((subs)=>{
        console.log(subs)
        console.log(lects.length)
        console.log(subs)
        if(subs.errors){
            this.setState({
                subjects: [],
                lectures: [], loading: null,
                serverErr: null, noLect: false, noSubj:true
            })
        }
        else {
            if (lects.length > 0) {
                this.setState({
                    subjects: subs,
                    lectures: lects,
                    loading: null,
                    serverErr: null,
                    noLect: false,
                    noSubj:false
                });
            } else {
                this.setState({
                    subjects: subs,
                    lectures: [], loading: null,
                    serverErr: null, noLect: true, noSubj:false
                })
            }
        }
    })
  })
  .catch((err) => {
    console.log(err.status);
    if (err.status === 401) {
      // this.props.notLoggedUser();
    }
    this.setState({ serverErr: true, loading: null , noLect:false, noSubj:false});
  });
}
componentDidMount() {
//retrieve lectures for the teacher
this.getLectures();
}
onlyUnique(value, index, self) {
return self.indexOf(value) === index;
}


////OLD
  routeAddSt = () => {
    this.setState({
      routeChange: "S",
    })

  };
  routeAddTec = () => {
    this.setState({
      routeChange: "T"
    })

  };
  routeAddLec = () => {
    this.setState({
      routeChange: "L"
    })

  };
  routeAddCor = () => {
    this.setState({
      routeChange: "C"
    })

  };
  routeAddClass = () => {
    this.setState({
      routeChange: "Cl"
    })

  };
  render() {
    if(this.state.routeChange==="S" || this.state.routeChange==="T" ||
    this.state.routeChange==="L" || this.state.routeChange==="C" ||
    this.state.routeChange==="Cl"){ 
    return(
      <>
      <AddStudent routeChange={this.state.routeChange}/>  
      </>
    )
    }
    else{ 
    return (
      <div data-testid="officer-page">
        <Container fluid data-testid="officerC-page">
        <Tabs
            id="controlled-tab"
            activeKey={this.state.modality}
            onSelect={(k) => this.setState({modality:k})}

        >
          <Tab eventKey="lectures" title="Setup System">
          <Row className="justify-content-md-center below-nav">
                  <h1>
                    Setup System
                  </h1>
                  </Row>
                  <Row className="justify-content-md-center below-nav">
        <Button data-testid="student-upload-button" variant="light"
       >
          <img
            style={{
            height: "10rem",
            float: "left",
            margin: "20px"
          }}
            src={Jumbotron}
            alt="my image"
            onClick={this.routeAddSt}/>
            <h4>Add Students</h4></Button>

        <Button data-testid="teacher-upload-button" variant="light">
          <img
            style={{
            height: "10rem",
            float: "left",
            margin: "20px"
          }}
            src={Jumbotron1}
            alt="my image"
            onClick={this.routeAddTec}/>
             <h4>Add Teachers</h4></Button>

        <Button data-testid="lecture-upload-button" variant="light">
          <img
            style={{
            height: "10rem",
            float: "left",
            margin: "20px"
          }}
            src={Jumbotron2}
            alt="my image"
            onClick={this.routeAddLec}/>
             <h4>Add Schedules</h4></Button>

        <Button data-testid="course-upload-button" variant="light">
          <img
            style={{
            height: "10rem",
            float: "left",
            margin: "20px"
          }}
            src={Jumbotron3}
            alt="my image"
            onClick={this.routeAddCor}/>
             <h4>Add Courses</h4></Button>

        <Button data-testid="subject-upload-button" variant="light">
          <img
            style={{
            height: "10rem",
            float: "left",
            margin: "20px"
          }}
            src={Jumbotron4}
            alt="my image"
            onClick={this.routeAddClass}/>
             <h4>Add Enrollments</h4></Button>

            </Row>
            {(this.state.routeChange==="S" || this.state.routeChange==="T" || 
            this.state.routeChange==="L" || this.state.routeChange==="C" ||
            this.state.routeChange==="Cl") &&
            <AddStudent routeChange={this.state.routeChange}/>}
            </Tab>

            <Tab data-testid="calendar-tab-button" eventKey="calendar" title="Modify Lectures">

            {this.state.subjects && this.state.lectures.length>0 && !this.state.noSubj ? <ModifyLecture
                            subjects={this.state.subjects}
                            lectures={this.state.lectures}
                            cancelLecture={this.cancelLecture}
                            changeModalityLecture={this.changeModalityLecture}
                            // notLoggedUser={this.props.notLoggedUser}
                        />: <>
                            {this.state.noSubj ? 
                            <Row className="justify-content-md-center below-nav"><Alert className={"alert"} variant={"info"} data-testid={"no-courses-message"}><h4>No courses assigned to you</h4></Alert></Row>:

                            <ModifyLecture
                            subjects={this.state.subjects}
                            lectures={this.state.lectures}
                            cancelLecture={this.cancelLecture}
                            changeModalityLecture={this.changeModalityLecture}
                            // notLoggedUser={this.props.notLoggedUser}
                        />
                            // <Row className="justify-content-md-center below-nav"><Alert className={"alert"} variant={"info"} data-testid={"no-lectures-message"}><h4>You have not programmed lectures</h4></Alert></Row>
                            }
                                </>
                            }
            {/* <ModifyLecture/> */}
          </Tab>
          

            </Tabs>
        </Container>
      </div>
    );
    }
  }
}

export default withRouter(OfficerPage);
