const nodemailer = require("nodemailer");
const {google} = require("googleapis");

const CLIENT_ID = `145003169457-eq3il1ervuo69tfq0jua8kcui2bpp5vd.apps.googleusercontent.com`;

const CLIENT_SECRET = `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`;
const REDIRECT_URI = `https://developers.google.com/oauthplayground`;
const REFRESH_TOKEN = `1//04hCKfx1D66xcCgYIARAAGAQSNwF-L9IrjBlqbizKC7tAA6oIqnc5-pmSNK3_2kANoYBGb5HRjOvBH_3eCt7mYEsOKwxl9kP-Lpc`;

const oauthclient = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
oauthclient.setCredentials({refresh_token: REFRESH_TOKEN});

async function sendMail(receiver, text){ 
  try{
    const access_token = await oauthclient.getAccessToken();
    const transport = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: "OAuth2",
        user:"harshitvidhya98@gmail.com",
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken: access_token
      }
    })

    const mailOpts = {
      from: "harshitvidhya98@gmail.com",
      to: receiver,
      subject: "khush rehna tum 👍",
      text: "padh le re aalsi ladki",
      html: text
    }

    const result = await transport.sendMail(mailOpts);
    return result;
  }
  catch(err){
    return err;
  }
}

module.exports = sendMail;