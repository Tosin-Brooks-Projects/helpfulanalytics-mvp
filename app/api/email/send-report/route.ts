import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { Resend } from 'resend';

// Use dummy key for build/dev if missing, but logging warning in dev
const resendKey = process.env.RESEND_API_KEY || "re_dummy_key_for_build"
const resend = new Resend(resendKey);

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const formData = await req.formData();
        const file = formData.get('file') as Blob;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());

        const data = await resend.emails.send({
            from: 'Analytics Report <onboarding@resend.dev>', // Update this with your verified domain in production
            to: session.user.email,
            subject: 'Your Analytics Report',
            html: '<p>Here is your requested analytics dashboard report.</p>',
            attachments: [
                {
                    filename: 'analytics-report.pdf',
                    content: buffer,
                },
            ],
        });

        if (data.error) {
            return NextResponse.json({ error: data.error.message }, { status: 400 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Email sending failed:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
