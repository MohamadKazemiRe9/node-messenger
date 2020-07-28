let users = [];

const addUser = ({id,username,room}) =>{
    username = username.toLowerCase();
    if(!username || !room){
        return {
            error:"username and room are requireds!"
        }
    }
    isExists = users.find(user=>{
        return user.room === room && user.username===username
    });
    if(isExists){
        return {error:"username is already exits"}
    }
    const user = {id,username,room}
    users.push(user);
    return { user };
}

// remove user
const removeUser = (id)=>{
    const userRemoved = users.find(user=>user.id===id);
    users = users.filter(user=> user.id !== id);
    return userRemoved;
}

// get user
const getUser = (id) => {
    const user = users.find(user=>user.id===id)
    return user ? user : undefined;
}

// users in room
const getUsersInRoom = room => {
    return users.filter(user=> user.room === room);
}

module.exports = {addUser,removeUser,getUser,getUsersInRoom}