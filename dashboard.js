

const serverUrl = "https://ga-bler.vercel.app";

document.getElementById('serverUrl').textContent = serverUrl;

function setReward() {
    const userID = document.getElementById('setUserID').value;
    const reward = document.getElementById('setReward').value;
    const resultEl = document.getElementById('setResult');
    const linkEl = document.getElementById('setLink');

    if (!userID || !reward) {
        showResult(resultEl, 'please fill out fields', 'error');
        return;
    }

    const url = `${serverUrl}/setReward?userID=${encodeURIComponent(userID)}&reward=${encodeURIComponent(reward)}`;
    linkEl.textContent = `GET: ${url}`;
    fetch(url)
        .then(response => response.text())
        .then(data => {
            showResult(resultEl, `${data}`, `success`);
        })
        .catch(error => {
            showResult(resultEl, `error: ${error}`, 'error');
        });
}

function getReward() {
    const userID = document.getElementById('setUserID').value;
    const resultEl = document.getElementById('setResult');
    const linkEl = document.getElementById('setLink');

    if (!userID) {
        showResult(resultEl, 'please enter user id', 'error');
        return;
    }
    const url = `${serverUrl}/getReward?userID=${encodeURIComponent(userID)}`;
    linkEl.textContent = `GET: ${url}`;

    fetch(url)
        .then(response => response.text())
        .then(data => {
            showResult(resultEl, `${data}`, `success`);
        })
        .catch(error => {
            showResult(resultEl, `error: ${error}`, 'error');
        });

}

function showResult(element, message, type) {
    element.innerHTML = message;
    element.className = `result ${type}`;
}