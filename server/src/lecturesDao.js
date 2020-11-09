const db = require('./db');
const userDao = require('./userDao');
const subjectDao = require('./subjectsDao');

class Lecture {
  constructor(lectureId, subjectName, teacherName, dateHour, modality, className, capacity, bookedPeople) {
    this.lectureId = lectureId;
    this.subjectName = subjectName;
    this.teacherName = teacherName;
    this.dateHour = dateHour;
    this.modality = modality;
    this.className = className;
    this.capacity = capacity;
    this.bookedPeople = bookedPeople;
  }
}

async function getLecturesByUserId(id) {
  const user = await userDao.getUserById(id);
  let sql = 'SELECT * FROM Lectures WHERE SubjectId IN (SELECT SubjectId FROM Enrollments WHERE StudentId=?)';
  if (user.role === 'D') sql = "SELECT * FROM Lectures WHERE TeacherId = ? and DateHour > DATETIME('now')";

  const stmt = db.prepare(sql);
  const rows = stmt.all(id);
  const lectures = [];

  if (rows.length > 0) {
    await Promise.all(rows.map(async (rawlecture) => {
      const subjectName = await subjectDao.getSubjectName(rawlecture.SubjectId);
      const teacher = await userDao.getUserById(rawlecture.TeacherId);
      const teacherName = `${teacher.name} ${teacher.surname}`;
      const lecture = new Lecture(rawlecture.LectureId, subjectName, teacherName, rawlecture.DateHour, rawlecture.Modality, rawlecture.Class, rawlecture.Capacity, rawlecture.BookedPeople);

      lectures.push(lecture);
    }));

    console.log(lectures);
    return lectures;
  }
  if (user.role === 'D') throw ('No lectures scheduled for this TeacherId');
  else throw ('There are no lectures for this StudentId');
}

const getLectureTimeConstraint = (lectureId) => {
  const sql = 'SELECT DateHour FROM Lectures WHERE LectureId=?';
  const stmt = db.prepare(sql);
  const row = stmt.get(lectureId);
  if (row !== undefined) {
    const lectureTimeConstraint = new Date(row.dateHour);
    lectureTimeConstraint.setHours(0, 0, 0, 0);
    return lectureTimeConstraint;
  }
  return row;
};

exports.insertReservation = (lectureId, studentId) => new Promise((resolve, reject) => {
  const sql = 'SELECT * FROM Bookings WHERE LectureId=? AND StudentId=?';
  const stmt = db.prepare(sql);
  const row = stmt.get(lectureId, studentId);
  const todayDateHour = new Date();
  const timeconstraint = getLectureTimeConstraint(lectureId);
  if (timeconstraint === undefined) reject(timeconstraint);
  if (todayDateHour < timeconstraint) {
    if (row !== undefined) {
      reject('The Student has already booked a seat for that Lecture');
    } else {
      const sql1 = 'INSERT INTO Bookings(LectureId,StudentId) VALUES(?,?)';
      const stmt1 = db.prepare(sql1);
      const res = stmt1.run(lectureId, studentId);
      if (res.changes === 1) resolve({ result: res.changes });
      else reject('Error in inserting row');
    }
  } else reject('Booking is closed for that Lecture');
});

async function getTeachersForEmail() {
  const d1 = new Date();
  d1.setHours(23,59,59,999);    //last minute of today
  const d2 = new Date(d1);      
  d2.setDate(d2.getDate() + 1);
  d2.setHours(23,59,59,999);    //last minute of the day of the lecture
  const dateHour1 = moment(d1).format('YYYY-MM-DD HH:MM:SS.SSS');
  const dateHour2 = moment(d2).format('YYYY-MM-DD HH:MM:SS.SSS');

  const sql = 'SELECT TeacherId, BookedPeople, SubjectId FROM Lectures WHERE DateHour BETWEEN DATETIME(?) AND DATETIME(?)';
  const stmt = db.prepare(sql);
  const rows = stmt.all(dateHour1, dateHour2);
  const email_bp = [];

  if (rows.length > 0) {
    rows.forEach(async (rawlecture) => {
      const teacher = await userDao.getUserById(rawlecture.TeacherId);
      const email = teacher.Email;
      const subjectName = await subjectDao.getSubjectName(rawlecture.SubjectId);
      const bp = rawlecture.BookedPeople;
      
      const obj = {
        email_addr: email,
        subject: subjectName,
        booked_people: bp
      };
      email_bp.push(obj);
    });
  }
  return email_bp;
};

async function getInfoBookingConfirmation(lectureId, studentId) {
  const sql = 'SELECT DateHour, SubjectId, Class FROM Lectures WHERE LectureId=?';
  const stmt = db.prepare(sql);
  const row = stmt.get(lectureId);
  const info = {};

  if (row !== undefined) {
    const student = await userDao.getUserById(studentId);
    const subjectName = await subjectDao.getSubjectName(row.SubjectId);
    
    info = {
      email: student.email,
      subject: subjectName,
      date_hour: row.DateHour,
      class: row.Class
    };
  }
  return info;
}

exports.getLecturesByUserId = getLecturesByUserId;
exports.getTeachersForEmail = getTeachersForEmail;
exports.getInfoBookingConfirmation = getInfoBookingConfirmation;
