// Storybook mock for @clerk/nextjs — story-controlled auth state.
// No TypeScript syntax: this file is copied verbatim into Vite's
// optimizeDeps bundle, which treats it as plain JS.
let signedIn = false;

export function __setSignedIn(next) {
  signedIn = next;
}

export function useAuth() {
  return {
    isSignedIn: signedIn,
    userId: signedIn ? "user_fixture" : null,
    getToken: async () => (signedIn ? "clerk-jwt-fixture" : null),
  };
}

export function useUser() {
  return { isLoaded: true, isSignedIn: signedIn, user: null };
}

export function SignIn() {
  return null;
}
export function SignUp() {
  return null;
}
export function UserButton() {
  return null;
}
export function ClerkProvider({ children }) {
  return children;
}
