import z from "zod";
import { useAuth } from "../../../hooks/useAuth";
import { useNavigate } from "react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Eye, EyeClosed } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import { loginSchema } from "../../../schemas/user.schema";

type LoginFormValues = z.infer<typeof loginSchema>;

const LoginForm = () => {
  // Utility to Show Password
  const [showPassword, setShowPassword] = useState<boolean>(false);
  // Use Auth
  const { login, loading } = useAuth();
  // Use Navigate
  const navigate = useNavigate();
  // Use Form
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(loginSchema)
  })

  // On Submit
  const onSubmit = async (data: LoginFormValues) => {
    const { principal, password } = data;
    const success = await login(principal, password);
    if (success) {
      navigate("/explore")
      reset();
    }
  }

  return (
    <div className="grow flex flex-col justify-center max-w-md mx-auto w-full mt-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-global mb-2">Bienvenido</h1>
        <p className="text-several-light">¿Preparado para entintarte?</p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-widest text-several-light ml-1">
            Usuario o Correo
          </label>
          <input
            type="text"
            className="w-full bg-inputs-bg border-none text-global placeholder-several-light rounded-xl px-5 py-4 mt-2 focus:ring-2 focus:ring-high-enfasis focus:outline-none transition-all"
            placeholder="ejemplo@Lectoria.dev"
            {...register("principal")}
          />
          {errors.principal && <p>{errors.principal.message}</p>}
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-xs font-semibold uppercase tracking-widest text-several-light ml-1">
              Contraseña
            </label>
            <Link
              to="/recovery-pass"
              className="text-xs font-medium text-several-light hover:text-high-enfasis transition-colors"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
          <div className="relative">
            <input
              type={`${showPassword ? "text" : "password"}`}
              className="w-full bg-inputs-bg border-none text-global placeholder-several-light rounded-xl px-5 py-4 mt-2 focus:ring-2 focus:ring-high-enfasis focus:outline-none transition-all"
              placeholder="Ingresa tu contraseña"
              autoComplete="off"
              {...register("password")}
            />
            {errors.password && <p>{errors.password.message}</p>}
            <button
              className="text-several-light hover:text-high-enfasis absolute top-6.5 right-4"
              type="button"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeClosed size={20} className="cursor-pointer"></EyeClosed>
              ) : (
                <Eye size={20} className="cursor-pointer"></Eye>
              )}
            </button>
          </div>
        </div>
        <button
          className={`w-full hover:scale-[0.98] duration-300 ease-in-out transition-all mt-2 font-bold py-4 rounded-full ${!loading ? "cursor-pointer bg-primary-container text-on-primary-fixed hover:shadow-lg hover:shadow-high-enfasis/20}" : "cursor-default"}`}
          type="submit"
          disabled={loading}
        >
          {!loading ? ("Iniciar Sesión") : (
            <div className="flex items-center justify-center w-full h-full">
              <div className="loading-button" />
            </div>
          )}
        </button>
      </form>
    </div>
  );
};

export default LoginForm;
