import React from 'react';


function Loading(props) {
    const {loading} = props;
    if (loading) return (<h2>Loading...</h2>);
    return null;
}

export default Loading;