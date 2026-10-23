import AlertProvider from "./ui/context/providers/AlertProvider";
import AuthProvider from "./ui/context/providers/AuthProvider";
import UserProvider from "./ui/context/providers/UserProvider";
import AppLayout from "./ui/layouts/AppLayout";

function App() {
  return (
    <AlertProvider>
      <UserProvider>
        <AuthProvider>
          <AppLayout />
        </AuthProvider>
      </UserProvider>
    </AlertProvider>
  );
}

export default App;
