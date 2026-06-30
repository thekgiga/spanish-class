/**
 * DesignShowcase — legacy route; redirects to the new Editorial Teaching Studio
 * design-system showcase at /design-system (delivered in Phase 1).
 */
import { Navigate } from "react-router-dom";

export function DesignShowcase() {
  return <Navigate to="/design-system" replace />;
}
