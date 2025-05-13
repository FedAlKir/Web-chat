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
    var checkboxValue = item.getAttribute('value');
    values.push(checkboxValue);
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

function handleSignupBtnClick(){
    let checkboxes = document.getElementById("mySelectOptions");
    let checkedCheckboxes = checkboxes.querySelectorAll('input[type=checkbox]:checked');
    let people = [];
    checkedCheckboxes.forEach(checkBox => people.push(checkBox.getAttribute('value')));
    fetch('/signup', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            'login': document.getElementById('login').value,
            'password': document.getElementById('password').value,
            'username': document.getElementById('username').value,
            'people': people
        })
    })
    .then(response => {
        if (response.url == document.URL){
            return response.json();
        }
        else{
            document.location.replace(response.url);
        }
    })
    .then(data => {
        if (data.success == false){
            let errorLabel = document.createElement('p');
            errorLabel.innerHTML = `<p>${data.message}</p>`;
            document.body.appendChild(errorLabel);
        }
    })
}

function handleLoginBtnClick(){
    fetch('/login', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            'login': document.getElementById('login').value, 
            'password': document.getElementById('password').value
        })
    })
    .then(response => {
        if (response.url == document.URL){
            return response.json();
        }
        else{
            document.location.replace(response.url);
        }
    })
    .then(data => {
        if (data.success == false){
            let errorLabel = document.createElement('p');
            errorLabel.innerHTML = `<p>${data.message}</p>`;
            document.body.appendChild(errorLabel);
        }
    })
}

document.addEventListener('DOMContentLoaded', function(){
    const button = document.getElementById('signup-btn');
    button.addEventListener('click', function(){
        fetch('/signup', {
            method: 'GET'
        })
        .then(response => {
            document.location.replace(response.url);
        })
    })
});

document.addEventListener('DOMContentLoaded', function(){
    const button = document.getElementById('login-button');
    button.addEventListener('click', handleLoginBtnClick);
});

document.addEventListener('DOMContentLoaded', function(){
    const button = document.getElementById('signup-button');
    button.addEventListener('click', handleSignupBtnClick);
});