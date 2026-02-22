import nodemailer from 'nodemailer'
import User from '@/models/userModel'
import bcryptjs from 'bcryptjs'

export const sendEmail = async({email, emailType, userId}:any) => {
    try {
        const hashedToken = await bcryptjs.hash(userId.toString(), 10)

        if (emailType === "VERIFY") {
            await User.findByIdAndUpdate(userId,
            {verifyToken: hashedToken, verifyTokenExpiry: Date.now()+ 360000})
        }
        else if (emailType === "RESET"){
            await User.findByIdAndUpdate(userId,
            {forgotPasswordToken: hashedToken, forgotPasswordTokenExpiry: Date.now()+ 360000})
        }

        var transport = nodemailer.createTransport({
        host: "sandbox.smtp.mailtrap.io",
        port: 2525,
        auth: {
            user: process.env.MAILTRAP_USER,
            pass: process.env.MAILTRAP_PASS
        }
        });

        const mailOptions = {
            from: 'sadikshya@sadikshya.ai', 
            to: email, 
            subject: emailType === 'VERIFY' ? "Verify your email" : "Reset your password",
            html: `<p>Click <a href="${process.env.DOMAIN}/verifyemail?token=${hashedToken}">here</a> to ${emailType === "VERIFY" ? "Verify your email" : "reset your password"} or copy paste the link below in your browser.
            <br> ${process.env.DOMAIN}/verifyemail?token=${hashedToken}
            </p>`, 
        }; //TODO: same way create forgot password as well

        const mailResponse = await transport.sendMail(mailOptions)
        return mailResponse
    }
    catch(error:any) {
        throw new Error(error.message)
    }
} 