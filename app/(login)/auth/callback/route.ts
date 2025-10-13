import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { and, eq } from 'drizzle-orm'
import { db } from '@/lib/db/drizzle'
import { users, teams, teamMembers, activityLogs, type NewUser, type NewTeam, type NewTeamMember, ActivityType, invitations } from '@/lib/db/schema'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      const user = data.user

      // Check if user exists in our database
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.supabaseId, user.id))
        .limit(1)

      if (existingUser.length === 0) {
        // User is new, create them in our database
        const newUser: NewUser = {
          email: user.email!,
          supabaseId: user.id,
          name: user.user_metadata?.name || user.email!.split('@')[0],
          role: 'owner'
        }

        const [createdUser] = await db.insert(users).values(newUser).returning()

        if (createdUser) {
          // Create a new team for the user
          const newTeam: NewTeam = {
            name: `${user.email}'s Team`
          }

          const [createdTeam] = await db.insert(teams).values(newTeam).returning()

          if (createdTeam) {
            const newTeamMember: NewTeamMember = {
              userId: createdUser.id,
              teamId: createdTeam.id,
              role: 'owner'
            }

            await db.insert(teamMembers).values(newTeamMember)
            await db.insert(activityLogs).values({
              teamId: createdTeam.id,
              supabaseUserId: user.id,
              action: ActivityType.SIGN_UP
            })
          }
        }
      } else {
        // User exists, update their email if it changed
        const dbUser = existingUser[0]
        if (dbUser.email !== user.email) {
          await db
            .update(users)
            .set({ email: user.email })
            .where(eq(users.id, dbUser.id))
        }
      }
    }
  }

  // URL to redirect to after sign up process completes
  return NextResponse.redirect(`${origin}${next}`)
}