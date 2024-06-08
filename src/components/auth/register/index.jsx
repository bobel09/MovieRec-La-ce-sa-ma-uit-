import React, {useState} from "react";
import {Navigate, Link} from "react-router-dom";
import { doCreateUserWithEmailAndPassword } from "../../../firebase/auth";
import {useAuth} from "../../../contexts/authContext/index";
import {userLoggedIn} from "../login/index.jsx";
import "./Register.css";

const Register = () => {

    const {userLoggedIn} = useAuth();
    const [email,setEmail] = useState("");
    const [password,setPassword] = useState("");
    const [error,setErrorMessage] = useState("");
    const [confirmPassword,setConfirmPassword] = useState("");
    const [isSigningUp,setIsSigningUp] = useState(false);

    const onSubmit = async (e) => {
        e.preventDefault();
        if(!isSigningUp){
            setIsSigningUp(true);
            await doCreateUserWithEmailAndPassword(email,password).catch((error) => {
                setErrorMessage(error.message);
                setIsSigningUp(false);
            });
            }
        }
return (
        <div className="register-container">
        {userLoggedIn && <Navigate to="/"/>}
            <div className="register-content">
                <div className="register-card">
                    <div className="register-card-body">
                        <h1>Register</h1>
                        <form onSubmit={onSubmit}>
                            <div className="form-group">
                                <label>Email</label>
                                <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label>Password</label>
                                <input type="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} />
                            </div>
                            <div className="form-group">
                                <label>Confirm Password</label>
                                <input type="password" className="form-control" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                            </div>
                            <div className="form-group">
                                <button type="submit" className="btn btn-primary" disabled={isSigningUp}>Register</button>
                            </div>
                            <div className="form-group">
                                <Link to="/login">Already have an account? Login</Link>
                            </div>
                            {error && <div className="alert alert-danger">{error}</div>}
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default Register;