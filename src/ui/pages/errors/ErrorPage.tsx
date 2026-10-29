import { Link } from "react-router"

interface Props {
  statusCode: number,
  messageError: string,
}

function ErrorPage ({messageError, statusCode}: Props) {
  return (
    <div className='grid min-h-screen content-center gap-2 px-4 text-center'>
      <h3 className='text-base sm:text-xl animate-kana-float break-words'>{messageError.toLocaleUpperCase()}</h3>
      <h1 className='text-7xl sm:text-9xl font-extrabold text-error animate-kana-float'>{statusCode}</h1>
      <Link className="mt-10 px-6 text-sm py-3 rounded-lg bg-primary text-on-primary font-medium shadow-lg hover:bg-primary-container transition-colors w-fit mx-auto" to="/">Volver al inicio</Link>
    </div>
  )
}

export default ErrorPage