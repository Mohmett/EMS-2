import React, { use, useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import supabase from '../lib/SupabaseClient'

const IsAdmin = () => {

    const [isAdmin, setIsAdmin] = useState(false)
    const {user}=useAuth()

    useEffect(()=>{
        const fetchData= async()=>{
        const {data, error} = await supabase
        .from('profiles')
        .select("user_role")
        .eq('id', user.id)
        .single()
        if(data.user_role=='admin'){
            setIsAdmin(true)
        }
    }
        fetchData()
    },[])

        console.log(isAdmin)


  return (
    <div>IsAdmin</div>
  )
}

export default IsAdmin