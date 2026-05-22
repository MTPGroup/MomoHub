import { createFileRoute } from '@tanstack/react-router'
import { ProfileContent } from '#/features/profile/components/profile-content'
import { useProfile } from '#/features/profile/hooks/use-profile'

export const Route = createFileRoute('/profile')({ component: ProfilePage })

function ProfilePage() {
  const profile = useProfile()

  return <ProfileContent profile={profile} />
}
