process.env.NODE_ENV = 'test';

const moment = require('moment');
const Mailer = require('nodemailer/lib/mailer');
const waitForExpect = require('wait-for-expect');
const db = require('../db');
const emailService = require('./email');

db.prepare('DELETE from Lectures').run();
db.prepare('DELETE FROM Users').run();

const d = new Date();

db.prepare('INSERT INTO Users(Id, Role, Name, Surname, Email, Password, Course) VALUES(?,?,?,?,?,?,?)').run(
  [1, 'D', 'Marco', 'Torchiano', 'd0001@prof.com', '$2b$12$JzpgpB9ruQNwczLJXMkL9.UPoo4K1Sdlpx4g6/9aVHRyz/GzjrRpa', 'Computer Engineering'],
);
db.prepare('INSERT INTO Users(Id, Role, Name, Surname, Email, Password, Course) VALUES(?,?,?,?,?,?,?)').run(
  [2, 'S', 'Mario', 'Rossi', 's0002@stud.com', '$2b$12$JzpgpB9ruQNwczLJXMkL9.UPoo4K1Sdlpx4g6/9aVHRyz/GzjrRpa', 'Computer Engineering'],
);

// populate Subjects Table
db.prepare('DELETE FROM Subjects').run();
db.prepare('INSERT INTO Subjects(SubjectId,TeacherId,SubjName,Course) VALUES(?,?,?,?)').run([1, 1, 'SoftwareEngineering II', 'Computer Engineering']);

// populate Lectures Table
const today = moment(d); // .format('YYYY-MM-DD HH:MM:SS.SSS');
db.prepare('INSERT INTO Lectures(LectureId, TeacherId, SubjectId, DateHour, Modality, Class, Capacity, BookedPeople) VALUES(?,?,?,?,?,?,?,?)').run(
  [1, 1, 1, today.add(1, 'days').toISOString(), 'In person', '12A', 150, 100],
);
db.prepare('INSERT INTO Lectures(LectureId, TeacherId, SubjectId, DateHour, Modality, Class, Capacity, BookedPeople) VALUES(?,?,?,?,?,?,?,?)').run(
  [2, 1, 1, today.add(2, 'hours').toISOString(), 'In person', '12A', 50, 100],
);
db.prepare('INSERT INTO Lectures(LectureId, TeacherId, SubjectId, DateHour, Modality, Class, Capacity, BookedPeople) VALUES(?,?,?,?,?,?,?,?)').run(
  [3, 1, 1, today.subtract(3, 'days').toISOString(), 'In person', '12A', 50, 100],
);
db.prepare('INSERT INTO Lectures(LectureId, TeacherId, SubjectId, DateHour, Modality, Class, Capacity, BookedPeople) VALUES(?,?,?,?,?,?,?,?)').run(
  [4, 1, 1, today.add(5, 'days').toISOString(), 'In person', '12A', 50, 100],
);

// populate Enrollments Table
db.prepare('DELETE FROM Enrollments').run();
db.prepare('INSERT INTO Enrollments(StudentId,SubjectId) VALUES(?,?)').run(2, 1);

// populate Bookings Table
db.prepare('DELETE FROM Bookings').run();
db.prepare('INSERT INTO Bookings(LectureId,StudentId) VALUES(?,?)').run(1, 2);

const array = [
  {
    subject: 'Web Applications II',
    teacher: 'Mario Rossi',
    date_hour: '2020-11-23T17:30:00.000Z'
  },
  {
    email_addr: 's0002@student.com'
  },
  {
    email_addr: 's0003@student.com'
  }
];

test('Should send the email to teachers', async () => {
  jest.useFakeTimers();
  spyOn(Mailer.prototype, 'sendMail').and.callFake((mailOptions, cb) => {
    cb(null, true);
  });
  emailService.sendingEmailBookedPeople();

  await waitForExpect(() => {
    expect(Mailer.prototype.sendMail).toHaveBeenCalledTimes(2);
  });
});

test('Should send the email for booking confirmation', async () => {
  const lectureId = 1;
  const studentId = 2;
  spyOn(Mailer.prototype, 'sendMail').and.callFake((mailOptions, cb) => {
    cb(null, true);
  });
  await emailService.sendBookingConfirmationEmail(lectureId, studentId);
  expect(Mailer.prototype.sendMail).toHaveBeenCalled();
});

test('Should not send the email since that lectureId doesn\'t exist in the db', async () => {
  const lectureId = 8;
  const studentId = 2;
  spyOn(Mailer.prototype, 'sendMail').and.callFake((mailOptions, cb) => {
    cb(null, false);
  });
  await emailService.sendBookingConfirmationEmail(lectureId, studentId);
  expect(Mailer.prototype.sendMail).not.toHaveBeenCalled();
});

test('Should send emails to all the student booked for that cancelled lecture', async () => {
  spyOn(Mailer.prototype, 'sendMail').and.callFake((mailOptions, cb) => {
    cb(null, true);
  });
  await emailService.sendingEmailCancelledLecture(array);
  expect(Mailer.prototype.sendMail).toHaveBeenCalledTimes(2);
});

test('Should not send emails because the array is empty', async () => {
  let empty = [];
  spyOn(Mailer.prototype, 'sendMail').and.callFake((mailOptions, cb) => {
    cb(null, false);
  });
  await emailService.sendingEmailCancelledLecture(empty);
  expect(Mailer.prototype.sendMail).not.toHaveBeenCalled();
});