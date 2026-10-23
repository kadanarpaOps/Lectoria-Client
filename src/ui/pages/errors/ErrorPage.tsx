import { Link } from "react-router"

interface Props {
  statusCode: number,
  messageError: string,
}

function ErrorPage ({messageError, statusCode}: Props) {
  return (
    <div className='grid content-center h-screen text-center'>
      <h3 className='text-xl animate-kana-float'>{messageError.toLocaleUpperCase()}</h3>
      <h1 className='text-9xl font-extrabold text-error animate-kana-float'>{statusCode}</h1>
      <Link className="mt-10 px-6 text-sm py-3 rounded-lg bg-primary text-on-primary font-medium shadow-lg hover:bg-primary-container transition-colors w-fit mx-auto" to="/">Volver al inicio</Link>
    </div>
  )
}

export default ErrorPage