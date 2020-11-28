import React from "react";
import  {Alert, Spinner, Container, Tabs, Tab} from "react-bootstrap";
import LectureTable from "./LectureTable.js";
import StatsPage from './StatsPage';
import API from "../../api/api";
const subjects=[
    {subjectId:1, subjectName: 'Software Engineering II'},
    {subjectId:2, subjectName: 'Software Engineering I'},
    {subjectId:3, subjectName: 'Web Applications I'},
    {subjectId:4, subjectName: 'Web Applications II'},
    {subjectId:5, subjectName: 'Computer Architectures'},
    {subjectId:6, subjectName: 'Software Security'},
    {subjectId:7, subjectName: 'Computer Networks'},
]
class TeacherPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = { loading: true, serverErr: null , modality:"lectures"};
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
          this.props.notLoggedUser();
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
                  this.props.notLoggedUser();
              }
              this.setState({ serverErr: true });
          });
  }
  getLectures() {
    API.getLecturesTeacher()
      .then((lects) => {
        API.getCourses().then((subs)=>{
            this.setState({
                subjects: subs,
                lectures: lects,
                loading: null,
                serverErr: null,
            });
        })
      })
      .catch((err) => {
        console.log(err.status);
        if (err.status === 401) {
          this.props.notLoggedUser();
        }
        this.setState({ serverErr: true, loading: null });
      });
  }
  componentDidMount() {
    //retrieve lectures for the teacher
    this.getLectures();
  }
  onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
  }
  render() {
    return (
      <>
        <Container fluid data-testid="teacher-page">
          {this.state.serverErr && (
            <Alert variant="danger" data-testid="error-message">
              Server Error
            </Alert>
          )}
          {this.state.serverErr === null && this.state.loading && (
            <Alert variant="primary">
              <Spinner animation="border" variant="primary" /> Loading ...
            </Alert>
          )}
          {this.state.serverErr === null &&
            this.state.loading === null &&
            this.state.subjects && (

                <Tabs
                    id="controlled-tab"
                    activeKey={this.state.modality}
                    onSelect={(k) => this.setModality(k)}

                >
                    <Tab eventKey="lectures" title="My Lectures">
                        {this.state.subjects && <LectureTable
                            subjects={this.state.subjects}
                            lectures={this.state.lectures}
                            cancelLecture={this.cancelLecture}
                            changeModalityLecture={this.changeModalityLecture}
                            notLoggedUser={this.props.notLoggedUser}
                        />}
                    </Tab>
                    <Tab eventKey="stats" title="Statistics">
                        {this.state.subjects && <StatsPage subjects={this.state.subjects} canShowGraphs={this.props.canShowGraphs}/>}
                    </Tab>


                </Tabs>

            )}
        </Container>
      </>
    );
  }
}

export default TeacherPage;
