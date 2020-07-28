const generateMessage = ({text,username,id})=>{
    return {
        text,
        createdAt : new Date().getTime(),
        username,
        id
    }
}

module.exports = generateMessage;