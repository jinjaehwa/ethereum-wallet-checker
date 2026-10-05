
const RPC_URL = "https://ethereum-rpc.publicnode.com";

const searchButton = document.querySelector("#search-button");
const addressInput = document.querySelector("#wallet-address");
const statusText = document.querySelector("#status");
const balanceText = document.querySelector("#balance");
const blockNumberText = document.querySelector("#block-number");

// Ethereum RPC 서버에 요청을 보내는 함수
async function rpcRequest(method, params) {
    const response = await fetch(RPC_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            jsonrpc: "2.0",
            method: method,
            params: params,
            id: 1
        })
    });

    // HTTP 요청 실패 확인
    if (!response.ok) {
        throw new Error(`HTTP 오류: ${response.status}`);
    }

    const data = await response.json();

    // RPC 자체에서 반환한 오류 확인
    if (data.error) {
        throw new Error(data.error.message);
    }

    if (data.result === undefined) {
        throw new Error("RPC 응답에 result가 없습니다.");
    }

    return data.result;
}

// Wei 단위의 16진수 잔액을 ETH로 변환
function weiToEth(hexWei) {
    const wei = BigInt(hexWei);
    const WEI_PER_ETH = 1000000000000000000n;

    // 정수 부분
    const whole = wei / WEI_PER_ETH;

    // 소수 부분
    const fraction = (wei % WEI_PER_ETH)
        .toString()
        .padStart(18, "0")
        .replace(/0+$/, "");

    if (fraction === "") {
        return `${whole} ETH`;
    }

    return `${whole}.${fraction} ETH`;
}

// 블록 번호를 16진수에서 10진수로 변환
function hexToDecimal(hexValue) {
    return BigInt(hexValue).toString(10);
}

// 조회 버튼 클릭
searchButton.addEventListener("click", async () => {
    const address = addressInput.value.trim();

    if (address === "") {
        statusText.textContent = "지갑 주소를 입력해 주세요.";
        return;
    }

    statusText.textContent = "Ethereum 서버에 요청 중...";

    try {
        // 지갑 잔액 조회
        const balance = await rpcRequest(
            "eth_getBalance",
            [address, "latest"]
        );

        // 현재 블록 번호 조회
        const blockNumber = await rpcRequest(
            "eth_blockNumber",
            []
        );

        // 원본 데이터 확인
        console.log("잔액 원본:", balance);
        console.log("블록 번호 원본:", blockNumber);

        // 16진수 응답 변환
        const ethBalance = weiToEth(balance);
        const decimalBlock = hexToDecimal(blockNumber);

        // 변환한 데이터를 화면에 표시
        balanceText.textContent = ethBalance;
        blockNumberText.textContent = decimalBlock;

        statusText.textContent = "조회가 완료되었습니다.";

    } catch (error) {
        console.error("RPC 오류:", error);
        statusText.textContent =
            `요청 실패: ${error.message}`;
    }
});
