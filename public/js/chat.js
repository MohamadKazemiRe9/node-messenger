const socket = io();

const $locationButton = document.querySelector("#btnSendMessage");
const $form = document.querySelector("form");
const $inputForm = $form.querySelector("#inputMessage");
const $buttonForm = $form.querySelector("button");
const $messages = document.querySelector("#massages");

const messageTemplate = document.querySelector("#massgae_template").innerHTML;
const locationMessageTemplate = document.querySelector("#location_massgae_template").innerHTML;
const side_bar_list_users = document.querySelector("#side_bar_list_users").innerHTML;

$buttonForm.disabled=true;


const autoScroll = () => {
    const newMessage = $messages.lastElementChild;
    const newMessageStyle = getComputedStyle(newMessage);
    const newMessageMargin = parseInt(newMessageStyle.marginBottom);
    const newMessageHeight = newMessage.offsetHeight + newMessageMargin;
    const visibleHeight = $messages.offsetHeight;
    const containerHeight = $messages.scrollHeight;
    const scrollOffest = $messages.scrollTop+visibleHeight;

    if(containerHeight - newMessageHeight <= scrollOffest){
        $messages.scrollTop = $messages.scrollHeight
    }

    console.log(newMessageMargin)
}

const {username , room} = Qs.parse(location.search,{ ignoreQueryPrefix:true })

socket.on('getMessage',(message)=>{
    // console.log(socket.id)
    if(message.id===socket.id){
        let username = "you : "
        const html = Mustache.render(messageTemplate,{
            message:message.text,createdAt:moment(message.createdAt).format("HH:mm A"),
            username
        });
        $messages.insertAdjacentHTML('beforeend',html);
    }else{
        let username = "system message : "
        if(message.username){
            username = message.username
        }
        const html = Mustache.render(messageTemplate,{
            message:message.text,createdAt:moment(message.createdAt).format("HH:mm A"),
            username
        });
        $messages.insertAdjacentHTML('beforeend',html);
    }
    autoScroll();
});

socket.on('locationMessage',(url) =>{
    const html = Mustache.render(locationMessageTemplate,{
        url:url.text,createdAt:moment(url.createdAt).format("HH:mm A"),
        username:url.username
    });
    $messages.insertAdjacentHTML('beforeend',html);
    autoScroll();
});

let msg = document.querySelector("#inputMessage")

$inputForm.addEventListener('keyup',()=>{
    if($inputForm.value.trim()!==""){
        $buttonForm.disabled=false;
    }else{
        $buttonForm.disabled=true;
    }
})

document.querySelector("#btnSendMessage").addEventListener("click",(e)=>{
    e.preventDefault();
    socket.emit('sendMessage',msg.value,(error)=>{
    });
    msg.value="";
    $buttonForm.disabled=true;
});

document.querySelector("#share_location").addEventListener('click',function (e){
    e.preventDefault();
    this.disabled=true;
    if(!navigator.geolocation){
        return ("your location is not accessable!");
    }
    navigator.geolocation.getCurrentPosition((position)=>{
        // console.log(position.coords);
        const sendPosition = {latitude:position.coords.latitude,
                            longitude:position.coords.longitude}
        socket.emit("sendLocation",sendPosition,(ack)=>{
            if(ack){
                this.disabled=false;
            }
        });
    });
});

socket.emit('join',{username , room} , (error)=>{
    if(error){
        alert(error);
        location.href="/";
    }
});


socket.on("userList",({room,userList})=>{
    const html = Mustache.render(side_bar_list_users,{
        room,
        userList
    });
    document.querySelector('#users_template').innerHTML = html;
});
