import AlertProvider from "./ui/context/providers/AlertProvider";
import AuthProvider from "./ui/context/providers/AuthProvider";
import UserProvider from "./ui/context/providers/UserProvider";
import AppLayout from "./ui/layouts/AppLayout";
import StoriesProvider from "./ui/context/providers/StoriesProvider";
import ChaptersProvider from "./ui/context/providers/ChaptersProvider";
import CommentsProvider from "./ui/context/providers/CommentsProvider";

function App() {
  return (
    <AlertProvider>
      <UserProvider>
        <AuthProvider>
          <StoriesProvider>
            <ChaptersProvider>
              <CommentsProvider>
                <AppLayout />
              </CommentsProvider>
            </ChaptersProvider>
          </StoriesProvider>
        </AuthProvider>
      </UserProvider>
    </AlertProvider>
  );
}

export default App;
