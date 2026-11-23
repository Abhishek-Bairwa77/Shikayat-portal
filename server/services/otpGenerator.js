import crypto from 'crypto';


export default function genOtp (){
    let otp = '';
    for(let i =0; i<6; i++){
        otp+=crypto.randomInt(0,10);
    }
    return otp;
}

console.log(genOtp())

