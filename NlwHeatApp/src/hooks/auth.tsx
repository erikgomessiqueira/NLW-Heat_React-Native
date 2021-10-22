import React, { createContext, useContext, useEffect, useState} from "react";
import * as AuthSessions from 'expo-auth-session'
import AsyncStorage from "@react-native-async-storage/async-storage";

import { api } from "../services/api";

const CLIENT_ID = '5a7dd4c1704b0fbba615'
const SCOPE ='read:user'//O qu eu quero fazer ler(read) os dados do usuario(user)
const USER_STORAGE = '@nlwheatapp:user'
const TOKEN_STORAGE = '@nlwheatapp:token'
type User ={
    id: string,
    avatar_url: string,
    name: string,
    login: string
}

type AuthContextData ={
    user: User | null
    isSingningIn: boolean
    signIn: () => Promise<void>
    signOut: () => Promise<void>
}

type AuthProviderProps={
    children: React.ReactNode
}

type AuthResponse ={
    token: string,
    user: User,
}

type AuthorizationResponse={
    params: {
        code?: string,
        error?: string
    },
    type?: string
}

export const AuthContext = createContext({} as AuthContextData)

function AuthProvider({children}: AuthProviderProps){
    const [isSingningIn, setIsSingningIn] = useState(true)
    const [user, setUser] = useState<User | null>(null)

    
    async function signIn() {
        try {
            setIsSingningIn(true)
            const authUrl = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&scope=${SCOPE}`;
            const authSessionResponse = await AuthSessions.startAsync({authUrl}) as AuthorizationResponse

            if(authSessionResponse.type === 'success' && authSessionResponse.params.error !== 'access_denied'){
                const authResponse = await api.post('/authenticate', {code: authSessionResponse.params.code})
                    const { user, token } = authResponse.data as AuthResponse

                    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
                    await AsyncStorage.setItem(USER_STORAGE, JSON.stringify(user))
                    await AsyncStorage.setItem(TOKEN_STORAGE, token)

                    setUser(user)

            }

        setIsSingningIn(false)
        } 
        catch (error) {
            console.log(error)
        }
        finally{
            setIsSingningIn(false)
        }
        
    }

    async function signOut() {
        setUser(null)
        await AsyncStorage.removeItem(USER_STORAGE)
        await AsyncStorage.removeItem(TOKEN_STORAGE)
    }

    useEffect(()=> {
        async function loadUserStorageData(){
            const userStorage = await AsyncStorage.getItem(USER_STORAGE)
            const tokenStorage = await AsyncStorage.getItem(TOKEN_STORAGE)

            if(userStorage && tokenStorage){
                api.defaults.headers.common['Authorization'] = `Bearer ${tokenStorage}`
                setUser(JSON.parse(userStorage))
            }

            setIsSingningIn(false)
        }

        loadUserStorageData()
    },[])

    return(
    <AuthContext.Provider value={{
        signIn,
        signOut,
        user,
        isSingningIn: isSingningIn,
    }}>
        {children}
    </AuthContext.Provider>
    )
}

function useAuth(){
    const context = useContext(AuthContext)

    return context
}

export{ AuthProvider, useAuth }




