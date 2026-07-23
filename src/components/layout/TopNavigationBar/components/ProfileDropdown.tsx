'use client'

import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Image from 'next/image'
import defaultLogo from '@/assets/images/logo.png'
import { Dropdown, DropdownHeader, DropdownItem, DropdownMenu, DropdownToggle } from 'react-bootstrap'
import { useGetGeneralSettingsQuery } from '@/store/generalSettingsApi'
import { useAppDispatch } from '@/hooks/useAppDispatch'
import { logout } from '@/store/authSlice'
import { useRouter } from 'next/navigation'

const ProfileDropdown = () => {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const { data: generalSettings } = useGetGeneralSettingsQuery()
  
  const logoUrl = generalSettings?.logo || defaultLogo

  const handleLogout = () => {
    dispatch(logout())
    router.push('/auth/sign-in')
  }

  return (
    <Dropdown className="topbar-item">
      <DropdownToggle
        as={'a'}
        type="button"
        className="topbar-button content-none"
        id="page-header-user-dropdown "
        data-bs-toggle="dropdown"
        aria-haspopup="true"
        aria-expanded="false">
        <span className="d-flex align-items-center">
          <Image className="rounded-circle" width={32} height={32} src={logoUrl} alt="avatar-3" />
        </span>
      </DropdownToggle>
      <DropdownMenu className="dropdown-menu-end">
        <DropdownHeader as={'h6'} className="dropdown-header">
          Welcome Moviemart!
        </DropdownHeader>

        <div className="dropdown-divider my-1" />
        <DropdownItem className="text-danger" onClick={handleLogout}>
          <IconifyIcon icon="bx:log-out" className="fs-18 align-middle me-1" />
          <span className="align-middle">Logout</span>
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  )
}

export default ProfileDropdown
