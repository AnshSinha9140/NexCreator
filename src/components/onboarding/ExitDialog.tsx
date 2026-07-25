"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ExitDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmExit: () => void;
}

export const ExitDialog: React.FC<ExitDialogProps> = ({
  isOpen,
  onClose,
  onConfirmExit,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.8)",
            backdropFilter: "blur(12px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: "20px",
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            style={{
              width: "100%",
              maxWidth: "420px",
              background: "#0b0d16",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "18px",
              padding: "28px",
              boxShadow: "0 24px 60px rgba(0, 0, 0, 0.8)",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "14px",
                background: "rgba(244, 63, 94, 0.12)",
                border: "1px solid rgba(244, 63, 94, 0.25)",
                color: "#fb7185",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "20px",
                margin: "0 auto 16px",
              }}
            >
              ⚠️
            </div>

            <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#f8fafc", marginBottom: "8px" }}>
              Exit Onboarding Setup?
            </h3>
            <p style={{ fontSize: "13px", color: "#94a3b8", lineHeight: 1.5, marginBottom: "24px" }}>
              Your progress will be saved locally, so you can resume setup whenever you return.
            </p>

            <div style={{ display: "flex", gap: "12px" }}>
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary"
                style={{ flex: 1, padding: "10px" }}
              >
                Continue Setup
              </button>
              <button
                type="button"
                onClick={onConfirmExit}
                className="btn"
                style={{
                  flex: 1,
                  padding: "10px",
                  background: "rgba(244, 63, 94, 0.15)",
                  border: "1px solid rgba(244, 63, 94, 0.3)",
                  color: "#fb7185",
                }}
              >
                Yes, Exit
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
