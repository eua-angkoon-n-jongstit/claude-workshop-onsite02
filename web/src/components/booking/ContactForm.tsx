"use client";

import { useState } from "react";
import { validatePhone } from "@/lib/booking/validation";

export default function ContactForm({
  name,
  phone,
  note,
  onNameChange,
  onPhoneChange,
  onNoteChange,
  onBack,
  onNext,
}: {
  name: string;
  phone: string;
  note: string;
  onNameChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onNoteChange: (value: string) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const [nameErrorVisible, setNameErrorVisible] = useState(false);
  const [phoneErrorVisible, setPhoneErrorVisible] = useState(false);

  function handleNameChange(value: string) {
    onNameChange(value);
    if (value.trim()) setNameErrorVisible(false);
  }

  function handlePhoneChange(rawValue: string) {
    const stripped = rawValue.replace(/\D/g, "").slice(0, 10);
    onPhoneChange(stripped);
    if (validatePhone(stripped)) setPhoneErrorVisible(false);
  }

  function handleNext() {
    const trimmedName = name.trim();
    const nameValid = Boolean(trimmedName);
    const phoneValid = validatePhone(phone);

    setNameErrorVisible(!nameValid);
    setPhoneErrorVisible(!phoneValid);

    if (!nameValid || !phoneValid) return;
    onNext();
  }

  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold mb-1">ข้อมูลติดต่อ</h2>
        <p className="text-zinc-500 text-sm mb-4">กรอกชื่อและเบอร์โทรเพื่อยืนยันคิว</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-1.5">ชื่อ-นามสกุล</label>
        <input
          type="text"
          placeholder="เช่น สมชาย ใจดี"
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-zinc-800/70 border border-zinc-700 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition placeholder:text-zinc-500"
        />
        {nameErrorVisible && (
          <p className="text-red-400 text-xs mt-1.5">กรุณากรอกชื่อ-นามสกุล</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-1.5">เบอร์โทรศัพท์</label>
        <input
          type="tel"
          placeholder="0812345678"
          maxLength={10}
          value={phone}
          onChange={(e) => handlePhoneChange(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-zinc-800/70 border border-zinc-700 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition placeholder:text-zinc-500"
        />
        {phoneErrorVisible && (
          <p className="text-red-400 text-xs mt-1.5">กรุณากรอกเบอร์โทร 10 หลัก ขึ้นต้นด้วย 0</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-1.5">
          หมายเหตุ <span className="text-zinc-500 font-normal">(ไม่บังคับ)</span>
        </label>
        <textarea
          rows={2}
          placeholder="เช่น ทรงที่ต้องการ, ช่างที่เคยใช้บริการ"
          value={note}
          onChange={(e) => onNoteChange(e.target.value)}
          className="w-full px-4 py-3 rounded-xl bg-zinc-800/70 border border-zinc-700 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition placeholder:text-zinc-500 resize-none"
        ></textarea>
      </div>

      <div className="flex justify-between pt-2">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-3 rounded-xl bg-zinc-800 text-zinc-200 font-semibold hover:bg-zinc-700 transition-colors"
        >
          ← ย้อนกลับ
        </button>
        <button
          type="button"
          onClick={handleNext}
          className="px-6 py-3 rounded-xl bg-amber-500 text-zinc-950 font-semibold hover:bg-amber-400 transition-colors"
        >
          ถัดไป →
        </button>
      </div>
    </section>
  );
}
