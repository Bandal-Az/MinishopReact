import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export function PaymentSuccessPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  // We no longer need responseData state if we're not displaying it
  // const [responseData, setResponseData] = useState(null);

  useEffect(() => {
    async function confirm() {
      const requestData = {
        orderId: searchParams.get("orderId"),
        amount: searchParams.get("amount"),
        paymentKey: searchParams.get("paymentKey"),
      };

      const response = await fetch(`http://localhost:8080/api/payments/toss/confirm?orderId=${requestData.orderId}&paymentKey=${requestData.paymentKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include',
      });

      const json = await response.json();

      if (!response.ok) {
        throw { message: json.message, code: json.code };
      }

      return json; // Still return json in case you need it for logging or future expansion
    }

    // We still call confirm to ensure the payment is verified on your backend,
    // but we don't store or display the response data on the UI.
    confirm()
      .then(() => {
        // Payment confirmed successfully, no need to set state
      })
      .catch((error) => {
        navigate(`/fail?code=${error.code}&message=${error.message}`);
      });
  }, [searchParams, navigate]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '80vh',
      padding: '20px',
      boxSizing: 'border-box'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '600px',
        padding: '40px',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        textAlign: 'center',
        boxShadow: '0 4px 8px rgba(0,0,0,0.05)',
        backgroundColor: '#fff'
      }}>
        <img
          width="100px"
          src="https://static.toss.im/illusts/check-blue-spot-ending-frame.png"
          alt="Payment Success"
          style={{ marginBottom: '20px' }}
        />
        <h2 style={{ fontSize: '2em', color: '#333', marginBottom: '30px' }}>결제가 완료되었습니다!</h2>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '10px 0',
          borderBottom: '1px solid #eee',
          fontSize: '1.1em',
          color: '#555'
        }}>
          <div style={{ fontWeight: 'bold' }}>결제금액</div>
          <div>{`${Number(searchParams.get("amount")).toLocaleString()}원`}</div>
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '10px 0',
          borderBottom: '1px solid #eee',
          fontSize: '1.1em',
          color: '#555'
        }}>
          <div style={{ fontWeight: 'bold' }}>주문번호</div>
          <div>{`${searchParams.get("orderId")}`}</div>
        </div>

        <p style={{ marginTop: '40px', fontSize: '1.1em', color: '#666' }}>
          주문해주셔서 감사합니다. 안전하게 상품을 준비하여 발송해 드리겠습니다.
        </p>
        <button
          onClick={() => navigate('/')}
          style={{
            marginTop: '30px',
            padding: '12px 25px',
            fontSize: '1.1em',
            fontWeight: 'bold',
            color: '#fff',
            backgroundColor: '#1b64da',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            transition: 'background-color 0.3s ease'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#154fb7'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#1b64da'}
        >
          쇼핑 계속하기
        </button>
      </div>
    </div>
  );
}

export default PaymentSuccessPage;