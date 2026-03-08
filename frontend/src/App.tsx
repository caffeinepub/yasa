import { createRouter, createRoute, createRootRoute, RouterProvider, Outlet } from '@tanstack/react-router';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useUserProfile';
import AppLayout from './components/layout/AppLayout';
import LandingPage from './pages/LandingPage';
import FeedPage from './components/feed/FeedPage';
import ProfilePage from './components/profile/ProfilePage';
import MessagesPage from './components/messages/MessagesPage';
import ConversationView from './components/messages/ConversationView';
import SearchPage from './components/search/SearchPage';
import NotificationsPage from './components/notifications/NotificationsPage';
import ReportsPage from './components/admin/ReportsPage';
import ProfileSetupModal from './components/profile/ProfileSetupModal';
import AuthGuard from './components/auth/AuthGuard';

function RootLayout() {
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const isAuthenticated = !!identity;

  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  return (
    <>
      <Outlet />
      {showProfileSetup && <ProfileSetupModal />}
    </>
  );
}

const rootRoute = createRootRoute({
  component: RootLayout,
});

function IndexComponent() {
  const { identity } = useInternetIdentity();
  return identity ? (
    <AuthGuard>
      <AppLayout>
        <FeedPage />
      </AppLayout>
    </AuthGuard>
  ) : (
    <LandingPage />
  );
}

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: IndexComponent,
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile/$userId',
  component: () => (
    <AuthGuard>
      <AppLayout>
        <ProfilePage />
      </AppLayout>
    </AuthGuard>
  ),
});

const messagesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/messages',
  component: () => (
    <AuthGuard>
      <AppLayout>
        <MessagesPage />
      </AppLayout>
    </AuthGuard>
  ),
});

const conversationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/messages/$userId',
  component: () => (
    <AuthGuard>
      <AppLayout>
        <ConversationView />
      </AppLayout>
    </AuthGuard>
  ),
});

const searchRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/search',
  component: () => (
    <AuthGuard>
      <AppLayout>
        <SearchPage />
      </AppLayout>
    </AuthGuard>
  ),
});

const notificationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/notifications',
  component: () => (
    <AuthGuard>
      <AppLayout>
        <NotificationsPage />
      </AppLayout>
    </AuthGuard>
  ),
});

const reportsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/reports',
  component: () => (
    <AuthGuard>
      <AppLayout>
        <ReportsPage />
      </AppLayout>
    </AuthGuard>
  ),
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  profileRoute,
  messagesRoute,
  conversationRoute,
  searchRoute,
  notificationsRoute,
  reportsRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
