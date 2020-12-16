import React from "react";
import {
  Container,
  Card,
  Row,
  Col,
  Accordion,
  Button,
  ButtonGroup,
  Form, Tabs, Tab, Alert
} from "react-bootstrap";
import API from "../../api/api";
import Jumbotron from "../../assets/edit.jpg";
import TimeField from 'react-simple-timefield';

const options = [
  {
    label: "Mon",
    value: "Mon"
  }, {
    label: "Tue",
    value: "Tue"
  }, {
    label: "Wed",
    value: "Wed"
  }, {
    label: "Thu",
    value: "Thu"
  }, {
    label: "Fri",
    value: "Fri"
  }
];

class ModifyLecture extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      Years: [
        {
          SubjectId: 1,
          SubjectName: "1st Year"
        }, {
          SubjectId: 2,
          SubjectName: "2nd Year"
        }, {
          SubjectId: 3,
          SubjectName: "3rd Year"
        }, {
          SubjectId: 4,
          SubjectName: "4th Year"
        }, {
          SubjectId: 5,
          SubjectName: "5th Year"
        }
      ],
      delete: "del",
      checkedCourses: [],
      students: [],
      loading: true,
      refresh: false,
      serverErr: false,
      lectures: [],
      filteredLec1: [],
      filteredLec2: [],
      allChecked: false,
      changeYear: false,
      year: "del",
      weekDay: null,
      Time1: null,
      Time2: null,
      Class: null,
      Capacity: null,
      disabled: true,
      scId: null,
      tabModality:'modality'
    };
  }

  deleteCourse(id) {
    let lectures = this
      .state
      .lectures
      .filter(lectures => {
        return lectures !== id
      });
    this.setState({lectures: lectures});
  }
setModality(val){
    this.setState({tabModality:val})
}
  componentDidMount() {
    API
      .getOfficerSchedule()
      .then((res) => {
        if (this.state.changeYear === true) {
          this.setState({lectures: this.state.filteredLec1})
          this.setState({filteredLec2: res})
          this.setState({ checkedCourses: []})
          this.changeYear(this.state.year)
        } else {
          this.setState({lectures: res});
          this.setState({filteredLec2: res})
        }
      })
      .catch((err) => {
        if (err.status === 401) {
        }
        this.setState({serverErr: true, loading: null});
      });
  }

  changeYear = (id) => {

    if (id === "del") {
      this.setState({changeYear: true, allChecked: false,checkedCourses: [],lectures: this.state.filteredLec2, year: "del"});
    } else {
      this.setState({changeYear: true, allChecked: false,checkedCourses: [], year: id, filteredLec2: this.state.filteredLec2});

      let filteredLec = this.state.filteredLec2.filter(item => {
          return item.Year === id
        });
      this.setState({lectures: filteredLec, filteredLec1: filteredLec});
    }
  }

  selectAll=(event)=>{  
     const isChecked = event.target.checked; 
     this.setState({allChecked: !this.state.allChecked})
     if (isChecked){
      if(this.state.year==="del"){ 
        this.setState({checkedCourses: this.state.filteredLec2});  
      }
      else{
        this.setState({checkedCourses: this.state.filteredLec1});  
      }
     } 
  else {     
        this.setState({checkedCourses: []}); 
          } 
        }

  chooseCourse = (event, id, subjId, modality) => {
    const isChecked = event.target.checked;
    let test = {
      id: id,
      SubjectId: subjId,
      Modality: modality
    }
    if (isChecked) {
      let courses = [...this.state.checkedCourses,test];
      this.setState({checkedCourses: courses});
    } else {
      let courses = this
        .state
        .checkedCourses
        .filter(courses => {
          return courses.id !== test.id
        });
      this.setState({checkedCourses: courses});
    }
  }


  changeModality = (courses) => {
    let l=courses;
    if(this.state.allChecked){
      l=this.state.filteredLec2
    }
    API.changeModalityCourse(l).then(() => {
        this.setState({changeYear: true, confirm:true})
        this.componentDidMount();
      })
      .catch((err) => {
        if (err.status === 401) {
          this
            .props
            .notLoggedUser();
        }
      });
  }
confirmMessage(){
    this.setState({confirm:false})
}

  setSelectedOptionWeek = (e) => {
    this.setState({weekDay: e})
  }
  setSelectedOptionTime1 = (e) => {
    this.setState({Time1: e})
  }
  setSelectedOptionTime2 = (e) => {
    this.setState({Time2: e})
  }
  setSelectedOptionClass = (e) => {
    this.setState({Class: e})
  }
  setSelectedOptionCapacity = (e) => {
    this.setState({Capacity: e})
  }
  enableEdit(sc) {
    this
      .state
      .lectures
      .map((e) => {
        {
          e
            .schedules
            .map((scNew) => {
              if (scNew.ScheduleId === sc.ScheduleId) {
                this.setState({scId: sc.ScheduleId, disabled: false,
                Class: sc.Class, Time1: sc.Hour.substring(0, 5), 
              Time2: sc.Hour.substring(6, 11),
            Capacity: sc.Capacity, weekDay: sc.Day});
              }
            })
        }

      })

  }
  disableEdit() {
    this.setState({scId: null})
  }

  SaveEdit(subId, CourId){
  let a={
    "SubjectId": subId,
    "ScheduleId": CourId,
    "Class": this.state.Class,
    "Day":  this.state.weekDay,
    "Capacity":  this.state.Capacity,
    "Hour": this.state.Time1+"-"+this.state.Time2
  }
  API.changeSchedule(a).then((res) => {      
    {this.state.lectures.map((e, id) => {
      return(
        <>
        {e.schedules.map((sc, id) => {
            return(
              <>
              {sc.ScheduleId===CourId &&
              this.setState({weekDay: sc.Day})
              }
              </>
            )
        })}
        </>)
      })}
      this.componentDidMount();
      // this.changeYear(this.state.currYear);   

    })
    .catch((err) => {
      if (err.status === 401) {
        this.props.notLoggedUser();
      }
    });
    this.setState({scId: null})
  }


  render() {
    return ( <> 
    <Container fluid data-testid="lecturetable" className={"lectureTable"}>
      <Row className="justify-content-md-center below-nav">
        <h3 className={"headerLectureList"}>List of Courses:
        </h3>
      </Row>
      < Row className="justify-content-md-center">
        <Col className="col-2 justify-content-md-center">
          <h3>Years</h3>{this.state.refresh}
          <ButtonGroup vertical>
            {this
              .state
              .Years
              .map((e) => {
                // console.log(e)
                return ( <> <Button
                  variant="primary"
                  onClick={() => this.changeYear(e.SubjectId)}
                  data-testid="handlelecture-button">
                  {e.SubjectName}
                </Button> < br /> </>);
              })}
            <Button
              variant={"danger"}
              onClick={(e) => {
              this.changeYear(this.state.delete);
            }}
              data-testid="handlelecture-del-button">
              Cancel filters
            </Button>
          </ButtonGroup>
          <br></br>
          <br></br>
          <br></br>
        </Col>


        < Col className="col-8">
          <Tabs id="manager-tab"
                activeKey={ this.state.modality }
                onSelect={ (k) => {
                  this.setModality(k);
                } }>
            <Tab eventKey="modality" title="Change Modality" tabClassName={ "tab-label" }>

                {this.state.confirm &&<><Row className="below-tab justify-content-md-center" >
                  <h6>
                    <Alert variant={"success"}>
                    <Row className={'justify-content-md-center  border-bottom  pb-3 pt-2 mb-0'}>Courses modality correctly changed!</Row>
                  <Button
                      block
                      variant="info"

                      onClick={() => this.confirmMessage()}>
                    <h6>Ok</h6>
                  </Button></Alert></h6> </Row></>
                }
                {!this.state.confirm && this.state.checkedCourses.length > 0 &&<><Row className="below-tab" data-testid="lecture-s-row">
                  <Button
                      block
                      variant="info"
                      data-testid="handlelecture-button14"
                      onClick={() => this.changeModality(this.state.checkedCourses)}>
                    <h6>Change Modality for selected courses</h6>
                  </Button></Row></>
                }


              <Row className="border-bottom  pb-3 pt-2 mb-0" data-testid="lecture-s-row">
                <Col>
                <h6><Alert variant={"info"} className={"below-tab"}>
                  <Form.Check checked={this.state.allChecked} onChange={this.selectAll}   className="my-1 mr-sm-2" label="Select all courses" key={1} type="checkbox"/>
                  </Alert> </h6>
                </Col>
              </Row>

              {this
                  .state
                  .lectures
                  .map((e, id) => {

                    return (<><Card data-testid="card-toggle">

                      <Card.Header>
                        <Row className="border-bottom  pb-3 pt-2 mb-0" data-testid="lecture-s-row">
                          <Form>
                            <Form.Group controlId="formBasicCheckbox">

                              <Form.Check
                                  checked={this.state.allChecked || this.state.checkedCourses.some(item=>item.id===id)}
                                  key={id + 1}
                                  type="checkbox"
                                  onChange={event => this.chooseCourse(event, id, e.SubjectId, e.Modality)}/>
                            </Form.Group>
                          </Form>
                          <Col xs={3} className={'align-content-left'}>

                            <h5>{e.SubjectId}</h5>

                          </Col>
                          <Col xs={6} className={'align-content-center'}>
                            <h5 className="subjectName">
                              <b></b>{e.SubjName}</h5>

                            <h5><b>{e.Modality}</b></h5>
                          </Col>
                          <Col xs={2} className={'align-content-right'}>

                            <h5>
                              <b>Year:</b>
                              {e.Year}
                            </h5>

                          </Col>
                        </Row>
                      </Card.Header>
                    </Card>
                    </>)})}

            </Tab>


            <Tab eventKey="schedule" title="Change Schedule" tabClassName={ "tab-label" }>
          <Accordion className="box-shadow" defaultActiveKey="0">
            {this
              .state
              .lectures
              .map((e, id) => {

                return (<>
                    <Card data-testid="card-toggle">
                      <Accordion.Toggle className="box-shadow" as={Card.Header} eventKey={id+1} data-testid="card-toggle">
                        <Row className="border-bottom  pb-3 pt-2 mb-0" data-testid="lecture-s-row">

                            <Col xs={3} className={'align-content-left'}>
                              <h5>{e.SubjectId}</h5>

                            </Col>
                            <Col xs={6} className={'align-content-center'}>
                                <h5 className="subjectName">
                                  <b></b>{e.SubjName}</h5>
                            </Col>
                          <Col xs={2} className={'align-content-right'}>
                                <h5>
                                  <b >Year:</b>
                                  {e.Year}
                                </h5>
                            </Col>
                          </Row>

                      </Accordion.Toggle>

                      <Accordion.Collapse eventKey={id+1}>
                        <Card.Body>
                          <Row>
                          <Col xs={6}>
                          <Row>
                            <h5>
                              <b>Year:</b>
                              {e.Year}
                            </h5>
                          </Row>
                          <Row>
                            <h5>
                              <b>Semester:</b>
                              {e.Semester}</h5>
                          </Row>
                          <Row>
                            <h5>
                              <b>Teacher:</b>
                              {e.Tname}
                              {e.Tsurname}</h5>
                          </Row>
                          <Row>
                            <h5>
                              <b>Modality:</b>{this.state.refresh} {e.Modality}</h5>
                          </Row>
                          </Col>

                          <Col xs={5} className="date">
                          <h5>
                            <b>Course Schedule</b>

                            <div className="select-container">

                              {e.schedules.map((sc, id) => {
                                  let hr = sc
                                    .Hour
                                    .substring(0, 5);
                                  let min = sc
                                    .Hour
                                    .substring(6, 11);
                                  return ( <> <Card
                                    bg='light'
                                    style={{
                                    float: "left"
                                  }}>
                                    <Card.Body>
                                      <b>Time:</b>
                                      <select
                                        disabled={sc.ScheduleId===this.state.scId ? false : true}
                                        style={{
                                        border: '1px solid #666',
                                        fontSize: 20,
                                        width: 100,
                                        padding: '2px 4px',
                                        margin: '2px',
                                        color: '#333',
                                        borderRadius: 10
                                      }}
                                        id={id}
                                        defaultValue={sc.Day}
                                        onChange={e => this.setSelectedOptionWeek(e.target.value)}>
                                        {options.map((option) => {
                                          return ( <> <option key={option.value} value={option.value}>
                                            {option.label}
                                          </option> 
                                          </>
                                        );
                                      })}
                                      </select>
                                      <TimeField
                                       onChange={e => this.setSelectedOptionTime1(e.target.value)}
                                        disabled={sc.ScheduleId===this.state.scId ? false : true}
                                        style={{
                                        border: '1px solid #666',
                                        fontSize: 20,
                                        width: 80,
                                        padding: '2px 4px',
                                        margin: '2px',
                                        color: '#333',
                                        borderRadius: 10
                                      }}
                                        value={hr}></TimeField>-
                                      <TimeField
                                       onChange={e => this.setSelectedOptionTime2(e.target.value)}
                                        disabled={sc.ScheduleId===this.state.scId ? false : true}
                                        style={{
                                        border: '1px solid #666',
                                        fontSize: 20,
                                        width: 80,
                                        padding: '2px 4px',
                                        margin: '2px',
                                        color: '#333',
                                        borderRadius: 12
                                      }}
                                        value={min}></TimeField>
                                      <br></br>
                                      <b>Class:</b>
                                      <input
                                       onChange={e => this.setSelectedOptionClass(e.target.value)}
                                        disabled={sc.ScheduleId===this.state.scId ? false : true}
                                        style={{
                                        border: '1px solid #666',
                                        fontSize: 20,
                                        width: 90,
                                        padding: '2px 4px',
                                        margin: '2px',
                                        color: '#333',
                                        borderRadius: 10
                                      }}
                                        defaultValue={sc.Class}
                                        type="text"
                                        id="class"
                                        size="5"/>
                                      <br></br>
                                      <b>Capacity:</b>
                                      <input
                                       defaultValue={sc.Capacity}
                                       onChange={e => this.setSelectedOptionCapacity(e.target.value)}
                                        disabled={sc.ScheduleId===this.state.scId ? false : true}
                                        style={{
                                        border: '1px solid #666',
                                        fontSize: 20,
                                        width: 90,
                                        padding: '2px 4px',
                                        margin: '2px',
                                        color: '#333',
                                        borderRadius: 10
                                      }}
                                        type="number"
                                        id="capacity"
                                        size="5"/>

                                      <Button
                                        onClick={() => this.enableEdit(sc)}
                                        style={{
                                        height: "1.6rem",
                                        position: 'absolute',
                                        right: "0",
                                        top: "0"
                                      }}
                                        variant="light">
                                        <img
                                          style={{
                                          height: "1.6rem",
                                          position: 'absolute',
                                          right: "0",
                                          top: "0"
                                        }}
                                          src={Jumbotron}
                                          alt="my image"/>
                                      </Button>
                                      <br></br>
                                      {sc.ScheduleId === this.state.scId && <Button
                                        style={{
                                        float: 'right',
                                        margin: "1px"
                                      }}
                                      onClick={() => this.SaveEdit(e.SubjectId, sc.ScheduleId)}
                                        size="sm"
                                        variant="success">Save</Button>}
                                      {sc.ScheduleId === this.state.scId && <Button
                                        onClick={() => this.disableEdit()}
                                        style={{
                                        float: 'right',
                                        margin: "1px"
                                      }}
                                        size="sm"
                                        variant="danger">Cancel</Button>}
                                    </Card.Body>
                                  </Card>
                                  </>
                                  );
                                })}
                            </div>
                          </h5>
                        </Col>
                          </Row>
                        </Card.Body>
                      </Accordion.Collapse>
                    </Card></>
                );
              })}
          </Accordion>
            </Tab>
          </Tabs>
        </Col>
      </Row >
    </Container> 
    </>
    );
  }
}
export default ModifyLecture;