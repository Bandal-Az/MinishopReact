import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const RegisterPage = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    nickname: '',
    realName: '',
    phoneNumber: '',
    address: '',
  });

  const [emailSent, setEmailSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationMessage, setVerificationMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // 새로운 상태 추가: 필드별 메시지 및 유효성
  const [usernameMessage, setUsernameMessage] = useState('');
  const [nicknameMessage, setNicknameMessage] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [confirmPasswordMessage, setConfirmPasswordMessage] = useState('');
  const [isPasswordValid, setIsPasswordValid] = useState(false);

  // 백엔드 응답을 기다리기 위해 초기값은 false로 설정
  // 이 값이 true여야 회원가입 버튼이 활성화됩니다.
  const [isUsernameAvailable, setIsUsernameAvailable] = useState(false);
  const [isNicknameAvailable, setIsNicknameAvailable] = useState(false);


  // 이메일 유효성 체크 (간단한 정규식)
  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // 비밀번호 유효성 체크: 영문, 숫자, 특수문자 각 1개 이상, 8자 이상
  const validatePassword = (password) => {
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    const isLengthValid = password.length >= 8;

    if (!isLengthValid) {
      setPasswordMessage('비밀번호는 8자 이상이어야 합니다.');
      setIsPasswordValid(false);
      return false;
    }
    if (!hasLetter) {
      setPasswordMessage('비밀번호는 영문자를 포함해야 합니다.');
      setIsPasswordValid(false);
      return false;
    }
    if (!hasNumber) {
      setPasswordMessage('비밀번호는 숫자를 포함해야 합니다.');
      setIsPasswordValid(false);
      return false;
    }
    if (!hasSpecialChar) {
      setPasswordMessage('비밀번호는 특수문자를 포함해야 합니다.');
      setIsPasswordValid(false);
      return false;
    }
    setPasswordMessage('사용 가능한 비밀번호입니다.'); // 모든 조건 만족 시
    setIsPasswordValid(true);
    return true;
  };

  // 필수 필드 체크 (회원가입 버튼 활성화용)
  const canSubmit = () => {
    return (
      emailVerified &&
      isPasswordValid && // 비밀번호 유효성 추가
      form.password === form.confirmPassword && // 비밀번호 일치 확인
      isUsernameAvailable && // 아이디 중복 확인 완료
      (form.nickname.trim() === '' || isNicknameAvailable) && // 닉네임이 비어있거나, 입력했다면 중복 확인 완료
      form.username.trim() !== '' &&
      form.password.trim() !== '' &&
      form.confirmPassword.trim() !== ''
    );
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value,
    }));

    // 메시지 초기화
    setErrorMessage('');
    setVerificationMessage('');

    if (name === 'username') {
        setUsernameMessage(''); // 입력 시 메시지 초기화
        setIsUsernameAvailable(false); // 다시 입력하면 중복 확인 필요
    }
    if (name === 'nickname') {
        setNicknameMessage(''); // 입력 시 메시지 초기화
        setIsNicknameAvailable(false); // 다시 입력하면 중복 확인 필요
    }

    if (name === 'password') {
      validatePassword(value);
      if (form.confirmPassword.trim() !== '') { // confirmPassword가 비어있지 않을 때만 비교
        if (value === form.confirmPassword) {
          setConfirmPasswordMessage('비밀번호가 일치합니다.');
        } else {
          setConfirmPasswordMessage('비밀번호가 일치하지 않습니다.');
        }
      } else {
        setConfirmPasswordMessage(''); // confirmPassword가 비어있으면 메시지 비움
      }
    }
    if (name === 'confirmPassword') {
      if (form.password.trim() !== '') { // password가 비어있지 않을 때만 비교
        if (value === form.password) {
          setConfirmPasswordMessage('비밀번호가 일치합니다.');
        } else {
          setConfirmPasswordMessage('비밀번호가 일치하지 않습니다.');
        }
      } else {
        setConfirmPasswordMessage(''); // password가 비어있으면 메시지 비움
      }
    }
  };

  // 아이디 중복 확인 핸들러
  const handleUsernameBlur = async () => {
    if (!form.username.trim()) {
      setUsernameMessage('아이디를 입력해주세요.');
      setIsUsernameAvailable(false);
      return;
    }
    try {
      // 백엔드의 `/check-username` 엔드포인트를 호출
      const res = await fetch(`http://localhost:8080/api/members/check-username?username=${encodeURIComponent(form.username)}`);
      if (res.ok) {
        // 백엔드에서 `true` (중복) 또는 `false` (사용 가능)를 반환
        const isDuplicate = await res.json();
        if (isDuplicate) { // isDuplicate가 true이면 중복
          setUsernameMessage('이미 사용 중인 아이디입니다.');
          setIsUsernameAvailable(false); // 사용 불가
        } else { // isDuplicate가 false이면 사용 가능
          setUsernameMessage('사용 가능한 아이디입니다.');
          setIsUsernameAvailable(true); // 사용 가능
        }
      } else {
        // 서버에서 에러 응답 (예: 400, 500)
        const errorText = await res.text();
        setUsernameMessage(`아이디 중복 확인 실패: ${errorText || res.statusText}`);
        setIsUsernameAvailable(false);
      }
    } catch (error) {
      // 네트워크 자체 오류 (fetch 실패)
      console.error("아이디 중복 확인 중 네트워크 오류:", error);
      setUsernameMessage('아이디 중복 확인 중 네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      setIsUsernameAvailable(false);
    }
  };

  // 닉네임 중복 확인 핸들러
  const handleNicknameBlur = async () => {
    if (!form.nickname.trim()) {
      setNicknameMessage('닉네임을 입력해주세요.');
      setIsNicknameAvailable(false);
      return;
    }
    try {
      // 백엔드의 `/check-nickname` 엔드포인트를 호출
      const res = await fetch(`http://localhost:8080/api/members/check-nickname?nickname=${encodeURIComponent(form.nickname)}`);
      if (res.ok) {
        // 백엔드에서 `true` (중복) 또는 `false` (사용 가능)를 반환
        const isDuplicate = await res.json();
        if (isDuplicate) { // isDuplicate가 true이면 중복
          setNicknameMessage('이미 사용 중인 닉네임입니다.');
          setIsNicknameAvailable(false); // 사용 불가
        } else { // isDuplicate가 false이면 사용 가능
          setNicknameMessage('사용 가능한 닉네임입니다.');
          setIsNicknameAvailable(true); // 사용 가능
        }
      } else {
        // 서버에서 에러 응답 (예: 400, 500)
        const errorText = await res.text();
        setNicknameMessage(`닉네임 중복 확인 실패: ${errorText || res.statusText}`);
        setIsNicknameAvailable(false);
      }
    } catch (error) {
      // 네트워크 자체 오류 (fetch 실패)
      console.error("닉네임 중복 확인 중 네트워크 오류:", error);
      setNicknameMessage('닉네임 중복 확인 중 네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      setIsNicknameAvailable(false);
    }
  };


  const handleSendCode = async () => {
    if (!form.email) {
      setVerificationMessage('이메일을 입력해주세요.');
      return;
    }
    if (!isValidEmail(form.email)) {
      setVerificationMessage('유효한 이메일을 입력해주세요.');
      return;
    }
    try {
      const res = await fetch(`http://localhost:8080/api/email-verification/send?email=${encodeURIComponent(form.email)}`, {
        method: 'POST',
      });
      const text = await res.text();
      if (res.ok) {
        setEmailSent(true);
        setVerificationMessage('인증 코드가 이메일로 발송되었습니다.');
      } else {
        setVerificationMessage(text || '인증 코드 발송에 실패했습니다.');
      }
    } catch (error) {
      setVerificationMessage('인증 코드 발송 중 오류가 발생했습니다.');
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode) {
      setVerificationMessage('인증 코드를 입력해주세요.');
      return;
    }
    try {
      const res = await fetch('http://localhost:8080/api/email-verification/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, code: verificationCode }),
      });
      const text = await res.text();
      if (res.ok) {
        setEmailVerified(true);
        setVerificationMessage('이메일 인증이 완료되었습니다.');
        setErrorMessage('');
      } else {
        setVerificationMessage(text || '인증 코드가 잘못되었거나 만료되었습니다.');
        setEmailVerified(false);
      }
    } catch (error) {
      setVerificationMessage('인증 코드 확인 중 오류가 발생했습니다.');
      setEmailVerified(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!emailVerified) {
      setErrorMessage('이메일 인증을 완료해야 합니다.');
      return;
    }

    // 최종 유효성 검사 (클라이언트 측)
    if (!isPasswordValid) {
        setErrorMessage('비밀번호 요구사항을 만족해주세요.');
        return;
    }
    if (form.password !== form.confirmPassword) {
      setErrorMessage('비밀번호가 일치하지 않습니다.');
      return;
    }
    if (!isUsernameAvailable) {
        setErrorMessage('아이디 중복 확인을 완료하거나 사용 가능한 아이디를 입력해주세요.');
        return;
    }
    // 닉네임은 선택사항이므로, 입력했을 경우에만 중복 확인 여부를 검사
    if (form.nickname.trim() !== '' && !isNicknameAvailable) {
        setErrorMessage('닉네임 중복 확인을 완료하거나 사용 가능한 닉네임을 입력해주세요.');
        return;
    }


    setErrorMessage('');

    try {
      const res = await fetch('http://localhost:8080/api/members/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        alert('회원가입이 완료되었습니다!');
        navigate('/login');
      } else {
        const errorText = await res.text();
        setErrorMessage(errorText || '회원가입에 실패했습니다.');
      }
    } catch (error) {
      setErrorMessage('회원가입 중 오류가 발생했습니다.');
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>회원가입</h2>

      <form onSubmit={handleSubmit} style={styles.form}>

        <div style={styles.inputGroup}>
          <label style={styles.label}>아이디</label>
          <input
            name="username"
            type="text"
            value={form.username}
            onChange={handleChange}
            onBlur={handleUsernameBlur} // 아이디 중복 확인
            required
            style={styles.input}
            disabled={emailVerified}
          />
          {usernameMessage && (
            <div style={{ ...styles.fieldMessage, color: isUsernameAvailable ? '#28a745' : '#dc3545' }}>
              {usernameMessage}
            </div>
          )}
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>이메일</label>
          <div style={styles.emailInputWrapper}>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              disabled={emailVerified}
              style={styles.input}
            />
            <button
              type="button"
              onClick={handleSendCode}
              disabled={emailVerified || !isValidEmail(form.email)}
              style={{
                ...styles.button,
                ...styles.secondaryButton,
                cursor: emailVerified || !isValidEmail(form.email) ? 'not-allowed' : 'pointer'
              }}
            >
              인증 코드 받기
            </button>
          </div>
        </div>

        {emailSent && !emailVerified && (
          <div style={styles.inputGroup}>
            <label style={styles.label}>인증 코드 입력</label>
            <div style={styles.emailInputWrapper}>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                style={styles.input}
              />
              <button
                type="button"
                onClick={handleVerifyCode}
                style={{ ...styles.button, ...styles.secondaryButton }}
              >
                인증 코드 확인
              </button>
            </div>
          </div>
        )}

        {verificationMessage && (
          <div style={{ ...styles.fieldMessage, color: emailVerified ? '#28a745' : '#dc3545' }}>
            {verificationMessage}
          </div>
        )}

        <div style={styles.inputGroup}>
          <label style={styles.label}>비밀번호</label>
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
            style={styles.input}
            disabled={emailVerified}
          />
          {passwordMessage && (
            <div style={{ ...styles.fieldMessage, color: isPasswordValid ? '#28a745' : '#dc3545' }}>
              {passwordMessage}
            </div>
          )}
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>비밀번호 확인</label>
          <input
            name="confirmPassword"
            type="password"
            value={form.confirmPassword}
            onChange={handleChange}
            required
            style={styles.input}
            disabled={emailVerified}
          />
          {confirmPasswordMessage && (
            <div style={{ ...styles.fieldMessage, color: form.password === form.confirmPassword && form.confirmPassword.trim() !== '' ? '#28a745' : '#dc3545' }}>
              {confirmPasswordMessage}
            </div>
          )}
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>닉네임</label>
          <input
            name="nickname"
            type="text"
            value={form.nickname}
            onChange={handleChange}
            onBlur={handleNicknameBlur} // 닉네임 중복 확인
            style={styles.input}
            disabled={emailVerified}
          />
          {nicknameMessage && (
            <div style={{ ...styles.fieldMessage, color: isNicknameAvailable ? '#28a745' : '#dc3545' }}>
              {nicknameMessage}
            </div>
          )}
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>실명</label>
          <input
            name="realName"
            type="text"
            value={form.realName}
            onChange={handleChange}
            style={styles.input}
            disabled={emailVerified}
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>전화번호</label>
          <input
            name="phoneNumber"
            type="text"
            value={form.phoneNumber}
            onChange={handleChange}
            style={styles.input}
            disabled={emailVerified}
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>주소</label>
          <input
            name="address"
            type="text"
            value={form.address}
            onChange={handleChange}
            style={styles.input}
            disabled={emailVerified}
          />
        </div>

        {errorMessage && <div style={styles.errorMessage}>{errorMessage}</div>}

        <button
          type="submit"
          disabled={!canSubmit()}
          style={{
            ...styles.button,
            ...styles.primaryButton,
            backgroundColor: canSubmit() ? '#007bff' : '#e9ecef', // Light gray when disabled
            color: canSubmit() ? 'white' : '#6c757d', // Darker gray for disabled text
            cursor: canSubmit() ? 'pointer' : 'not-allowed'
          }}
        >
          회원가입
        </button>
      </form>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '900px', // Adjusted to balance content and side space
    margin: '3rem auto',
    padding: '35px',
    border: '1px solid #e0e0e0',
    borderRadius: '12px',
    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.06)',
    backgroundColor: '#ffffff',
    fontFamily: "'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  heading: {
    textAlign: 'center',
    marginBottom: '30px',
    color: '#212529',
    fontSize: '2rem',
    fontWeight: '700',
    letterSpacing: '-0.02em',
  },
  form: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  inputGroup: {
    marginBottom: '0',
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: '600',
    color: '#495057',
    fontSize: '0.9rem',
  },
  input: {
    width: '100%',
    padding: '13px 15px',
    border: '1px solid #dcdcdc',
    borderRadius: '8px',
    fontSize: '0.98rem',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
    backgroundColor: '#fefefe',
  },
  'input:focus': {
    borderColor: '#007bff',
    boxShadow: '0 0 0 3px rgba(0, 123, 255, 0.12)',
    outline: 'none',
    backgroundColor: '#ffffff',
  },
  emailInputWrapper: {
    display: 'flex',
    gap: '10px',
    alignItems: 'stretch',
  },
  button: {
    padding: '13px 20px',
    borderRadius: '8px',
    fontWeight: '600',
    fontSize: '0.9rem',
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease-in-out, transform 0.1s ease-in-out, box-shadow 0.2s ease-in-out',
    whiteSpace: 'nowrap',
  },
  primaryButton: {
    backgroundColor: '#007bff',
    color: 'white',
    boxShadow: '0 3px 10px rgba(0, 123, 255, 0.2)',
    marginTop: '15px',
    padding: '15px 22px',
    fontSize: '1.05rem',
  },
  secondaryButton: {
    backgroundColor: '#e9ecef',
    color: '#495057',
  },
  'button:hover': {
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
  },
  'primaryButton:hover': {
    backgroundColor: '#0056b3',
    boxShadow: '0 4px 12px rgba(0, 123, 255, 0.25)',
  },
  'secondaryButton:hover': {
    backgroundColor: '#dee2e6',
  },
  fieldMessage: { // New style for individual field messages
    marginTop: '5px',
    fontSize: '0.8rem',
    marginLeft: '5px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  errorMessage: {
    color: '#dc3545',
    marginBottom: '15px',
    textAlign: 'center',
    fontWeight: '500',
    fontSize: '0.9rem',
  },
};

export default RegisterPage;