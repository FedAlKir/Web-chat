function handleSendBtnClick(){
    fetch('/send_message', {
        method: "POST",
        body: document.querySelector('#message_text').value
    })
    .then(response => response.json())
    .then(data => {
        let messagesList = document.getElementById('messages_list');
        let newMessage = [data.sender, data.message];
        let newMessageEl = document.createElement('p');
        newMessageEl.innerHTML = `<p class="message">${newMessage[0]}: ${newMessage[1]}</p>`;
        messagesList.appendChild(newMessageEl);
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
    console.log('qwerty');
    fetch('/create_chat', {
        method: 'GET'
    })
    .then(response => {
        document.location.replace(response.url);
    })
}

let chatButtons = document.getElementsByClassName('chat_button');
for (let b in chatButtons){
    b.addEventListener("click", function(e){
        fetch('/get_messages', {
            method: "POST",
            body: b.value,
        })
        .then(response => response.json())
        .then(data => {
            document.getElementById('chat_header').style.display = 'block';
            document.getElementById('message_input').style.display = 'block';
            let messagesList = document.getElementById('messages_list');
            messagesList.removeChild(messagesList.getElementsByClassName('inf_p'));
            if (data.messages.length > 0){
                data.messages.forEach(function(m){
                    let messageEl = document.createElement('p');
                    newMessageEl.innerHTML = `<p class="message">${m[0]}: ${m[1]}<p>`;
                    messagesList.appendChild(messageEl);
                })
            }
            else{
                let noMessagesEl = document.createElement('p');
                noMessagesEl.innerHTML = `<p class="inf_p">Here is no messages yet<p>`;
                messagesList.appendChild(noMessagesEl);
            }
        })
    })
}

document.addEventListener('DOMContentLoaded', function(){
    const button = document.querySelector('#send_message_btn');
    button.addEventListener('click', handleSendBtnClick);
});

document.addEventListener('DOMContentLoaded', function(){
    const button = document.querySelector('#search_button');
    button.addEventListener('click', handleSearchBtnClick);
});

document.addEventListener('DOMContentLoaded', function(){
    const button = document.getElementById('create_new_chat_button');
    button.addEventListener('click', handleCreateChatBtnClick);
});

console.log('123123');
