import bcrypt, { hash } from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';
import transporter from '../config/nodemailer.js';
import { EMAIL_VERIFY_TEMPLATE, PASSWORD_RESET_TEMPLATE } from '../config/emailTemplates.js';

//---------------- Register User ----------------//
export const register = async (req, res) => {
    const { name, email, password } = req.body;

    // Check if all required fields are provided
    if (!name || !email || !password) {
        return res.json({ success: false, message: "Missing details" })
    }

    try {
        // Check if user already exists
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.json({ success: false, message: "User already exists" });
        }

        // Hash the password before saving
        const hashedpassword = await bcrypt.hash(password, 10);

        // Create new user document
        const user = new userModel({ name, email, password: hashedpassword });
        await user.save();

        // Generate JWT token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.cookie('token', token, {
            httpOnly: true, // prevents client-side JS from accessing the cookie
            secure: process.env.NODE_ENV === 'production', // use HTTPS only in production
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict', // cross-site cookie handling
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        })


        //--------------------------------------------------
        // Sending welcome email using Gamil SMTP
        // const mailOptions = {
        //     from: `"GreatAuth" <${process.env.GMAIL_USER}>`,
        //     to: email,
        //     subject: "Welcome !",
        //     text: `Welcome, your account has been created with email: ${email}`,
        //     html: `<h2>Welcome!</h2><p>Your account has been created with email: <b>${email}</b></p>` // optional HTML
        // };
        // try {
        //     await transporter.sendMail(mailOptions);
        // } catch (emailErr) {
        //     console.error("EMAIL ERROR:", emailErr);
        //     return res.json({ success: false, message: "Email sending failed" });
        // }
        //--------------------------------------------------

        //--------------------------------------------------
        // Sending welcome email using Brevo SMTP
        const mailOptions = {
            from: `"GreatAuth" <${process.env.SENDER_EMAIL}>`, // Brevo verified sender
            to: email, // user's email
            subject: "Welcome ! 🎉",
            text: `Welcome, your account has been created with email: ${email}`,
            html: `
                    <div style="max-width:500px;margin:30px auto;padding:24px;
                    font-family:Arial;background:#ffffff;border-radius:12px;
                    box-shadow:0 6px 20px rgba(0,0,0,0.08);">

                    <h2 style="margin:0 0 12px;color:#2563eb;">🎉 Welcome to GreatAuth</h2>
                    <p style="color:#374151;font-size:15px;">
                        Your account has been successfully created with this email:
                    </p>

                    <p style="font-size:16px;font-weight:600;color:#111827;">
                        ${email}
                    </p>

                    <p style="font-size:13px;color:#6b7280;">
                        You can now start using your account securely.
                    </p>
                    </div>
                `
        };

        try {
            await transporter.sendMail(mailOptions); // send email
        } catch (emailErr) {
            console.error("EMAIL ERROR:", emailErr);
            return res.json({ success: false, message: "Email sending failed", error: emailErr.message });
        }
        //--------------------------------------------------

        return res.json({ success: true, message: "Account registered successful" });
    } catch (err) {
        res.json({ success: false, message: err.message })
    }
}

//---------------- Login User ----------------//
export const login = async (req, res) => {
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
        return res.json({ success: false, message: "Email and password are required." })
    }
    try {
        const user = await userModel.findOne({ email });

        // Check if user exists
        if (!user) {
            return res.json({ success: false, message: "Invalid email" });
        }

        // Compare entered password with hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.json({ success: false, message: "Invalid password" })
        }

        // Generate JWT token for logged-in user
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict', // cross-site cookie handling
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.json({ success: true, message: "Login successful" })
    } catch (err) {
        return res.json({ success: false, message: err.message });
    }
}

//---------------- Logout User ----------------//
export const logout = async (req, res) => {
    try {
        // Clear JWT cookie
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        })
        return res.json({ success: true, message: "Logged out" })
    } catch (err) {
        return res.json({ success: false, message: err.message });
    }
}

//---------------- Send Verification OTP ----------------//
export const sendVerifyOtp = async (req, res) => {
    try {
        const userId = req.userId;
        const user = await userModel.findById(userId);

        // Check if account is already verified
        if (user.isAccountVerified) {
            return res.json({ success: false, message: "Account already verified." });
        }

        // Generate 6-digit OTP
        const otp = String(Math.floor(100000 + Math.random() * 900000));
        user.verifyOtp = otp;
        user.verifyOtpExpiredAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours expiry
        await user.save();

        // Prepare email with OTP
        const mailOptions = {
            from: `"GreatAuth" <${process.env.SENDER_EMAIL}>`,
            to: user.email,
            subject: "Account Verification OTP",
            text: `Your OTP is ${otp}, Verify your account using this OTP. This is valid for 24 hours.`,
            html: EMAIL_VERIFY_TEMPLATE.replace("{{email}}", user.email).replace("{{otp}}", otp) 

        };

        try {
            await transporter.sendMail(mailOptions); // send OTP email
        } catch (emailErr) {
            console.error("EMAIL ERROR:", emailErr);
            return res.json({ success: false, message: "Email sending failed", error: emailErr.message });
        }

        res.json({ success: true, message: "Verify OTP sent on email." })
    } catch (err) {
        return res.json({ success: false, message: err.message });
    }
}

//---------------- Verify Email using OTP ----------------//
export const verifyEmail = async (req, res) => {
    const userId = req.userId;

    const { otp } = req.body;

    // Check if required details are provided
    if (!userId || !otp) {
        return res.json({ success: false, message: "Missing details" });
    }

    try {
        const user = await userModel.findById(userId);

        // Check if user exists
        if (!user) {
            return res.json({ success: false, message: "User not found." });
        }
        console.log("verify otp : ", user.verifyOtp);
        console.log("otp : ", otp);

        // Check if OTP is expired
        if (user.verifyOtpExpiredAt < Date.now()) {
            return res.json({ success: false, message: "OTP Expired" });
        }

        // Validate OTP
        if (user.verifyOtp === "" || user.verifyOtp !== otp) {
            return res.json({ success: false, message: "Invalid OTP" });
        }

        // Mark account as verified and reset OTP
        user.isAccountVerified = true;
        user.verifyOtp = "";
        user.verifyOtpExpiredAt = 0;
        await user.save();

        return res.json({ success: true, message: "Email verified successfully." })
    } catch (err) {
        return res.json({ success: false, message: err.message });
    }
}


//Check if user is Authenticated
export const isAuthenticated = async (req, res) => {
    try {
        return res.json({ success: true });
    } catch (err) {
        return res.json({ success: false, message: err.message });

    }
}


// Send password Reset OTP
export const sendResetOTP = async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.json({ success: false, message: "Email is required" });

    }
    try {
        const user = await userModel.findOne({ email: email })
        if (!user) {
            return res.json({ success: false, message: "User not found." });
        }
        // Generate 6-digit OTP
        const otp = String(Math.floor(100000 + Math.random() * 900000));
        user.resetOtp = otp;
        user.restOtpExpiredAt = Date.now() + 15 * 60 * 1000; // 15 minutes99 expiry
        await user.save();

        // Prepare email with OTP
        const mailOptions = {
            from: `"GreatAuth" <${process.env.SENDER_EMAIL}>`,
            to: user.email,
            subject: "Password rest OTP",
            text: `Your OTP for reseting your password is ${otp}. Use this OTP to proceed with resetting your password. This is valid for 15 minutes.`,
            html: PASSWORD_RESET_TEMPLATE.replace("{{email}}", user.email).replace("{{otp}}", otp)

        };

        try {
            await transporter.sendMail(mailOptions); // send OTP email
        } catch (emailErr) {
            console.error("EMAIL ERROR:", emailErr);
            return res.json({ success: false, message: "Email sending failed", error: emailErr.message });
        }

        return res.json({ success: true, message: "Otp sent to your email" })

    } catch (err) {
        return res.json({ success: false, message: err.message });
    }
}


//Reset user password 
export const resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
        return res.json({ success: false, message: "Email, OTP , and new password are required." });

    }

    try {
        const user = await userModel.findOne({ email: email });
        if (!user) {
            return res.json({ success: false, message: "User not found." });
        }
        if (user.resetOtp === "" || user.resetOtp !== otp) {
            return res.json({ success: false, message: "Invalid OTP." });
        }
        if (user.restOtpExpiredAt < Date.now()) {
            return res.json({ success: false, message: "OTP Expired." });
        }

        const hashedpassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedpassword;
        user.resetOtp = "";
        user.restOtpExpiredAt = 0;
        await user.save();

        return res.json({ success: true, message: "Password has been reset successfully." });
    } catch (err) {
        res.json({ success: false, message: err.message });
    }
}