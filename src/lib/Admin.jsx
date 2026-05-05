import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'

const Admin = ({children}) => {

    const [isAdmin, setIsAdmin] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    
    const {profile}=useAuth()

    useEffect(() => {
        if (profile?.user_role === "admin") {
            setIsAdmin(true)
        } else {
            setIsAdmin(false)
            setIsLoading(false)
        }
    },[])


     if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md text-center">

                    <div className="min-h-1/3 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-2 border-green-600 "></div>
                    </div>
                </div>
            </div>
        );
    }
    else {
        if (isAdmin) {
            return <>{children}</>
        }
        // else return <Navigate to='/login'></Navigate>
    }
}

export default Admin