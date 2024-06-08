import React, { useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { doSignInWithEmailAndPassword, doSignInWithGoogle } from "../../../firebase/auth";
import { useAuth } from "../../../contexts/authContext";
import "./Login.css";   

const Login = () => {
    const { userLoggedIn } = useAuth();
    
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setErrorMessage] = useState("");
    const [isSigningIn, setIsSigningIn] = useState(false);

    const onSubmit = async (e) => {
        e.preventDefault();
        if (!isSigningIn) {
            setIsSigningIn(true);
            try {
                await doSignInWithEmailAndPassword(email, password);
                setIsSigningIn(false);
                return <Navigate to="/home" />;
            } catch (error) {
                setErrorMessage(error.message);
                setIsSigningIn(false);
            }
        }
    };

    const signInWithGoogle = async () => {
        if (!isSigningIn) {
            setIsSigningIn(true);
            try {
                await doSignInWithGoogle();
                setIsSigningIn(false);
            } catch (error) {
                setErrorMessage(error.message);
                setIsSigningIn(false);
            }
        }
    };

    return (
        <div className="login-container">
            {userLoggedIn && <Navigate to="/home"/>}
            <div className="login-content">
                <div className="login-card">
                    <div className="login-card-body">
                        <h1 className="login-heading">Login</h1>
                        <form onSubmit={onSubmit}>
                            <div className="form-group">
                                <input
                                    type="email"
                                    className="form-control"
                                    placeholder="Email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <input
                                    type="password"
                                    className="form-control"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={isSigningIn}
                                >
                                    {isSigningIn ? "Logging in..." : "Login"}
                                </button>
                            </div>
                            <div className="login-text-center">
                                <Link to="/register" className="btn btn-link">Don't have an account? Sign up</Link>
                            </div>
                            {error && <div className="alert alert-danger mt-3">{error}</div>}
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
