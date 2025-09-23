import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'sanyanovikov6@gmail.com',
    pass: 'hrogcdtadaytdfja', // твой app password
  },
});

transporter.sendMail({
  from: 'sanyanovikov6@gmail.com',
  to: ' horkihorki@yandex.ru', // ← сюда вставь свою почту
  subject: 'Test Email',
  text: 'Если ты видишь это сообщение — всё работает!',
}, (error, info) => {
  if (error) {
    return console.log('❌ Ошибка:', error);
  }
  console.log('✅ Успешно отправлено:', info.response);
});
