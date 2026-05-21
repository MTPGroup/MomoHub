import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'
import {
  changePasswordMutation,
  deleteAccountMutation,
  disableOtpMutation,
  enableOtpMutation,
  setupOtpOptions,
  verifyOtpMutation,
} from '#/client/@tanstack/react-query.gen'
import { clearAuth } from '#/stores/auth'

export function useSecurity({
  onAccountDeleted,
}: {
  onAccountDeleted: () => void
}) {
  const queryClient = useQueryClient()

  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')

  const [otpCode, setOtpCode] = useState('')
  const [otpPrepared, setOtpPrepared] = useState(false)
  const [otpVerified, setOtpVerified] = useState(false)

  const changePassword = useMutation({
    ...changePasswordMutation(),
    onSuccess: () => {
      toast.success('密码修改成功')
      setOldPassword('')
      setNewPassword('')
    },
    onError: (error) => {
      toast.error('密码修改失败', {
        description: error.message || '请稍后重试',
      })
    },
  })

  const verifyOtp = useMutation({
    ...verifyOtpMutation(),
    onSuccess: () => {
      toast.success('OTP 验证成功')
      setOtpVerified(true)
    },
    onError: (error) => {
      toast.error('OTP 验证失败', {
        description: error.message || '请稍后重试',
      })
    },
  })

  const enableOtp = useMutation({
    ...enableOtpMutation(),
    onSuccess: () => {
      toast.success('已启用 OTP')
    },
    onError: (error) => {
      toast.error('启用失败', { description: error.message || '请稍后重试' })
    },
  })

  const disableOtp = useMutation({
    ...disableOtpMutation(),
    onSuccess: () => {
      toast.success('已关闭 OTP')
      setOtpPrepared(false)
      setOtpVerified(false)
      setOtpCode('')
    },
    onError: (error) => {
      toast.error('关闭失败', { description: error.message || '请稍后重试' })
    },
  })

  const deleteAccount = useMutation({
    ...deleteAccountMutation(),
    onSuccess: () => {
      toast.success('账号已注销')
      clearAuth()
      onAccountDeleted()
    },
    onError: (error) => {
      toast.error('注销失败', { description: error.message || '请稍后重试' })
    },
  })

  const initOtp = async () => {
    try {
      await queryClient.fetchQuery(setupOtpOptions())
      toast.success('OTP 初始化成功，请继续验证并启用')
      setOtpPrepared(true)
      setOtpVerified(false)
    } catch (error) {
      const message = error instanceof Error ? error.message : '请稍后重试'
      toast.error('OTP 初始化失败', { description: message })
    }
  }

  const handleOtpVerify = () => {
    verifyOtp.mutate({})
  }

  const handleOtpEnable = () => {
    enableOtp.mutate({})
  }

  const handleOtpDisable = () => {
    disableOtp.mutate({})
  }

  const handleAccountDelete = () => {
    deleteAccount.mutate({})
  }

  const handleChangePassword = () => {
    if (!oldPassword || !newPassword) {
      toast.error('请填写完整密码信息')
      return
    }

    changePassword.mutate({
      body: {
        oldPassword,
        newPassword,
      },
    })
  }

  return {
    form: {
      oldPassword,
      newPassword,
      otpCode,
      setOldPassword,
      setNewPassword,
      setOtpCode,
    },
    state: {
      otpPrepared,
      otpVerified,
      isChanging: changePassword.isPending,
    },
    actions: {
      initOtp,
      verifyOtp: handleOtpVerify,
      enableOtp: handleOtpEnable,
      disableOtp: handleOtpDisable,
      deleteAccount: handleAccountDelete,
      changePassword: handleChangePassword,
    },
  }
}

export type SecurityState = ReturnType<typeof useSecurity>
