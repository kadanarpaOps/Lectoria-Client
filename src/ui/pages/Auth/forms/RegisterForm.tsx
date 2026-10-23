import type z from "zod";
import { useNavigate } from "react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { RegisterUserRequest } from "../../../../core/domain/models/users/UserModel";
import { registerSchema } from "../../../schemas/user.schema";
import { useUsers } from "../../../hooks/useUsers";

type RegisterFormValues = z.infer<typeof registerSchema>;

const RegisterForm = () => {
  // Use Navigate
  const navigate = useNavigate();
  // Use Users
  const { registerUser, loading } = useUsers();
  // Use Form
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(registerSchema)
  })

  // On Submit
  const onSubmit = async (data: RegisterFormValues) => {
    const registerRequest: RegisterUserRequest = { ...data, roleNames: ["LECTORIA_LECTOR", "LECTORIA_WRITER"] };
    const success = await registerUser(registerRequest);
    if (success) {
      const authAction = "LOGIN";
      navigate("/auth", {
        state: { authAction }
      });
      reset();
    }
  }

  return (
    <>
      <div className="w-full max-w-md flex flex-col">
        <div className="mt-1 mb-10">
          <h2 className="text-3xl font-semibold text-global tracking-tight">
            Bienvenido a Lectoria
          </h2>
          <p className="text-several-light mt-2 font-light">
            Crea tu biblioteca personal y comienza a escribir hoy mismo
          </p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-widest text-several-light ml-1">
              Nombre de usuario
            </label>
            <div className="relative group">
              <input
                type="text"
                className="w-full bg-inputs-bg/30 border-none rounded-xl py-4 px-5 text-global placeholder-several-light/40 focus:ring-2 focus:ring-high-enfasis transition-all outline-none focus:outline-none mt-2"
                placeholder="ej. Scriptor_Lectoria"
                {...register("username")}
              />
              {errors.username && <p>{errors.username.message}</p>}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-widest text-several-light ml-1">
              Correo Electrónico
            </label>
            <div className="relative group">
              <input
                type="email"
                className="w-full bg-inputs-bg/30 border-none rounded-xl py-4 px-5 text-global placeholder-several-light/40 focus:ring-2 focus:ring-high-enfasis transition-all outline-none focus:outline-none mt-2"
                placeholder="ejemplo@Lectoria.com"
                {...register("email")}
              />
              {errors.email && <p>{errors.email.message}</p>}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-widest text-several-light ml-1">
              Contraseña
            </label>
            <div className="relative group">
              <input
                type="password"
                className="w-full bg-inputs-bg/30 border-none rounded-xl py-4 px-5 text-global placeholder-several-light/40 focus:ring-2 focus:ring-high-enfasis transition-all outline-none focus:outline-none mt-2"
                placeholder="Pon tu Clave"
                autoComplete="off"
                {...register("password")}
              />
              {errors.password && <p>{errors.password.message}</p>}
            </div>
          </div>
          <button
            className={`w-full duration-300 ease-in-out transition-all mt-2 font-bold py-4 rounded-full ${!loading ? "bg-high-enfasis hover:bg-high-enfasis/90 text-on-primary-fixed font-semibold py-4 rounded-full transition-all duration-300 shadow-lg shadow-high-enfasis/20 hover:scale-[0.98] cursor-pointer" : "cursor-default"}`}
            type="submit"
            disabled={loading}
          >
            {!loading ? ("Crear Cuenta") : (
              <div className="flex items-center justify-center w-full h-full">
                <div className="loading-button" />
              </div>
            )}
          </button>
        </form>
      </div>
    </>
  );
};

export default RegisterForm;
