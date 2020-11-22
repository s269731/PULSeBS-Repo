process.env.NODE_ENV = 'test';

const moment = require('moment');
const db = require('./db');
const userDao = require('./userDao');
const subjectDao = require('./subjectsDao');
const lecturesDao = require('./lecturesDao');

// populate db
const d = new Date();

// populate Users Table
db.prepare('DELETE FROM Users').run();
db.prepare('INSERT INTO Users(Id, Role, Name, Surname, Email, Password, Course) VALUES(?,?,?,?,?,?,?)').run(
  [1, 'D', 'Marco', 'Torchiano', 'd0001@prof.com', '$2b$12$JzpgpB9ruQNwczLJXMkL9.UPoo4K1Sdlpx4g6/9aVHRyz/GzjrRpa', 'Computer Engineering'],
);
db.prepare('INSERT INTO Users(Id, Role, Name, Surname, Email, Password, Course) VALUES(?,?,?,?,?,?,?)').run(
  [2, 'S', 'Jinzhuo', 'Chen', 's0002@student.com', '$2b$12$JzpgpB9ruQNwczLJXMkL9.UPoo4K1Sdlpx4g6/9aVHRyz/GzjrRpa', 'Computer Engineering'],
);
db.prepare('INSERT INTO Users(Id, Role, Name, Surname, Email, Password, Course) VALUES(?,?,?,?,?,?,?)').run(
  [3, 'S', 'Daniele', 'fhgfghf', 's0003@student.com', '$2b$12$JzpgpB9ruQNwczLJXMkL9.UPoo4K1Sdlpx4g6/9aVHRyz/GzjrRpa', 'Computer Engineering'],
);
db.prepare('INSERT INTO Users(Id, Role, Name, Surname, Email, Password, Course) VALUES(?,?,?,?,?,?,?)').run(
  [4, 'S', 'Luca', 'Torchiano', 's0004@student.com', '$2b$12$JzpgpB9ruQNwczLJXMkL9.UPoo4K1Sdlpx4g6/9aVHRyz/GzjrRpa', 'Computer Engineering'],
);
db.prepare('INSERT INTO Users(Id, Role, Name, Surname, Email, Password, Course) VALUES(?,?,?,?,?,?,?)').run(
  [5, 'S', 'Loredana', 'Finocchiaro', 's0005@student.com', '$2b$12$JzpgpB9ruQNwczLJXMkL9.UPoo4K1Sdlpx4g6/9aVHRyz/GzjrRpa', 'Computer Engineering'],
);
db.prepare('INSERT INTO Users(Id, Role, Name, Surname, Email, Password, Course) VALUES(?,?,?,?,?,?,?)').run(
  [6, 'S', 'Elchin', 'Farhad', 's0006@student.com', '$2b$12$JzpgpB9ruQNwczLJXMkL9.UPoo4K1Sdlpx4g6/9aVHRyz/GzjrRpa', 'Computer Engineering'],
);
db.prepare('INSERT INTO Users(Id, Role, Name, Surname, Email, Password, Course) VALUES(?,?,?,?,?,?,?)').run(
  [7, 'S', 'Nino', 'Sasa', 's0007@student.com', '$2b$12$JzpgpB9ruQNwczLJXMkL9.UPoo4K1Sdlpx4g6/9aVHRyz/GzjrRpa', 'Computer Engineering'],
);

// populate Subjects Table
db.prepare('DELETE FROM Subjects').run();
db.prepare('INSERT INTO Subjects(SubjectId,TeacherId,SubjName,Course) VALUES(?,?,?,?)').run([1, 1, 'SoftwareEngineering II', 'Computer Engineering']);
db.prepare('INSERT INTO Subjects(SubjectId,TeacherId,SubjName,Course) VALUES(?,?,?,?)').run([2, 1, 'SoftwareEngineering I', 'Computer Engineering']);

// delete all the lectures inserted
db.prepare('DELETE from Lectures').run();
// populate Lectures Table
const today = moment(d); // .format('YYYY-MM-DD HH:MM:SS.SSS');
db.prepare('INSERT INTO Lectures(LectureId, TeacherId, SubjectId, DateHour, Modality, Class, Capacity, BookedPeople) VALUES(?,?,?,?,?,?,?,?)').run(
  [1, 1, 1, today.add(1, 'days').toISOString(), 'In person', '12A', 150, 6],
);
db.prepare('INSERT INTO Lectures(LectureId, TeacherId, SubjectId, DateHour, Modality, Class, Capacity, BookedPeople) VALUES(?,?,?,?,?,?,?,?)').run(
  [2, 1, 1, today.add(2, 'hours').toISOString(), 'In person', '12A', 100, 6],
);
db.prepare('INSERT INTO Lectures(LectureId, TeacherId, SubjectId, DateHour, Modality, Class, Capacity, BookedPeople) VALUES(?,?,?,?,?,?,?,?)').run(
  [3, 1, 1, today.subtract(3, 'days').toISOString(), 'In person', '12A', 100, 50],
);
db.prepare('INSERT INTO Lectures(LectureId, TeacherId, SubjectId, DateHour, Modality, Class, Capacity, BookedPeople) VALUES(?,?,?,?,?,?,?,?)').run(
  [4, 1, 1, today.add(5, 'days').toISOString(), 'In person', '12A', 100, 50],
);
db.prepare('INSERT INTO Lectures(LectureId, TeacherId, SubjectId, DateHour, Modality, Class, Capacity, BookedPeople) VALUES(?,?,?,?,?,?,?,?)').run(
  [5, 1, 1, today.add(15, 'minutes').toISOString(), 'In person', '12A', 100, 100],
);
// populate Enrollments Table
db.prepare('DELETE FROM Enrollments').run();
db.prepare('INSERT INTO Enrollments(StudentId,SubjectId) VALUES(?,?)').run(2, 1);

// populate Bookings Table
db.prepare('DELETE FROM Bookings').run();
db.prepare('INSERT INTO Bookings(LectureId,StudentId) VALUES(?,?)').run(1, 2);
db.prepare('INSERT INTO Bookings(LectureId,StudentId) VALUES(?,?)').run(1, 3);
db.prepare('INSERT INTO Bookings(LectureId,StudentId) VALUES(?,?)').run(1, 4);
db.prepare('INSERT INTO Bookings(LectureId,StudentId) VALUES(?,?)').run(1, 5);
db.prepare('INSERT INTO Bookings(LectureId,StudentId) VALUES(?,?)').run(1, 6);
db.prepare('INSERT INTO Bookings(LectureId,StudentId) VALUES(?,?)').run(1, 7);
db.prepare('INSERT INTO Bookings(LectureId,StudentId) VALUES(?,?)').run(2, 2);
db.prepare('INSERT INTO Bookings(LectureId,StudentId) VALUES(?,?)').run(2, 3);
db.prepare('INSERT INTO Bookings(LectureId,StudentId) VALUES(?,?)').run(2, 4);
db.prepare('INSERT INTO Bookings(LectureId,StudentId) VALUES(?,?)').run(2, 5);
db.prepare('INSERT INTO Bookings(LectureId,StudentId) VALUES(?,?)').run(2, 6);
db.prepare('INSERT INTO Bookings(LectureId,StudentId) VALUES(?,?)').run(2, 7);

test('Should return list of lectures for the userId', async () => {
  const userid = 1;
  const obj = await lecturesDao.getLecturesByUserId(userid);
  expect(Array.isArray(obj)).toBe(true);
  // expect(obj[0] instanceof lecturesDao.Lecture).toBe(true);
  expect(obj[0].lectureId).toBeTruthy();
  expect(obj[0].subjectName).toBeTruthy();
  expect(obj[0].teacherName).toBeTruthy();
  expect(obj[0].dateHour).toBeTruthy();
  expect(obj[0].modality).toBeTruthy();
  expect(obj[0].className).toBeTruthy();
  expect(obj[0].capacity).toBeTruthy();
  expect(obj[0].bookedPeople).toBeTruthy();
});

test('Should not return the list of lectures for a userId that doesn\'t exist', async () => {
  const userid = 3;
  const obj = await lecturesDao.getLecturesByUserId(userid);
  expect(obj.length).toBe(0);
  // expect(obj).toBe('There aren\'t lecture for this StudentId');
});

test('Should return 1 to indicate that the reservation was correctly inserted ', async () => {
  const lectureId = 1;
  const studentId = 1;
  const obj = await lecturesDao.insertReservation(lectureId, studentId);
  expect(obj).toBeTruthy();
  expect(obj.result).toBe(1);
});

test('Should not return 1 because lectureId doesn\'t correspond to any lecture ', async () => {
  const lectureId = 6;
  const studentId = 1;
  try {
    await lecturesDao.insertReservation(lectureId, studentId);
  } catch (err) {
    expect(err).toBe('No lecture for the specified id');
  }
});

test('Should return a message indicating lectureId bookings are closed ', async () => {
  const lectureId = 2;
  const studentId = 1;
  try {
    await lecturesDao.insertReservation(lectureId, studentId);
  } catch (err) {
    expect(err).toBe('Booking is closed for that Lecture');
  }
});

test('Should return a message indicating that the capacity for the classroom is exceeded ', async () => {
  const lectureId = 5;
  const studentId = 1;
  try {
    await lecturesDao.insertReservation(lectureId, studentId);
  } catch (err) {
    expect(err).toBe('The classroom capacity has been exceeded');
  }
});

test('Second reservation should return a message showing that a seat for that lectureId is already booked', async () => {
  const lectureId = 1;
  const studentId = 1;
  try {
    await lecturesDao.insertReservation(lectureId, studentId);
  } catch (err) {
    console.log(err);
    expect(err).toBe('The Student has already booked a seat for that Lecture');
  }
});

test('Should return list of student booked for a certain lectureId', async () => {
  const lectureId = 1;
  const obj = await lecturesDao.getStudentsListByLectureId(lectureId);
  expect(obj).toBeTruthy();
  expect(obj[1].id).toBe(2);
  expect(obj[2].id).toBe(3);
  expect(obj[3].id).toBe(4);
  expect(obj[4].id).toBe(5);
  expect(obj[5].id).toBe(6);
  expect(obj[6].id).toBe(7);
});

test('Should not return list of student but undefined because of wrong lectureId', async () => {
  const lectureId = 10;
  const obj = await lecturesDao.getStudentsListByLectureId(lectureId);
  expect(obj).toBeUndefined();
});

test('Should return info about all the lectures scheduled for tomorrow, so that email notifications can be sent', async () => {
  const array = await lecturesDao.getTeachersForEmail();
  expect(Array.isArray(array)).toBe(true);
  expect(array.length).toBe(2);
  expect(array[0].email_addr).toBe('d0001@prof.com');
  expect(array[0].subject).toBe('SoftwareEngineering II');
  expect(array[0].booked_people).toBe(7);
  expect(array[1].email_addr).toBe('d0001@prof.com');
  expect(array[1].subject).toBe('SoftwareEngineering II');
  expect(array[1].booked_people).toBe(7);
});

test('Should return an object with necessary info related to specific booking, so that the email confirmation can be sent', async () => {
  const lectureId = 1;
  const studentId = 5;
  const tomorrow = moment(d).add(1, 'days');
  const obj = await lecturesDao.getInfoBookingConfirmation(lectureId, studentId);
  expect(obj).toBeTruthy();
  expect(obj.email).toBe('s0005@student.com');
  expect(obj.subject).toBe('SoftwareEngineering II');
  expect(obj.date_hour).toBe(tomorrow.toISOString());
  expect(obj.class).toBe('12A');
});

test('Should return an empty object', async () => {
  const lectureId = 10;
  const studentId = 5;
  const obj = await lecturesDao.getInfoBookingConfirmation(lectureId, studentId);
  expect(Object.keys(obj).length).toBe(0);
  expect(obj.constructor).toBe(Object);
});

test('Should permit the deletion of the booking by the student', async () => {
  const lectureId = 1;
  const studentId = 7;
  const obj = await lecturesDao.deleteBookingStudent(lectureId, studentId);
  expect(obj).toBeTruthy();
  expect(obj.result).toBe('1 1');
});

test('Should reject the request of deletion of booking by the student because the lectureId doesn\'t exist', async () => {
  const lectureId = 10;
  const studentId = 5;
  try {
    await lecturesDao.deleteBookingStudent(lectureId, studentId);
  } catch (err) {
    console.log(err);
    expect(err).toBe('No lecture found for the specified id');
  }
});

test('Should reject the request of deletion of booking by the student because his booking doesn\'t exist', async () => {
  const lectureId = 2;
  const studentId = 5;
  try {
    await lecturesDao.deleteBookingStudent(lectureId, studentId);
  } catch (err) {
    console.log(err);
    expect(err).toBe('Deletion fails: selected lecture not available among the bookings of the student');
  }
});

test('Should permit the deletion of lecture by the teacher since the time constraint is satisfied', async () => {
  const lectureId = 1;
  const teacherId = 1;
  const obj = await lecturesDao.deleteLectureTeacher(lectureId, teacherId);
  expect(obj).toBeTruthy();
  expect(obj.result).toBe(1);
});

test('Should reject the request of deletion by a teacher because of the not satisfied time constraint', async () => {
  const lectureId = 3;
  const teacherId = 1;
  try {
    await lecturesDao.deleteLectureTeacher(lectureId, teacherId);
  } catch (err) {
    console.log(err);
    expect(err).toBe('Deletion fails: time constraint is not satisfied');
  }
});

test('Should reject the request of deletion by a teacher', async () => {
  const lectureId = 10;
  const teacherId = 1;
  try {
    await lecturesDao.deleteLectureTeacher(lectureId, teacherId);
  } catch (err) {
    console.log(err);
    expect(err).toBe('Deletion fails: selected lecture was not found');
  }
});

test('Should return Bookings for a certain student', async () => {
  const studentId = 1;
  const obj = await lecturesDao.getBookingsByUserId(studentId);
  expect(obj).toBeTruthy();
  expect(obj[0].lectureId).toBeTruthy();
  expect(obj[0].subjectName).toBeTruthy();
  expect(obj[0].teacherName).toBeTruthy();
  expect(obj[0].dateHour).toBeTruthy();
  expect(obj[0].modality).toBeTruthy();
  expect(obj[0].className).toBeTruthy();
  expect(obj[0].capacity).toBeTruthy();
  expect(obj[0].bookedPeople).toBeTruthy();
});

test('Should return an empty array since nobody was booked for that cancelled lecture', async () => {
  const lectureId = 3;
  const teacherId = 1;
  const empty = await lecturesDao.getStudentsCancelledLecture(lectureId, teacherId);
  expect(empty.length).toBe(0);
});

test('Should return an array of info and emails', async () => {
  const lectureId = 2;
  const teacherId = 1;
  const array = await lecturesDao.getStudentsCancelledLecture(lectureId, teacherId);
  expect(array).toBeTruthy();
  expect(array.length).toBe(7);
  expect(array[0].subject).toBe('SoftwareEngineering II');
  expect(array[0].teacher).toBe('Marco Torchiano');
  expect(array[0].date_hour).toBeTruthy();
  expect(array[1].email_addr).toBeTruthy();
});

test('Should return an empty array since teacherId for that cancelled lecture doesn\'t exist', async () => {
  const lectureId = 3;
  const teacherId = 6;
  const empty = await lecturesDao.getStudentsCancelledLecture(lectureId, teacherId);
  expect(empty.length).toBe(0);
});

test('Should return Virtual as new Modality for the lecture', async () => {
  const lectureId = 2;
  const result = await lecturesDao.changeLectureModality(lectureId);
  expect(result).toBeTruthy();
  expect(result.result).toBe('Virtual');
});

test('Should return In person as new Modality for the lecture', async () => {
  const lectureId = 2;
  const result = await lecturesDao.changeLectureModality(lectureId);
  expect(result).toBeTruthy();
  expect(result.result).toBe('In person');
});

test('Should return the time constraint error', async () => {
  const lectureId = 5;
  try {
    await lecturesDao.changeLectureModality(lectureId);
  } catch (err) {
    expect(err).toBe('Lecture Modality can\'t be changed within 30 minutes before its start');
  }
});

test('Should return error for incorrect lectureId', async () => {
  const lectureId = 16;
  try {
    await lecturesDao.changeLectureModality(lectureId);
  } catch (err) {
    expect(err).toBe('Error in retrieving lecture by his lectureId');
  }
});
