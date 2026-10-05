
const searchButton = document.querySelector("#search-button");
const addressInput = document.querySelector("#wallet-address");
const statusText = document.querySelector("#status");

searchButton.addEventListener("click", () => {
    const address = addressInput.value.trim();

    if (address === "") {
        statusText.textContent = "지갑 주소를 입력해 주세요.";
        return;
    }

    statusText.textContent = "주소 입력을 확인했습니다. RPC 연결 전입니다.";
});
