//context is a storage in React that can be accessed from anywhere 
//in the component tree (so you dont have to pass props all around)
import React from 'react';

export default React.createContext({
    token: null,
    userId: null,
    login: (token, userId, tokenExpiration) => {},
    logout: () => {}
})