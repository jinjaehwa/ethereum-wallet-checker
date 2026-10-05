
const RPC_URL = "https://ethereum-rpc.publicnode.com";

const searchButton = document.querySelector("#search-button");
const addressInput = document.querySelector("#wallet-address");
const statusText = document.querySelector("#status");

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

// 조회 버튼을 클릭했을 때 실행
searchButton.addEventListener("click", async () => {
    const address = addressInput.value.trim();

    if (address === "") {
        statusText.textContent = "지갑 주소를 입력해 주세요.";
        return;
    }

    statusText.textContent = "Ethereum 서버에 요청 중...";

    try {
        // 지갑 잔액 요청
        const balance = await rpcRequest(
            "eth_getBalance",
            [address, "latest"]
        );

        // 현재 블록 번호 요청
        const blockNumber = await rpcRequest(
            "eth_blockNumber",
            []
        );

        // 아직 변환하지 않은 원본 응답
        console.log("잔액 원본:", balance);
        console.log("블록 번호 원본:", blockNumber);

        statusText.textContent =
            "RPC 연결 성공! 개발자 도구에서 응답을 확인하세요.";

    } catch (error) {
        console.error("RPC 오류:", error);
        statusText.textContent =
            `요청 실패: ${error.message}`;
    }
});
