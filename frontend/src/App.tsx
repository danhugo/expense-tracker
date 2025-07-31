import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { UserProvider } from './contexts/UserContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { NotificationContainer } from './components/NotificationContainer';
import AppRoutes from './AppRoutes';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <UserProvider>
      <NotificationProvider>
        <BrowserRouter>
          <AppRoutes />
          <NotificationContainer />
        </BrowserRouter>
      </NotificationProvider>
    </UserProvider>
  </QueryClientProvider>
);

export default App;
