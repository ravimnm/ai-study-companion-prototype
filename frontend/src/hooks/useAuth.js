import { useContext } from "react";
import { AuthContext } from "../services/auth/AuthContext";

export default function useAuth() {
  return useContext(AuthContext);
}
