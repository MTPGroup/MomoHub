import { Link } from '@tanstack/react-router'

export function Footer() {
  return (
    <footer className='border-t bg-background py-6'>
      <div className='container mx-auto flex flex-col items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 md:flex-row'>
        <p className='text-center text-sm text-muted-foreground md:text-left'>
          © {new Date().getFullYear()} Momohub. All rights reserved.
        </p>
        <div className='flex items-center gap-4'>
          <Link
            to='/'
            className='text-sm text-muted-foreground hover:text-foreground'
          ></Link>
        </div>
      </div>

      <div className='container mx-auto mt-4 flex flex-col items-center justify-center gap-1 px-4 text-xs text-muted-foreground'>
        <a
          href='https://beian.miit.gov.cn/'
          target='_blank'
          rel='noreferrer'
          className='hover:text-foreground'
        >
          京ICP备xxxxxxxx号-1
        </a>
        {/* <span>京公网安备 xxxxxxxxxxxx号</span> */}
      </div>
    </footer>
  )
}
