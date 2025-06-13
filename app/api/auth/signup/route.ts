// app/api/auth/signup/route.ts
import { supabase } from '@/lib/supabaseClient';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { email, password, fullName } = await req.json();

    if (!email || !password || !fullName) {
      return NextResponse.json({ message: 'Email, password, and full name are required.' }, { status: 400 });
    }

    if (password.length < 6) {
        return NextResponse.json({ message: 'Password must be at least 6 characters long.' }, { status: 400 });
    }

    const { data: existingUser, error: selectError } = await supabase
      .from('users')
      .select('email')
      .eq('email', email)
      .single();

    if (selectError && selectError.code !== 'PGRST116') {
      console.error('Error checking for existing user:', selectError);
      return NextResponse.json({ message: 'Error checking user existence. Please try again.' }, { status: 500 });
    }

    if (existingUser) {
      return NextResponse.json({ message: 'User with this email already exists.' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert([
        {
          email: email,
          hashed_password: hashedPassword,
          username: fullName,
        },
      ])
      .select('id, email, username')
      .single();

    if (insertError) {
      console.error('Error inserting user into Supabase:', insertError);
      return NextResponse.json({ message: 'Could not create user. Please try again.' }, { status: 500 });
    }

    return NextResponse.json({ message: 'User created successfully!', user: newUser }, { status: 201 });

  } catch (error: unknown) {
    console.error('Signup API error:', error);
    if (error instanceof SyntaxError) {
        return NextResponse.json({ message: 'Invalid request format.' }, { status: 400 });
    }
    return NextResponse.json({ message: (error as Error).message || 'An unexpected error occurred.' }, { status: 500 });
  }
}
