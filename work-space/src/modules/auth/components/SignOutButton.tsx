import { useNavigate } from 'react-router';
import { Button } from '@/shared/ui';
import { useLogoutMutation } from '../api/authApi';
import { LOGIN_PATH } from '../utils/redirect';

export function SignOutButton() {
  const [logout, { isLoading }] = useLogoutMutation();
  const navigate = useNavigate();

  return (
    <Button
      variant="ghost"
      size="sm"
      isLoading={isLoading}
      onClick={async () => {
        try {
          await logout().unwrap();
        } finally {
          // Even if the server call fails, leave the authenticated area.
          await navigate(LOGIN_PATH, { replace: true });
        }
      }}
    >
      Sign out
    </Button>
  );
}
