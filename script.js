
const RPC_URL = "https://ethereum-rpc.publicnode.com";

const searchButton = document.querySelector("#search-button");
const addressInput = document.querySelector("#wallet-address");
const statusText = document.querySelector("#status");
const balanceText = document.querySelector("#balance");
const blockNumberText = document.querySelector("#block-number");

// Ethereum RPC 서버에 요청
async function rpcRequest(method, params) {
    let response;

    try {
        response = await fetch(RPC_URL, {
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
    } catch {
        // 인터넷 연결 문제, CORS 등 요청 실패
        throw new Error("네트워크 연결에 실패했습니다.");
    }

    if (!response.ok) {
        throw new Error(`서버 오류 (HTTP ${response.status})`);
    }

    let data;

    try {
        data = await response.json();
    } catch {
        throw new Error("서버 응답을 해석하지 못했습니다.");
    }

    if (data.error) {
        throw new Error(
            data.error.message || "RPC 요청에 실패했습니다."
        );
    }

    if (typeof data.result !== "string") {
        throw new Error("올바르지 않은 RPC 응답입니다.");
    }

    return data.result;
}

// 16진수 Wei 값을 ETH로 변환
function weiToEth(hexWei) {
    const wei = BigInt(hexWei);
    const WEI_PER_ETH = 1000000000000000000n;

    const whole = wei / WEI_PER_ETH;

    const fraction = (wei % WEI_PER_ETH)
        .toString()
        .padStart(18, "0")
        .replace(/0+$/, "");

    if (fraction === "") {
        return `${whole} ETH`;
    }

    return `${whole}.${fraction} ETH`;
}

// 16진수 블록 번호를 10진수로 변환
function hexToDecimal(hexValue) {
    return BigInt(hexValue).toString(10);
}

// 지갑 주소 형식 검사
function isValidAddress(address) {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
}

// 이전 조회 결과 초기화
function clearResults() {
    balanceText.textContent = "-";
    blockNumberText.textContent = "-";
}

// 조회 버튼 클릭
searchButton.addEventListener("click", async () => {
    const address = addressInput.value.trim();

    // 이전 결과 제거
    clearResults();

    // 빈 주소 검사
    if (address === "") {
        statusText.textContent = "지갑 주소를 입력해 주세요.";
        return;
    }

    // 주소 형식 검사
    if (!isValidAddress(address)) {
        statusText.textContent =
            "올바른 지갑 주소를 입력해 주세요. (0x + 40자리 16진수)";
        return;
    }

    // 로딩 상태 시작
    searchButton.disabled = true;
    searchButton.textContent = "조회 중...";
    statusText.textContent = "Ethereum 데이터를 불러오는 중...";

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

        // 응답 변환
        const ethBalance = weiToEth(balance);
        const decimalBlock = hexToDecimal(blockNumber);

        // 화면 표시
        balanceText.textContent = ethBalance;
        blockNumberText.textContent = decimalBlock;

        statusText.textContent = "조회가 완료되었습니다.";

    } catch (error) {
        console.error("조회 오류:", error);

        // 오류가 발생하면 결과를 표시하지 않음
        clearResults();
        statusText.textContent = `조회 실패: ${error.message}`;

    } finally {
        // 성공하거나 실패해도 버튼 복구
        searchButton.disabled = false;
        searchButton.textContent = "조회";
    }
});
