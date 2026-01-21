import nodemailer from 'nodemailer';
import dotenv from 'dotenv'; //Must configure dotenv to use nodemailer for Gmail
dotenv.config();

//--------------------------------------------------------
// Nodemailer for Gmail SMTP
// const transporter = nodemailer.createTransport({
//     host: 'smtp.gmail.com',
//     port: 587,
//     secure: false, // true only for port 465
//     auth: {
//         user: process.env.GMAIL_USER, // your gmail address
//         pass: process.env.GMAIL_PASS  // app password (not normal password)
//     }
// });
// export default transporter;
//--------------------------------------------------------



// Nodemailer for Brevo SMTP

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: 587,
    secure: false, // MUST for 587
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    }
});
export default transporter;




