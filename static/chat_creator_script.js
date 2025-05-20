window.onload = (event) => {
    initMultiselect();
};

function initMultiselect() {
    checkboxStatusChange();

    document.addEventListener("click", function(evt) {
    var flyoutElement = document.getElementById('myMultiselect'),
        targetElement = evt.target;

    do {
        if (targetElement == flyoutElement) {
        return;
        }

        targetElement = targetElement.parentNode;
    } while (targetElement);

    toggleCheckboxArea(true);
    });
}

function checkboxStatusChange() {
    var multiselect = document.getElementById("mySelectLabel");
    var multiselectOption = multiselect.getElementsByTagName('option')[0];

    var values = [];
    var checkboxes = document.getElementById("mySelectOptions");
    var checkedCheckboxes = checkboxes.querySelectorAll('input[type=checkbox]:checked');

    for (const item of checkedCheckboxes) {
    var labelId = item.getAttribute('id');
    values.push(document.querySelectorAll(`label[for="${labelId}"]`)[0].textContent);
    }

    var dropdownValue = "Choose your social circle";
    if (values.length > 0) {
    dropdownValue = values.join(', ');
    }

    multiselectOption.innerText = dropdownValue;
}

function toggleCheckboxArea(onlyHide = false) {
    var checkboxes = document.getElementById("mySelectOptions");
    var displayValue = checkboxes.style.display;

    if (displayValue != "block") {
    if (onlyHide == false) {
        checkboxes.style.display = "block";
    }
    } else {
    checkboxes.style.display = "none";
    }
}

function handleCreateChatBtnClick(){
    let checkboxes = document.getElementById("mySelectOptions");
    let checkedCheckboxes = checkboxes.querySelectorAll('input[type=checkbox]:checked');
    let people = [];
    checkedCheckboxes.forEach(checkBox => people.push(checkBox.getAttribute('value')));
    let id = 0;
    fetch('/create_chat', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            'chat_name': document.getElementById('chat_name').value,
            'people': people
        })
    })
    .then(response => response.json())
    .then(data => {
        id = data.id;
        console.log(id);
    })
    return JSON.stringify({
        'id': id,
        'people': people
    });
}

function getMainPage(){
    fetch('/main', {
        method: 'GET'
    })
    .then(response => document.location.replace(response.url))
}

document.addEventListener('DOMContentLoaded', function(){
    const button = document.getElementById('create_chat_btn');
    button.addEventListener('click', function(){
        if (document.querySelector('#chat_name').value.length == 0){
            let errorLabel = document.createElement('p');
            errorLabel.innerHTML = `<p>Chat name cannot be empty</p>`;
            document.body.appendChild(errorLabel);
            return;
        }
        data = handleCreateChatBtnClick();
        console.log(data);
        return;
        socket.emit('create_new_chat', JSON.stringify({
            'chat_name': document.getElementById('chat_name').value,
            'chat_id': data.id,
            'people': data.people
        }));
        getMainPage();
    });
});

const socket = io();
