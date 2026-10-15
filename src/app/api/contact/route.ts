import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

const MAX_NAME = 100;
const MAX_EMAIL = 254;
const MAX_SUBJECT = 200;
const MAX_MESSAGE = 5000;

// Conservative single-line email check. Rejects CR/LF and anything that could
// break out of the SMTP headers.
const EMAIL_RE = /^[^\s@,;<>()[\]\\]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

const text = (value: unknown, max: number): string =>
	typeof value === 'string' ? value.trim().slice(0, max) : '';

export async function POST(req: Request) {
	try {
		const contentType = req.headers.get('content-type') ?? '';
		if (!contentType.includes('application/json')) {
			return NextResponse.json(
				{ error: 'Content-Type must be application/json' },
				{ status: 415 },
			);
		}

		let body: unknown;
		try {
			body = await req.json();
		} catch {
			return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
		}

		if (typeof body !== 'object' || body === null) {
			return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
		}

		const { name, email, subject, message } = body as Record<string, unknown>;

		const name_ = text(name, MAX_NAME);
		const email_ = text(email, MAX_EMAIL);
		const subject_ = text(subject, MAX_SUBJECT);
		const message_ = text(message, MAX_MESSAGE);

		if (!name_ || !message_) {
			return NextResponse.json(
				{ error: 'Missing required fields' },
				{ status: 400 },
			);
		}

		if (!EMAIL_RE.test(email_)) {
			return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
		}

		const user = process.env.CONTACT_EMAIL;
		const pass = process.env.CONTACT_PASS;

		if (!user || !pass) {
			console.error('CONTACT_EMAIL / CONTACT_PASS are not configured.');
			return NextResponse.json(
				{ error: 'Failed to send message' },
				{ status: 500 },
			);
		}

		const transporter = nodemailer.createTransport({
			service: 'gmail',
			auth: { user, pass },
		});

		await transporter.sendMail({
			// Envelope sender is the site's own address. The visitor's address only
			// ever appears as a Reply-To, so visitor input can never become a
			// header the SMTP server acts on.
			from: user,
			replyTo: email_,
			to: user,
			subject: subject_ || `New message from ${name_}`,
			text: [
				`Name: ${name_}`,
				`Email: ${email_}`,
				'',
				'Message:',
				message_,
			].join('\n'),
		});

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Email error:', error);
		return NextResponse.json(
			{ error: 'Failed to send message' },
			{ status: 500 },
		);
	}
}