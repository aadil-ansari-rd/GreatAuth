import { createContext, useEffect} from "react";
import { useState } from "react";
export const AppContent = createContext();
import axios from "axios";
import { toast } from "react-toastify";
export const AppContextProvider = (props) => {

    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const [isLoggedin, setIsLoggedin] = useState(false) ;
    const [userData, setUserData] = useState(null) ;

    const getAuthState = async () => {
        try {
            const {data} = await axios.get(backendUrl + '/api/auth/is-auth', { withCredentials: true });
            if(data.success){
                setIsLoggedin(true);
                getUserData();
            }else{
                
            }
        } catch (error) {
            toast.error(error.message);
        }
    }

    const getUserData = async () => {
        try {
            const {data} = await axios.get(backendUrl + '/api/user/data', { withCredentials: true });
            data.success?setUserData(data.userData):toast.error(data.message);
        } catch (error) {
            toast.error(error.message);
        }
    }



    useEffect(() => {
        getAuthState();
    }, []);

    const value = {
        backendUrl,
        isLoggedin,
        setIsLoggedin,
        userData,
        setUserData,
        getUserData
    };

    return (
        <AppContent.Provider value={value}>
            {props.children}
        </AppContent.Provider>
    )
} 
