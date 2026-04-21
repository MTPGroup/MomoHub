import { useForm } from '@tanstack/react-form'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import {
  ArrowLeft,
  EyeIcon,
  EyeOffIcon,
  Loader2,
  Lock,
  Mail,
  MailCheck,
  RefreshCw,
} from 'lucide-react'
import { type ReactElement, useEffect, useState } from 'react'
import { toast } from 'sonner'
import z from 'zod'
import {
  loginMutation,
  registerByEmailMutation,
  requestEmailVerificationMutation,
  verifyEmailMutation,
} from '#/client/@tanstack/react-query.gen'
import type {
  LoginData,
  RegisterByEmailData,
  RequestEmailVerificationData,
  VerifyEmailData,
} from '#/client/types.gen'
import { Button } from '#/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '#/components/ui/dialog'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '#/components/ui/field'
import { Input } from '#/components/ui/input'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '#/components/ui/input-group'
import { setAuth } from '#/stores/auth'

type Mode = 'login' | 'register' | 'verify'

const baseSchema = z.object({
  email: z.string(),
  password: z.string(),
  confirmPassword: z.string(),
  otp: z.string(),
})

const loginSchema = baseSchema.extend({
  email: z.email('请输入有效的邮箱地址'),
  password: z.string().min(1, '密码不能为空'),
})

const registerSchema = baseSchema
  .extend({
    email: z.email('请输入有效的邮箱地址'),
    password: z.string().min(6, '密码至少6位'),
    confirmPassword: z.string().min(1, '请确认密码'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: '两次输入的密码不一致',
    path: ['confirmPassword'],
  })

const verifySchema = baseSchema.extend({
  email: z.email('请输入有效的邮箱地址'),
  otp: z.string().min(1, '请输入验证码'),
})

interface Props {
  children: ReactElement
}

export function AuthForm({ children }: Props) {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<Mode>('login')
  const [registeredEmail, setRegisteredEmail] = useState('')
  const [countdown, setCountdown] = useState(0)
  const [showPassword, setShowPassword] = useState(false)

  const login = useMutation({
    ...loginMutation(),
    onSuccess: async (res) => {
      const loginData = res?.data
      if (!loginData) return

      setAuth({
        name: loginData.user.name,
        avatar: loginData.user.avatar,
        status: loginData.user.status,
        accessToken: loginData.accessToken,
      })

      setOpen(false)
      navigate({ to: '/' })
    },
    onError: (error, variables) => {
      const isUnverified = error.error_code === 'EMAIL_NOT_VERIFIED'
      const email = variables.body.email

      if (isUnverified && email) {
        setRegisteredEmail(email)
        setMode('verify')
        const payload: RequestEmailVerificationData = {
          url: '/api/v1/auth/email-verification/request',
          body: { email },
        }
        requestVerification.mutate(payload)
        toast.error('邮箱尚未验证', {
          description: '验证码已发送至您的邮箱，请查收并输入',
        })
        return
      }

      toast.error('登录失败', {
        description: error?.message || '请检查邮箱或密码',
      })
    },
  })

  const register = useMutation({
    ...registerByEmailMutation(),
    onSuccess: (_, variables) => {
      const email = variables.body.email
      setRegisteredEmail(email)
      toast.success('注册成功', {
        description: '验证码已发送至邮箱，请查收邮件',
      })
      setMode('verify')
    },
    onError: (error) => {
      toast.error('注册失败', {
        description: error?.message || '该邮箱可能已被注册',
      })
    },
  })

  const requestVerification = useMutation({
    ...requestEmailVerificationMutation(),
    onSuccess: () => {
      const targetEmail =
        registeredEmail || (form.getFieldValue('email') as string) || ''
      toast.success('验证码已发送', {
        description: targetEmail
          ? `请查看 ${targetEmail} 的收件箱`
          : '请查收邮件',
      })
      setCountdown(60)
    },
    onError: (error) => {
      toast.error('发送失败', {
        description: error?.message || '请稍后重试',
      })
    },
  })

  const verifyEmail = useMutation({
    ...verifyEmailMutation(),
    onSuccess: () => {
      toast.success('邮箱验证成功', {
        description: '请使用新账号登录',
      })
      setMode('login')
    },
    onError: (error) => {
      toast.error('验证失败', {
        description: error?.message || '验证码错误或已过期',
      })
    },
  })

  const isRegister = mode === 'register'
  const isVerify = mode === 'verify'
  const schema = isRegister
    ? registerSchema
    : isVerify
      ? verifySchema
      : loginSchema

  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      otp: '',
    },
    validators: {
      onChange: schema,
    },
    onSubmit: async ({ value }) => {
      if (isRegister) {
        const payload: RegisterByEmailData = {
          url: '/api/v1/auth/register/email',
          body: {
            email: value.email,
            password: value.password,
          },
        }
        register.mutate(payload)
      } else if (isVerify) {
        const email = registeredEmail || value.email
        const payload: VerifyEmailData = {
          url: '/api/v1/auth/email-verification/verify',
          body: {
            email,
            otp: value.otp,
          },
        }
        verifyEmail.mutate(payload)
      } else {
        const payload: LoginData = {
          url: '/api/v1/auth/login',
          body: {
            email: value.email,
            password: value.password,
          },
        }
        login.mutate(payload)
      }
    },
  })

  const isPending =
    login.isPending ||
    register.isPending ||
    requestVerification.isPending ||
    verifyEmail.isPending

  const handleResend = () => {
    const email = registeredEmail || (form.getFieldValue('email') as string)
    if (!email || countdown > 0) return
    const payload: RequestEmailVerificationData = {
      url: '/api/v1/auth/email-verification/request',
      body: { email },
    }
    requestVerification.mutate(payload)
  }

  const headerTitle = isVerify
    ? '验证邮箱'
    : isRegister
      ? '创建账号'
      : '欢迎回来'

  const headerDesc = isVerify
    ? registeredEmail
      ? `验证码已发送至 ${registeredEmail}`
      : '请输入邮箱和验证码完成验证'
    : isRegister
      ? '填写下方信息注册新账号'
      : '请输入您的账号信息以继续'

  const switchMode = (newMode: Mode) => {
    if (newMode === 'login') {
      setRegisteredEmail('')
    }
    setMode(newMode)
    form.reset() // 切换模式时清空表单错误，避免干扰
  }

  // 60s 倒计时
  useEffect(() => {
    if (countdown <= 0) return
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [countdown])

  // 注册或登录拦截后进入验证模式时预填邮箱
  useEffect(() => {
    if (mode === 'verify' && registeredEmail) {
      form.setFieldValue('email', registeredEmail)
    }
  }, [mode, registeredEmail, form])

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v)
        if (!v) setTimeout(() => switchMode('login'), 300) // 关闭弹窗后重置模式
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className='max-w-100 gap-0 overflow-hidden border-none p-0 shadow-2xl'>
        <div className='p-8'>
          {/* Header */}
          <div className='mb-8 flex flex-col items-center gap-3 text-center'>
            <div className='space-y-1'>
              <DialogTitle className='text-2xl font-bold tracking-tight text-foreground'>
                {headerTitle}
              </DialogTitle>
              <DialogDescription className='text-sm text-muted-foreground'>
                {headerDesc}
              </DialogDescription>
            </div>
          </div>

          {/* Form */}
          <form
            id='auth-form'
            onSubmit={(e) => {
              e.preventDefault()
              e.stopPropagation()
              form.handleSubmit()
            }}
          >
            <FieldGroup className='gap-5'>
              <form.Field name='email'>
                {(field) => (
                  <Field
                    className={
                      isVerify && registeredEmail ? undefined : undefined
                    }
                  >
                    <FieldLabel
                      htmlFor={field.name}
                      className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'
                    >
                      邮箱
                    </FieldLabel>
                    <div className='relative'>
                      <Mail className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
                      <Input
                        id={field.name}
                        value={registeredEmail || field.state.value}
                        onBlur={field.handleBlur}
                        onChange={
                          isVerify && registeredEmail
                            ? undefined
                            : (e) => field.handleChange(e.target.value)
                        }
                        placeholder='name@example.com'
                        autoComplete='email'
                        readOnly={isVerify && !!registeredEmail}
                        className={`pl-10 ${isVerify && registeredEmail ? 'bg-muted text-muted-foreground' : ''}`}
                      />
                    </div>
                    <FieldError errors={field.state.meta.errors} />
                  </Field>
                )}
              </form.Field>

              {!isVerify && (
                <form.Field name='password'>
                  {(field) => (
                    <Field>
                      <FieldLabel
                        htmlFor={field.name}
                        className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'
                      >
                        密码
                      </FieldLabel>
                      <div className='relative'>
                        <Lock className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
                        <InputGroup>
                          <InputGroupInput
                            id={field.name}
                            type={showPassword ? 'text' : 'password'}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            placeholder={
                              isRegister ? '至少6位字符' : '请输入密码'
                            }
                            autoComplete={
                              isRegister ? 'new-password' : 'current-password'
                            }
                            className='pl-10'
                          />
                          <InputGroupAddon align='inline-end'>
                            <Button
                              variant='ghost'
                              size='icon-sm'
                              className='rounded-full'
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                            </Button>
                          </InputGroupAddon>
                        </InputGroup>
                      </div>
                      <FieldError errors={field.state.meta.errors} />
                    </Field>
                  )}
                </form.Field>
              )}

              {isRegister && (
                <form.Field name='confirmPassword'>
                  {(field) => (
                    <Field>
                      <FieldLabel
                        htmlFor={field.name}
                        className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'
                      >
                        确认密码
                      </FieldLabel>
                      <div className='relative'>
                        <Lock className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
                        <Input
                          id={field.name}
                          type='password'
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder='再次输入密码'
                          autoComplete='new-password'
                          className='pl-10'
                        />
                      </div>
                      <FieldError errors={field.state.meta.errors} />
                    </Field>
                  )}
                </form.Field>
              )}

              {isVerify && (
                <form.Field name='otp'>
                  {(field) => (
                    <Field>
                      <FieldLabel
                        htmlFor={field.name}
                        className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'
                      >
                        验证码
                      </FieldLabel>
                      <div className='relative'>
                        <MailCheck className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
                        <Input
                          id={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          placeholder='请输入6位验证码'
                          autoComplete='one-time-code'
                          className='pl-10'
                        />
                      </div>
                      <FieldError errors={field.state.meta.errors} />
                    </Field>
                  )}
                </form.Field>
              )}
            </FieldGroup>
          </form>
        </div>

        {/* Footer */}
        <div className='flex flex-col gap-4 border-t bg-muted/40 p-6'>
          <Button
            type='submit'
            form='auth-form'
            disabled={isPending}
            className='w-full border border-zinc-900 bg-zinc-900 font-semibold text-white shadow-sm hover:bg-zinc-800'
          >
            {isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            {isPending
              ? isVerify
                ? '验证中...'
                : isRegister
                  ? '注册中...'
                  : '登录中...'
              : isVerify
                ? '验 证'
                : isRegister
                  ? '注 册'
                  : '登 录'}
          </Button>

          {isVerify && (
            <Button
              type='button'
              variant='ghost'
              size='sm'
              disabled={requestVerification.isPending || countdown > 0}
              onClick={handleResend}
              className='text-xs text-muted-foreground hover:text-foreground'
            >
              <RefreshCw
                className={`mr-1 h-3 w-3 ${requestVerification.isPending ? 'animate-spin' : ''}`}
              />
              {countdown > 0
                ? `${countdown}s 后可重新发送`
                : registeredEmail
                  ? '重新发送验证码'
                  : '发送验证码'}
            </Button>
          )}

          <p className='text-center text-xs text-muted-foreground'>
            {isVerify ? (
              <button
                type='button'
                onClick={() => switchMode('login')}
                className='inline-flex items-center font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400'
              >
                <ArrowLeft className='mr-1 h-3 w-3' />
                返回登录
              </button>
            ) : isRegister ? (
              <>
                已有账号？
                <button
                  type='button'
                  onClick={() => switchMode('login')}
                  className='ml-1 font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400'
                >
                  去登录
                </button>
              </>
            ) : (
              <>
                <span className='inline-block'>
                  还没有账号？
                  <button
                    type='button'
                    onClick={() => switchMode('register')}
                    className='ml-1 font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400'
                  >
                    立即注册
                  </button>
                </span>
                {/* <span className='mx-1.5 text-muted-foreground/50'>|</span> */}
                {/* <button */}
                {/*   type='button' */}
                {/*   onClick={() => { */}
                {/*     setRegisteredEmail('') */}
                {/*     setMode('verify') */}
                {/*   }} */}
                {/*   className='font-medium text-indigo-600 underline-offset-4 hover:underline dark:text-indigo-400' */}
                {/* > */}
                {/*   验证邮箱 */}
                {/* </button> */}
              </>
            )}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
