import { Link, useSearchParams } from "react-router-dom";

export function PaymentFailPage() {
  const [searchParams] = useSearchParams();

  const message = searchParams.get("message") || "에러 메시지가 없습니다.";
  const code = searchParams.get("code") || "에러 코드 없음";

  return (
    <div id="info" className="box_section" style={{ width: "600px" }}>
      <img
        width="100px"
        src="https://static.toss.im/lotties/error-spot-no-loop-space-apng.png"
        alt="에러 이미지"
      />
      <h2>❌ 결제를 실패했어요</h2>

      <div className="p-grid typography--p" style={{ marginTop: "50px" }}>
        <div className="p-grid-col text--left">
          <b>에러 메시지</b>
        </div>
        <div className="p-grid-col text--right" id="message">{message}</div>
      </div>
      <div className="p-grid typography--p" style={{ marginTop: "10px" }}>
        <div className="p-grid-col text--left">
          <b>에러 코드</b>
        </div>
        <div className="p-grid-col text--right" id="code">{code}</div>
      </div>

      <div className="p-grid-col" style={{ marginTop: "30px" }}>
        <Link to="https://docs.tosspayments.com/guides/v2/payment-widget/integration">
          <button className="button p-grid-col5">연동 문서</button>
        </Link>
        <Link to="https://discord.gg/A4fRFXQhRu">
          <button
            className="button p-grid-col5"
            style={{ backgroundColor: "#e8f3ff", color: "#1b64da" }}
          >
            실시간 문의
          </button>
        </Link>
        <Link to="/">
          <button className="button p-grid-col5" style={{ marginTop: "10px" }}>
            🏠 홈으로 돌아가기
          </button>
        </Link>
      </div>
    </div>
  );
}

export default PaymentFailPage;
