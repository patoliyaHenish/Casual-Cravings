import React, { useState } from "react";
import { Box, Button, CircularProgress, Link, TextField, Typography } from "@mui/material";
import { useVerifyOtpMutation, useResendOtpMutation } from "../features/api/authApi";
import { toast } from "sonner";

const VerifyOtp = ({ email, onSuccess }) => {
  const [otp, setOtp] = useState("");
  const [verifyOtp, { isLoading }] = useVerifyOtpMutation();
   const [resendOtp, { isLoading: resendLoading }] = useResendOtpMutation();
  const [resendDisabled, setResendDisabled] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await verifyOtp({ email, otp }).unwrap();
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
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-xs">
        <TextField
          label="OTP"
          name="otp"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          required
          fullWidth
          variant="outlined"
          size="medium"
          inputProps={{ maxLength: 6, className: "text-center tracking-widest text-lg" }}
        />
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