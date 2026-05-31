import AuthProvider from "../features/auth/AuthProvider";

export default function Providers({ children }) {
  return <AuthProvider>{children}</AuthProvider>;
}