import { AuthRequired } from '#/features/auth/components/auth-required'
import type { ProfileState } from '../hooks/use-profile'
import { ProfileEditCard } from './profile-edit-card'
import { ProfileSummaryCard } from './profile-summary-card'

export function ProfileContent({
  profile,
}: {
  profile: ProfileState
}) {
  return (
    <div className='mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8'>
      <section className='space-y-3'>
        <h1 className='font-serif text-3xl font-bold tracking-tight'>
          个人资料
        </h1>
        <p className='text-sm leading-6 text-muted-foreground'>
          在这里维护你的公开头像与昵称。
        </p>
      </section>

      <AuthRequired>
        <div className='grid gap-6 md:grid-cols-[320px_1fr]'>
          <ProfileSummaryCard profile={profile} />
          <ProfileEditCard profile={profile} />
        </div>
      </AuthRequired>
    </div>
  )
}
