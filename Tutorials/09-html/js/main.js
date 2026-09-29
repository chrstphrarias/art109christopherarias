//console.log("js works")


const header = document.querySelector('#header');
const changeHeaderButton = document.querySelector('#change-header-button');
const changeThemeButton = document.querySelector('#change-theme-button');
const img1 = document.querySelector('#img1');
const img2 = document.querySelector('#img2');
const img3 = document.querySelector('#img3');

//change header with button click
changeHeaderButton.addEventListener('click', () => {
    header.textContent = 'Cake!';
});

//change theme with button click
changeThemeButton.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    changeButtonText();
});
 
// change button text
function changeButtonText() {
    if (document.body.classList.contains('dark')) { 
        changeThemeButton.textContent = 'Change to Light Theme';
    } else {
        changeThemeButton.textContent = 'Change to Dark Theme';
    }
}

//toggle image visibility
img1.addEventListener('click', () => {
    img2.classList.remove('hidden');
})
img2.addEventListener('click', () => {
    img3.classList.remove('hidden');
})