function handleSendBtnClick(){
    fetch('/send_message', {
        method: "POST",
        body: document.querySelector('#message_text').value
    })
}

function handleSearchBtnClick(){
    fetch('/search_chat', {
        method: 'POST',
        body: document.getElementById('search_input').value
    })
    .then(request => request.json())
    .then(data => {
        if (data.id == -1){
            let searchDiv = document.getElementById('search_chat');
            let errorP = document.createElement('p');
            errorP.innerHTML = '<p>This chat doesn\'t exsists</p>';
            searchDiv.appendChild(errorP);
        }
        else{
            document.getElementById(`${data.id}`).click();
        }
    })
}

function handleCreateChatBtnClick(){
    fetch('/create_chat', {
        method: 'GET'
    })
    .then(response => {
        document.location.replace(response.url);
    })
}

document.addEventListener('DOMContentLoaded', function(){
    let chatButtons = document.body.getElementsByClassName('chat_button');
    let chatButtonsArray = Array.from(chatButtons);
    chatButtonsArray.forEach(function(b){
        socket.emit('leave');
        socket.emit('join', b.value)
        b.addEventListener("click", function(e){
            fetch('/get_messages', {
                method: "POST",
                body: b.value,
            })
            .then(response => response.json())
            .then(data => {
                document.getElementById('chat_header').style.display = 'block';
                document.getElementById('chat_name').textContent = b.textContent;
                document.getElementById('chat_header').style.display = 'block';
                document.getElementById('message_input').style.display = 'block';
                let messagesList = document.getElementById('messages_list');
                messagesList.textContent = '';
                if (data.messages.length > 0){
                    data.messages.forEach(function(m){
                        let messageEl = document.createElement('p');
                        messageEl.innerHTML = `<p class="message">${m[0]}: ${m[1]}<p>`;
                        messagesList.appendChild(messageEl);
                    })
                }
                else{
                    let noMessagesEl = document.createElement('p');
                    noMessagesEl.innerHTML = `<p id="inf_p">Here is no messages yet<p>`;
                    messagesList.appendChild(noMessagesEl);
                }
            })
        })
    });
});

document.addEventListener('DOMContentLoaded', function(){
    const button = document.querySelector('#send_message_btn');
    button.addEventListener('click', function(){
        socket.emit('send_new_message', JSON.stringify({
            'message': document.querySelector('#message_text').value
        }));
        handleSendBtnClick();
    });
});

document.addEventListener('DOMContentLoaded', function(){
    const button = document.querySelector('#search_button');
    button.addEventListener('click', handleSearchBtnClick);
});

document.addEventListener('DOMContentLoaded', function(){
    const button = document.getElementById('create_new_chat_button');
    button.addEventListener('click', handleCreateChatBtnClick);
});

const socket = io();

socket.on('new_message', (data) => {
    fetch('/get_username', {
        method: 'GET'
    })
    .then(responce => responce.json())
    .then(username => {
        document.querySelector('#message_text').value = '';
        let messagesList = document.getElementById('messages_list');
        if (document.getElementsByClassName('message').length == 0){
            messagesList.textContent = '';
        }
        if (username.username == data.sender){
            data.sender = 'You';
        }
        let newMessage = [data.sender, data.message];
        let newMessageEl = document.createElement('p');
        newMessageEl.innerHTML = `<p class="message">${newMessage[0]}: ${newMessage[1]}</p>`;
        messagesList.appendChild(newMessageEl);
    })
});
