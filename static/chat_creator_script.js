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
    fetch('/create_chat', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            'chat_name': document.getElementById('chat_name').value,
            'people': people
        })
    })
    .then(response => {
        document.location.replace(response.url);
    })
}

document.addEventListener('DOMContentLoaded', function(){
    const button = document.getElementById('create_chat_btn');
    button.addEventListener('click', handleCreateChatBtnClick);
});