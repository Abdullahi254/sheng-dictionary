import { Resend } from 'resend'

// Singleton so every module shares one Resend instance
export const resend = new Resend(process.env.RESEND_API_KEY)
