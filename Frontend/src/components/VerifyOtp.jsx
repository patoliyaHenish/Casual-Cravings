import React, { useState, useRef } from "react";
import { Box, Button, CircularProgress, Link, Typography } from "@mui/material";
import { useVerifyOtpMutation, useResendOtpMutation } from "../features/api/authApi";
import { toast } from "react-toastify";

const VerifyOtp = ({ email, onSuccess }) => {
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [verifyOtp, { isLoading }] = useVerifyOtpMutation();
  const [resendOtp, { isLoading: resendLoading }] = useResendOtpMutation();
  const [resendDisabled, setResendDisabled] = useState(false);
  const inputsRef = [useRef(null), useRef(null), useRef(null), useRef(null)];

  const handleChange = (e, idx) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[idx] = value;
    setOtp(newOtp);
    if (value && idx < 3) {
      inputsRef[idx + 1].current.focus();
    }
  };

  const handleKeyDown = (e, idx) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
      inputsRef[idx - 1].current.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await verifyOtp({ email, otp: otp.join("") }).unwrap();
      toast.success(res.message || "OTP verified successfully!");
      if (onSuccess) onSuccess();
    } catch (err) {
      toast.error(err?.data?.message || "Invalid or expired OTP.");
    }
  };

  const handleResendOtp = async () => {
    try {
      await resendOtp({ email }).unwrap();
      toast.success("OTP resent to your email.");
      setResendDisabled(true);
      setTimeout(() => setResendDisabled(false), 30000);
    } catch (err) {
      toast.error(err?.data?.message || "Failed to resend OTP.");
    }
  };

  return (
    <Box className="flex flex-col items-center gap-4 mt-6">
      <Typography variant="h6" className="font-bold text-[#3B2200]">
        Enter OTP sent to your email
      </Typography>
      <form onSubmit={handleSubmit} className="flex flex-col items-center w-full">
        <div className="flex gap-3 mb-6">
          {otp.map((digit, idx) => (
            <input
              key={idx}
              ref={inputsRef[idx]}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(e, idx)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              className="w-12 h-12 text-2xl text-center border border-gray-300 rounded focus:outline-none focus:border-blue-500 bg-gray-50"
              autoFocus={idx === 0}
            />
          ))}
        </div>
        <Button
          type="submit"
          variant="contained"
          fullWidth
          sx={{
            bgcolor: "#F97C1B",
            color: "#FFF8ED",
            fontWeight: "bold",
            "&:hover": { bgcolor: "#FFB15E", color: "#3B2200" },
            height: 48,
            fontSize: "1.1rem",
          }}
          disabled={isLoading}
        >
          {isLoading ? <CircularProgress size={24} color="inherit" /> : "Verify OTP"}
        </Button>
      </form>
      <Typography variant="body2" className="mt-2">
        Didn't receive OTP?{" "}
        <Link
          component="button"
          type="button"
          onClick={handleResendOtp}
          disabled={resendLoading || resendDisabled}
          underline="always"
          sx={{
            color: resendDisabled ? "#aaa" : "#F97C1B",
            fontWeight: "bold",
            cursor: resendDisabled ? "not-allowed" : "pointer",
          }}
        >
          {resendLoading ? "Resending..." : "Resend OTP"}
        </Link>
      </Typography>
    </Box>
  );
};

export default VerifyOtp;