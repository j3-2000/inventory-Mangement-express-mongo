import  nodemailer from  'nodemailer';
import pug from 'pug'; 
var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS 
  }
});

const SendMail=(mail)=>{
  var compiledFunction = pug.compileFile('./view/email.pug');

  var htmlContent = compiledFunction();

var mailOptions = {
  from: `"TESTING" <${process.env.EMAIL_USER}>`,
  to: mail,
  subject: 'Reset Pasword',
  html: htmlContent
};

    transporter.sendMail(mailOptions, function(error, info){
  if (error) {
    console.error('Error sending email:', error);
  } else {
    console.log('Email sent: ' + info.response);
  }
});
}

export default SendMail