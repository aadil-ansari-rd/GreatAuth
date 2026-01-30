import { createContext} from "react";
import { useState } from "react";
export const AppContent = createContext();
import axios from "axios";
import { toast } from "react-toastify";
export const AppContextProvider = (props) => {

    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const [isLoggedin, setIsLoggedin] = useState(false) ;
    const [userData, setUserData] = useState(null) ;

    const getUserData = async () => {
        try {
            const {data} = await axios.get(backendUrl + '/api/user/data', { withCredentials: true });
            console.log(data.success);
            console.log(data);
            data.success?setUserData(data.userData):toast.error(data.message);
        } catch (error) {
            toast.error(error.message);
        }
    }

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
