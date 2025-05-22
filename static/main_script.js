function handleSendBtnClick(){
    fetch('/send_message', {
        method: "POST",
        body: document.querySelector('#message_text').value
    })
    let messagesList = document.getElementById('messages_list');
    if (document.getElementsByClassName('message').length == 0){
        messagesList.textContent = '';
    }
    let newMessageEl = document.createElement('p');
    newMessageEl.innerHTML = `<p class="message">You: ${document.querySelector('#message_text').value}</p>`;
    messagesList.appendChild(newMessageEl);
    document.querySelector('#message_text').value = '';
    messagesScroll();
}

function handleAddPersonBtnClick(){
    fetch('/add_person', {
        method: 'POST',
        body: document.getElementById('add_person_input').value
    })
    .then(responce => responce.json())
    .then(data => {
        let dt = JSON.stringify({
            'chat_name': data.chatName,
            'chat_id': data.id,
            'people': [data.personId]
        });
        socket.emit('create_new_chat', dt);
    })
}

function handleSearchBtnClick(){
    fetch('/search_chat', {
        method: 'POST',
        body: document.getElementById('search_input').value
    })
    .then(request => request.json())
    .then(data => {
        document.getElementById('search_input').value = '';
        if (data.id == -1){
            let searchDiv = document.getElementById('search_chat');
            let errorP = document.createElement('p');
            errorP.innerHTML = '<p id="chat-not-exsists-p">This chat doesn\'t exsists</p>';
            searchDiv.appendChild(errorP);
            setTimeout(() => {
                searchDiv.removeChild(errorP);
            }, 5000);
        }
        else{
            let buff = document.getElementById(`${data.id}`);
            console.log(buff);
            buff.click();
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

function messagesScroll(){
    document.getElementById('messages_list').scrollTo(0, document.getElementById('messages_list').scrollHeight);
}

document.addEventListener('DOMContentLoaded', function(){
    let chatButtons = document.body.getElementsByClassName('chat_button');
    let chatButtonsArray = Array.from(chatButtons);
    chatButtonsArray.forEach(function(b){
        b.addEventListener("click", function(e){
            socket.emit('leave');
            socket.emit('join', b.value)
            fetch('/get_messages', {
                method: "POST",
                body: b.value,
            })
            .then(response => response.json())
            .then(data => {
                document.getElementById('chat_name').textContent = b.textContent;
                document.getElementById('chat_header').style.display = 'flex';
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
        if (document.querySelector('#message_text').value.length == 0){
            return;
        }
        socket.emit('send_new_message', JSON.stringify({
            'message': document.querySelector('#message_text').value
        }));
        handleSendBtnClick();
    });
});

document.addEventListener('DOMContentLoaded', function(){
    const button = document.querySelector('#search_button');
    button.addEventListener('click', function(){
        if (document.querySelector('#search_input').value.length == 0){
            return;
        }
        handleSearchBtnClick();
    });
});

document.addEventListener('DOMContentLoaded', function(){
    const button = document.getElementById('create_new_chat_button');
    button.addEventListener('click', handleCreateChatBtnClick);
});

document.addEventListener('DOMContentLoaded', function(){
    const button = document.getElementById('add_person_button');
    button.addEventListener('click', handleAddPersonBtnClick);
})

const socket = io();

socket.on('new_message', (data) => {
    fetch('/get_username', {
        method: 'GET'
    })
    .then(responce => responce.json())
    .then(username => {
        let messagesList = document.getElementById('messages_list');
        if (document.getElementsByClassName('message').length == 0){
            messagesList.textContent = '';
        }
        if (username.username != data.sender){
            let newMessage = [data.sender, data.message];
            let newMessageEl = document.createElement('p');
            newMessageEl.innerHTML = `<p class="message">${newMessage[0]}: ${newMessage[1]}</p>`;
            messagesList.appendChild(newMessageEl);
            messagesScroll();
        }
    })
});

socket.on('new_chat', (data) => {
    console.log('new chat recived');
    let newChatEl = document.createElement('button');
    newChatEl.innerHTML = `<button class = 'chat_list' value='${data.id}'>${data.chat_name}</button>`
    document.getElementById('chat_list').prepend();
})
