const moment = require('moment');
const db = require('./db');
const lecturesDao = require('./lecturesDao');

test('Should return an array of objects related to Lectures stats', async () => {
  const subjectId = 1;
  const obj = await lecturesDao.getLecturesBySubjectId(subjectId);
  expect(obj).toBeTruthy();
  expect(obj[0].LectureId).toBe(3);
  expect(obj[0].BookedPeople).toBe(50);
});

test('Should return an array of objects related to Lectures stats', async () => {
  const subjectId = 3;
  try {
    await lecturesDao.getLecturesBySubjectId(subjectId);
  } catch (err) {
    expect(err).toBe('There aren\'t lectures for this subjectId');
  }
});

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
  const lectureId = 600;
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

test('Should insert the reservation in the waiting list because of the classroom capacity has been exceeded ', async () => {
  const lectureId = 5;
  const studentId = 1;

  const obj = await lecturesDao.insertReservation(lectureId, studentId);
  expect(obj.insertedinwaiting).toBe(1);
});

test('Should move a reservation from the waiting list into the bookings because a seat has become available', async () => {
  const lectureId = 5;
  const studentId = 1;
  db.prepare('UPDATE Lectures SET BookedPeople=BookedPeople-1 WHERE LectureId=5').run();
  const obj = await lecturesDao.insertReservation(lectureId, studentId);
  expect(obj.movedfromwaiting).toBe(1);
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
  const tomorrow = moment(global.now).add(1, 'days');
  const obj = await lecturesDao.getInfoBookingConfirmation(lectureId, studentId);
  expect(obj).toBeTruthy();
  expect(obj.email).toBe('s0005@student.com');
  expect(obj.subject).toBe('SoftwareEngineering II');
  expect(obj.date_hour).toBe(tomorrow.toISOString());
  expect(obj.class).toBe('12A');
});

test('Should return an empty object', async () => {
  const lectureId = 10000;
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
  const lectureId = 1000;
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

test('Should permit the deletion of the booking by the student that was in waiting list (no update of BookedPeople number)', async () => {
  const lectureId = 4;
  const studentId = 6;
  const obj = await lecturesDao.deleteBookingStudent(lectureId, studentId);
  expect(obj).toBeTruthy();
  expect(obj.removeWait).toBe(1);
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

test('Should return an  array with only info element since nobody was booked for that cancelled lecture', async () => {
  const lectureId = 3;
  const teacherId = 1;
  const empty = await lecturesDao.getStudentsCancelledLecture(lectureId, teacherId);
  expect(empty.length).toBe(1);
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

test('Should return a message error because a Virtual lecture cant be converted again', async () => {
  const lectureId = 2;
  try {
    await lecturesDao.changeLectureModality(lectureId);
  } catch (err) {
    expect(err).toBe('You can\'t convert a Virtual Lecture into a in presence one');
  }
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
  const lectureId = 1600;
  try {
    await lecturesDao.changeLectureModality(lectureId);
  } catch (err) {
    expect(err).toBe('Error in retrieving lecture by his lectureId');
  }
});

test('Should return an error because a Virtual lecture can\'t be booked', async () => {
  const lectureId = 2;
  const studentId = 1;
  try {
    await lecturesDao.insertReservation(lectureId, studentId);
  } catch (err) {
    expect(err).toBe('a Virtual Lecture can\'t be booked');
  }
});

test('Should update the status of the student', async () => {
  const lectureId = 4;

  const mockInsertRes = jest.spyOn(lecturesDao, 'insertReservation');
  mockInsertRes.mockReturnValue(new Promise((resolve) => resolve(7)));

  const newStudentId = await lecturesDao.checkWaitingList(lectureId);
  expect(newStudentId).toBe(7);
});

test('Should not update the status of any student', async () => {
  const lectureId = 2;

  const newStudentId = await lecturesDao.checkWaitingList(lectureId);
  expect(newStudentId).toBe(undefined);
});
