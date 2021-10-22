import React from 'react';

import {
    Text,
    View,
    TouchableOpacity
} from 'react-native';

import { UserPhoto } from '../UserPhoto'
import LogoSvg from '../../assets/logo.svg';

import { styles } from './styles';
import { useAuth } from '../../hooks/auth';

export function Header(){
    const {user, signOut} = useAuth() 

    return (
        <View style={styles.container}>
            <LogoSvg />

            <View style={styles.logoutButton}>
                {
                    user
                        ?   <TouchableOpacity onPress={signOut}>
                                <Text style={styles.logoutText}>
                                    Sair
                                </Text>
                            </TouchableOpacity>
                        :   null
                }

                <UserPhoto 
                    imageURI={user?.avatar_url} 
                />
            </View>
            
        </View>
    );
}