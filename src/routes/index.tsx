import { useQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import {
  Bookmark,
  BookOpen,
  Bot,
  Compass,
  LibraryBig,
  Sparkles,
  UserCog,
} from 'lucide-react'
import type { ReactNode } from 'react'
import {
  getCharactersOptions,
  getFavoriteCharactersOptions,
  listKbsOptions,
} from '#/client/@tanstack/react-query.gen'
import { AuthForm } from '#/components/features/auth/auth-form'
import { Button } from '#/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { formatDateTime } from '#/lib/format'
import { useAuth } from '#/stores/auth'

export const Route = createFileRoute('/')({ component: HomePage })

function HomePage() {
  const auth = useAuth()

  const kbQuery = useQuery(
    listKbsOptions({
      query: { page: 1, page_size: 4 },
    }),
  )

  const characterQuery = useQuery(
    getCharactersOptions({
      query: { page: 1, page_size: 4 },
    }),
  )

  const favoritesQuery = useQuery({
    ...getFavoriteCharactersOptions({
      query: { page: 1, page_size: 4 },
    }),
    enabled: Boolean(auth.accessToken),
  })

  const knowledgeBases = kbQuery.data?.data?.items ?? []
  const characters = characterQuery.data?.data?.items ?? []
  const favoriteCharacters = favoritesQuery.data?.data?.items ?? []

  return (
    <div className='mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 py-10 sm:px-6 lg:px-8'>
      <section className='grid gap-6 rounded-2xl border border-border/80 bg-card/95 p-8 shadow-sm md:grid-cols-[1.4fr_1fr]'>
        <div className='space-y-5'>
          <p className='text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase'>
            Momohub Workbench
          </p>
          <h1 className='font-serif text-3xl leading-tight font-bold tracking-tight text-balance sm:text-4xl'>
            在一个工作台里管理知识资产与AI角色
          </h1>
          <p className='max-w-xl text-sm leading-6 text-muted-foreground sm:text-base'>
            统一创建、更新和探索知识库与角色资产。你可以通过知识库驱动角色能力，并在账号中心完成会话安全、模型配置和账户操作。
          </p>
          <div className='flex flex-wrap gap-3'>
            <Button asChild>
              <Link to='/knowledge-bases'>进入知识库</Link>
            </Button>
            <Button
              variant='outline'
              asChild
              className='border-primary/35 hover:bg-primary/10'
            >
              <Link to='/characters'>探索AI角色</Link>
            </Button>
            {auth.accessToken ? (
              <Button
                variant='secondary'
                asChild
                className='border border-border/70'
              >
                <Link to='/settings'>账号设置</Link>
              </Button>
            ) : (
              <AuthForm>
                <Button variant='secondary' className='border border-border/70'>
                  登录后继续
                </Button>
              </AuthForm>
            )}
          </div>
        </div>

        <div className='grid gap-3 text-sm'>
          <Card className='gap-3 border border-border/80 bg-background/70 py-4'>
            <CardHeader className='px-4'>
              <CardDescription>知识库总量（当前页）</CardDescription>
              <CardTitle className='text-2xl'>
                {kbQuery.data?.data?.total ?? 0}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className='gap-3 border border-border/80 bg-background/70 py-4'>
            <CardHeader className='px-4'>
              <CardDescription>角色总量（当前页）</CardDescription>
              <CardTitle className='text-2xl'>
                {characterQuery.data?.data?.total ?? 0}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className='gap-3 border border-border/80 bg-background/70 py-4'>
            <CardHeader className='px-4'>
              <CardDescription>我的收藏角色</CardDescription>
              <CardTitle className='text-2xl'>
                {auth.accessToken
                  ? (favoritesQuery.data?.data?.total ?? 0)
                  : '登录后可见'}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>
      </section>

      <section className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
        <QuickEntryCard
          icon={<LibraryBig className='size-5' />}
          title='知识库管理'
          description='创建、编辑、删除知识库，并上传文档进入向量化流程。'
          to='/knowledge-bases'
        />
        <QuickEntryCard
          icon={<Compass className='size-5' />}
          title='知识库探索'
          description='通过关键词检索公开与个人知识库，快速定位可复用内容。'
          to='/knowledge-bases'
        />
        <QuickEntryCard
          icon={<Bot className='size-5' />}
          title='AI角色管理'
          description='维护角色设定、Prompt、可见范围，并绑定知识库。'
          to='/characters'
        />
        <QuickEntryCard
          icon={<UserCog className='size-5' />}
          title='账号与安全'
          description='管理个人资料、密码、会话、2FA 与模型配置。'
          to='/settings'
        />
      </section>

      <section className='grid gap-6 xl:grid-cols-3'>
        <PreviewList
          title='知识库更新'
          icon={<BookOpen className='size-4' />}
          empty='暂无知识库数据'
          rows={knowledgeBases.map((item) => ({
            key: item.id,
            name: item.name,
            meta: `${item.documentCount} 文档 / ${item.chunkCount} 片段`,
            time: formatDateTime(item.updatedAt),
          }))}
        />

        <PreviewList
          title='角色上新'
          icon={<Sparkles className='size-4' />}
          empty='暂无角色数据'
          rows={characters.map((item) => ({
            key: item.id,
            name: item.name,
            meta: `${item.favoriteCount} 收藏 / ${item.chatCount} 对话`,
            time: formatDateTime(item.createdAt),
          }))}
        />

        <PreviewList
          title='我的收藏'
          icon={<Bookmark className='size-4' />}
          empty={auth.accessToken ? '你还没有收藏角色' : '登录后展示收藏角色'}
          rows={favoriteCharacters.map((item) => ({
            key: item.id,
            name: item.name,
            meta: item.bio || '暂无角色简介',
            time: formatDateTime(item.createdAt),
          }))}
        />
      </section>
    </div>
  )
}

function QuickEntryCard({
  icon,
  title,
  description,
  to,
}: {
  icon: ReactNode
  title: string
  description: string
  to: '/knowledge-bases' | '/characters' | '/settings'
}) {
  return (
    <Card className='gap-4 border border-border/80 bg-card/95 py-5 shadow-sm'>
      <CardHeader className='px-5'>
        <div className='mb-2 inline-flex size-9 items-center justify-center rounded-md border border-primary/30 bg-primary/10 text-primary'>
          {icon}
        </div>
        <CardTitle className='text-base'>{title}</CardTitle>
        <CardDescription className='leading-6'>{description}</CardDescription>
      </CardHeader>
      <CardContent className='px-5'>
        <Button
          variant='outline'
          asChild
          className='w-full border-primary/30 hover:bg-primary/10'
        >
          <Link to={to}>前往</Link>
        </Button>
      </CardContent>
    </Card>
  )
}

function PreviewList({
  title,
  icon,
  rows,
  empty,
}: {
  title: string
  icon: ReactNode
  rows: Array<{ key: string; name: string; meta: string; time: string }>
  empty: string
}) {
  return (
    <Card className='gap-4 border border-border/80 bg-card/95 py-5 shadow-sm'>
      <CardHeader className='px-5'>
        <CardTitle className='flex items-center gap-2 text-base'>
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className='px-5'>
        {rows.length === 0 ? (
          <p className='text-sm text-muted-foreground'>{empty}</p>
        ) : (
          <ul className='space-y-4'>
            {rows.map((row) => (
              <li
                key={row.key}
                className='rounded-md border border-border/80 bg-background/70 p-3'
              >
                <div className='flex items-start justify-between gap-3'>
                  <p className='text-sm font-medium'>{row.name}</p>
                  <span className='shrink-0 text-xs text-muted-foreground'>
                    {row.time}
                  </span>
                </div>
                <p className='mt-1 text-xs leading-5 text-muted-foreground'>
                  {row.meta}
                </p>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
