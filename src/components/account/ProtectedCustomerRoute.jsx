import { Navigate } from "react-router-dom";
import { useCustomerAuth } from "../../context/CustomerAuthContext.jsx";

const ProtectedCustomerRoute = ({ children }) => {
    const { isAuthenticated } = useCustomerAuth();

    if (!isAuthenticated) {
        return <Navigate to="/account/login" replace />;
    }

    return children;
};

export default ProtectedCustomerRoute;
