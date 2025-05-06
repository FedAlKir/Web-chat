window.onload = (event) => {
    initMultiselect();
  };
  
  function initMultiselect() {
    checkboxStatusChange();
  
    document.addEventListener("click", function(evt) {
      var flyoutElement = document.getElementById('myMultiselect'),
        targetElement = evt.target; // clicked element
  
      do {
        if (targetElement == flyoutElement) {
          // This is a click inside. Do nothing, just return.
          //console.log('click inside');
          return;
        }
  
        // Go up the DOM
        targetElement = targetElement.parentNode;
      } while (targetElement);
  
      // This is a click outside.
      toggleCheckboxArea(true);
      //console.log('click outside');
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
  function handleLoginBtnClick(){
    var checkboxes = document.getElementById("mySelectOptions");
    var checkedCheckboxes = checkboxes.querySelectorAll('input[type=checkbox]:checked');
    console.log(checkedCheckboxes.value);
    fetch('/login', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({'login': document.getElementById('login').value, 'password': document.getElementById('password').value, 'people': checkedCheckboxes.value})
    })
  }

  document.addEventListener('DOMContentLoaded', function(){
    const button = document.querySelector('#login-button');
    button.addEventListener('click', handleLoginBtnClick);
});