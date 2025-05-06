function handleSendBtnClick(){
    fetch('/send_message', {
        method: "POST",
        body: document.querySelector('#message_text').value,
    })
    .then(response => response.json())
    .then(data => {
        let messagesList = document.getElementById('messages_list');
        let newMessage = data[data.length - 1];
        let newMessageEl = document.createElement('p');
        messagesList.appendChild(newMessageEl);
        newMessageEl.innerHTML = `<p class="message">${newMessage[0]}: ${newMessage[1]}</p>`;
    })
}

document.addEventListener('DOMContentLoaded', function(){
    const button = document.querySelector('#send_message_btn');
    button.addEventListener('click', handleSendBtnClick);
});