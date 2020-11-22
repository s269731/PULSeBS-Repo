const moment = require('moment');
const db = require('./db');
const userDao = require('./userDao');
const subjectDao = require('./subjectsDao');

class Lecture {
  constructor(lectureId, subjectName, teacherName, dateHour, modality, className, capacity, bookedPeople, booked) {
    this.lectureId = lectureId;
    this.subjectName = subjectName;
    this.teacherName = teacherName;
    this.dateHour = dateHour;
    this.modality = modality;
    this.className = className;
    this.capacity = capacity;
    this.bookedPeople = bookedPeople;
    this.booked = booked;
  }
}

function getReservation(studentId, lectureId) {
  const sql = 'SELECT * FROM Bookings WHERE StudentId=? AND LectureId=?';
  const stmt = db.prepare(sql);
  const row = stmt.get(studentId, lectureId);
  if (row === undefined) return false;
  return true;
}

/*function getBookedPeople(lectureId) {
  const result = db.prepare('SELECT COUNT(*) as num from Bookings WHERE lectureId=?').get(lectureId);
  return result.num || 0;
}*/

async function getLecturesByUserId(id) {
  const user = await userDao.getUserById(id);
  let sql = "SELECT * FROM Lectures WHERE DateHour > DATETIME('now') AND SubjectId IN (SELECT SubjectId FROM Enrollments WHERE StudentId=?)";
  if (user.role === 'D') sql = "SELECT * FROM Lectures WHERE TeacherId = ? and DateHour > DATETIME('now')";

  const stmt = db.prepare(sql);
  const rows = stmt.all(id);
  const lectures = [];

  if (rows.length > 0) {
    await Promise.all(rows.map(async (rawlecture) => {
      const subjectName = await subjectDao.getSubjectName(rawlecture.SubjectId);
      const teacher = await userDao.getUserById(rawlecture.TeacherId);
      const teacherName = `${teacher.name} ${teacher.surname}`;
      const reservation = getReservation(id, rawlecture.LectureId);
      const lecture = new Lecture(rawlecture.LectureId, subjectName.SubjectName, teacherName, rawlecture.DateHour, rawlecture.Modality, rawlecture.Class, rawlecture.Capacity, rawlecture.BookedPeople, reservation);

      lectures.push(lecture);
    }));

    // console.log(lectures);
  }
  return lectures;
}

const getLectureTimeConstraint = (lectureId) => {
  const sql = 'SELECT DateHour FROM Lectures WHERE LectureId=?';
  const stmt = db.prepare(sql);
  const row = stmt.get(lectureId);
  // console.log(row)
  if (row !== undefined) {
    const lectureTimeConstraint = new Date(row.DateHour);
    lectureTimeConstraint.setHours(0, 0, 0, 0);
    return lectureTimeConstraint;
  }
  return row;
};

exports.insertReservation = (lectureId, studentId) => new Promise((resolve, reject) => {
  const sql = 'SELECT * FROM Bookings WHERE LectureId=? AND StudentId=?';
  const insertbookings = db.prepare('INSERT INTO Bookings(LectureId,StudentId) VALUES(?,?)');
  const updatelecture = db.prepare('UPDATE Lectures SET BookedPeople=BookedPeople+1 WHERE LectureId=? AND BookedPeople<Capacity');
  const stmt = db.prepare(sql);
  const row = stmt.get(lectureId, studentId);
  const todayDateHour = new Date();
  const timeconstraint = getLectureTimeConstraint(lectureId);

  if (timeconstraint === undefined) reject('No lecture for the specified id');
  if (todayDateHour < timeconstraint) {
    if (row !== undefined) {
      reject('The Student has already booked a seat for that Lecture');
    }

    const transaction = db.transaction(() => {
      const insertres = insertbookings.run(lectureId, studentId);
      const updateres = updatelecture.run(lectureId);
      return insertres.changes === 1 && updateres.changes === insertres.changes;
    });
    const transactionresult = transaction();

    if (transactionresult === true) resolve({ result: 1 });
    reject('The classroom capacity has been exceeded');
  } reject('Booking is closed for that Lecture'); // throw
});

async function getTeachersForEmail() {
  const d1 = new Date();
  d1.setDate(d1.getDate() + 1);
  d1.setHours(1, 0, 0, 0); // tomorrow at midnight
  const d2 = new Date();
  d2.setDate(d2.getDate() + 2);
  d2.setHours(1, 0, 0, 0); // day after tomorrow at midnight

  const sql = 'SELECT LectureId, TeacherId, SubjectId, BookedPeople FROM Lectures WHERE DateHour BETWEEN ? AND ? AND Modality=\'In person\'';
  const stmt = db.prepare(sql);
  const rows = stmt.all(d1.toISOString(), d2.toISOString());
  const email_bp = [];
  let obj = {};

  if (rows.length > 0) {
    await Promise.all(rows.map(async (rawlecture) => {
      const teacher = await userDao.getUserById(rawlecture.TeacherId);
      const { email } = teacher;
      const subjectName = await subjectDao.getSubjectName(rawlecture.SubjectId);
      const bp = rawlecture.BookedPeople;

      obj = {
        email_addr: email,
        subject: subjectName.SubjectName,
        booked_people: bp,
      };
      email_bp.push(obj);
    }));
  }
  return email_bp;
}

async function getInfoBookingConfirmation(lectureId, studentId) {
  const sql = 'SELECT DateHour, SubjectId, Class FROM Lectures WHERE LectureId=?';
  const stmt = db.prepare(sql);
  const row = stmt.get(lectureId);
  let info = {};

  if (row !== undefined) {
    const student = await userDao.getUserById(studentId);
    const subjectName = await subjectDao.getSubjectName(row.SubjectId);

    info = {
      email: student.email,
      subject: subjectName.SubjectName,
      date_hour: row.DateHour,
      class: row.Class,
    };
  }
  return info;
}

async function getStudentsListByLectureId(lectureId) {
  const sql = 'SELECT StudentId FROM Bookings WHERE LectureId=?';
  const stmt = db.prepare(sql);
  const rows = stmt.all(lectureId);
  const studentlist = [];
  // console.log(`number of rows:${rows}`);
  if (rows.length > 0) {
    rows.forEach(async (row) => {
      const student = await userDao.getUserById(row.StudentId);
      studentlist.push(student);
    });
    // console.log(studentlist);
    return studentlist;
  }
}

exports.deleteBookingStudent = (lectureId, studentId) => new Promise((resolve, reject) => {
  const sql1 = 'SELECT * FROM Bookings WHERE LectureId=? AND StudentId=?';
  const stmt1 = db.prepare(sql1);
  const row = stmt1.get(lectureId, studentId);
  const deletesql = db.prepare('DELETE FROM Bookings WHERE LectureId=? AND StudentId=?');
  const updatesql = db.prepare('UPDATE Lectures SET BookedPeople = BookedPeople - 1 WHERE LectureId=?');

  const todayDateHour = new Date();
  const timeconstraint = getLectureTimeConstraint(lectureId);

  if (timeconstraint === undefined) reject('No lecture found for the specified id');
  if (todayDateHour < timeconstraint) {
    if (row === undefined) {
      reject('Deletion fails: selected lecture not available among the bookings of the student');
    } else {
      const transaction = db.transaction(() => {
        const deleteres = deletesql.run(lectureId, studentId);
        const updateres = updatesql.run(lectureId);
        return deleteres.changes === 1 && updateres.changes === deleteres.changes;
      });
      const transactionresult = transaction();
      if (transactionresult === true) resolve({ result: '1 1' });
      reject('Error in deleting row or updating BookedPeople number');
    }
  }
});

exports.deleteLectureTeacher = (lectureId, teacherId) => new Promise((resolve, reject) => {
  const sql1 = 'SELECT DateHour FROM Lectures WHERE LectureId=? AND TeacherId=?';
  const stmt1 = db.prepare(sql1);
  const row = stmt1.get(lectureId, teacherId);
  if (row === undefined) {
    reject('Deletion fails: selected lecture was not found');
  } else {
    const d1 = new Date();
    const d2 = new Date(row.DateHour);
    d1.setHours(d1.getHours() + 1);
    if (d2.getTime() - d1.getTime() < 3.6e+6) { // milliseconds in 1 hour
      reject('Deletion fails: time constraint is not satisfied');
    } else {
      const sql2 = 'DELETE FROM Lectures WHERE LectureId=? AND TeacherId=?';
      const stmt2 = db.prepare(sql2);
      const res = stmt2.run(lectureId, teacherId);
      if (res.changes === 1) { resolve({ result: res.changes }); } else { reject('Error in deleting row'); }
    }
  }
});

async function getBookingsByUserId(studentId) {
  const sql = "SELECT * FROM Bookings B, Lectures L WHERE B.StudentId=? AND B.LectureId=L.LectureId AND DateHour > DateTime('now')";
  const stmt = db.prepare(sql);
  const rows = stmt.all(studentId);
  const lectures = [];

  if (rows.length > 0) {
    await Promise.all(rows.map(async (rawlecture) => {
      const subjectName = await subjectDao.getSubjectName(rawlecture.SubjectId);
      const teacher = await userDao.getUserById(rawlecture.TeacherId);
      const teacherName = `${teacher.name} ${teacher.surname}`;
      const reservation = getReservation(studentId, rawlecture.LectureId);
      // eslint-disable-next-line max-len
      const lecture = new Lecture(rawlecture.LectureId, subjectName.SubjectName, teacherName, rawlecture.DateHour, rawlecture.Modality, rawlecture.Class, rawlecture.Capacity, rawlecture.BookedPeople, reservation);

      lectures.push(lecture);
    }));

    // console.log(lectures);
  }
  return lectures;
}

async function getStudentsCancelledLecture(lectureId, teacherId) {
  const sql = 'SELECT Email FROM Users WHERE id IN (SELECT StudentId FROM Bookings WHERE LectureId=?)';
  const stmt = db.prepare(sql);
  const rows = stmt.all(lectureId);
  const stud_emails = [];
  let info = {};
  let obj = {};

  if (rows.length > 0) {
    const sql2 = 'SELECT SubjectId, DateHour FROM Lectures WHERE LectureId=? AND TeacherId=?';
    const stmt2 = db.prepare(sql2);
    const row = stmt2.get(lectureId, teacherId);

    if (row !== undefined) {
      const subjectName = await subjectDao.getSubjectName(row.SubjectId);
      const teacher = await userDao.getUserById(teacherId);
      const teacherName = `${teacher.name} ${teacher.surname}`;
      const date_hour = row.DateHour;

      info = {
        subject: subjectName.SubjectName,
        teacher: teacherName,
        date_hour,
      };
      stud_emails.push(info);

      await Promise.all(rows.map(async (rawlecture) => {
        obj = {
          email_addr: rawlecture.Email,
        };

        stud_emails.push(obj);
      }));
    }
  }
  return stud_emails;
}

exports.changeLectureModality = (lectureId) => new Promise((resolve, reject) => {
  const sql = db.prepare('SELECT Modality,DateHour FROM Lectures WHERE LectureId=?');
  const result = sql.get(lectureId);
  if (result === undefined) reject('Error in retrieving lecture by his lectureId');
  else {
    const now = new Date();
    const lecturetime = new Date(result.DateHour);
    console.log(result.Modality);
    if (lecturetime.getTime() - now.getTime() > 1.8e+6) {
      if (result.Modality === 'In person') {
        console.log('Entered in update In Person Lecture');
        const virtual = 'Virtual';
        const sqlupdate1 = db.prepare('UPDATE Lectures SET Modality=? WHERE LectureId=?');
        const result1 = sqlupdate1.run(virtual, lectureId);
        if (result1.changes === 1) resolve({ result: 'Virtual' });
        else reject('Error in updating the Lecture Modality');
      } else {
        console.log('Entered in update Virtual Lecture');
        const inperson = 'In person';
        const sqlupdate2 = db.prepare('UPDATE Lectures SET Modality=? WHERE LectureId=?');
        const result2 = sqlupdate2.run(inperson, lectureId);
        if (result2.changes === 1) resolve({ result: 'In person' });
        else reject('Error in updating the Lecture Modality');
      }
    }
    reject('Lecture Modality can\'t be changed within 30 minutes before its start');
  }
});

exports.getLecturesByUserId = getLecturesByUserId;
exports.getTeachersForEmail = getTeachersForEmail;
exports.getInfoBookingConfirmation = getInfoBookingConfirmation;
exports.getStudentsListByLectureId = getStudentsListByLectureId;
exports.getBookingsByUserId = getBookingsByUserId;
exports.getStudentsCancelledLecture = getStudentsCancelledLecture;
