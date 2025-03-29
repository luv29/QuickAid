import { Injectable } from '@nestjs/common';

@Injectable()
export class MessagesService {
  private otpMap = new Map<string, { otp: string; expiry: number }>();
  private otpExpiryTime = 10 * 60 * 1000;

  async getOtp(phone: string) {
    const sender_id = 'TXXTOO';
    // const apikey = 'PGQVweSwfUsoIuKn';
    const template_id = '1607100000000295088';
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    console.log('this is otp ', otp);

    const message = `${otp} is the verification code to log in to your Quic account. DO NOT share this code with anyone.

    Thanks,
    mazinda.com Text2`;

    const response = await fetch(
      `http://textsms.thetechmore.in/http-tokenkeyapi.php?authentic-key=3637436974696b617274743130301734346258&senderid=${sender_id}&route=1&number=${phone}&message=${message}&templateid=${template_id}`,
    );

    console.log('this is response ', response);

    if (response.ok) {
      this.otpMap.set(phone, { otp, expiry: Date.now() + this.otpExpiryTime });
      return true;
    } else {
      throw new Error('Failed to send OTP');
    }
  }

  verifyOtp(phone: string, otp: string) {
    const storedOtp = this.otpMap.get(phone);
    if (!storedOtp) {
      return false;
    }

    // Check if OTP has expired
    if (storedOtp.expiry <= Date.now()) {
      this.otpMap.delete(phone); // Delete expired OTP
      return false;
    }

    // Verify OTP
    const isValid = storedOtp.otp === otp;

    // Only delete if verification was successful
    if (isValid) {
      this.otpMap.delete(phone);
    }

    return isValid;
  }
}
