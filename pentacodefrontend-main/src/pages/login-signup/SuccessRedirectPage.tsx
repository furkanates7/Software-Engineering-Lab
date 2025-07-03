import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Props {
  message?: string;
  redirectTo?: string;
}

export default function SuccessRedirectPage({
  message = '✅ Order placed successfully!',
  redirectTo = '/customer/restaurants',
}: Props) {
  const [countdown, setCountdown] = useState(3);
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    if (countdown === 0) {
      clearInterval(interval);
      navigate(redirectTo);
    }

    return () => clearInterval(interval);
  }, [countdown, navigate, redirectTo]);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-orange-100 text-green-800 text-2xl font-semibold">
      <p>{message}</p>
      <p className="mt-4 text-lg">Redirecting in {countdown}...</p>
    </div>
  );
}
